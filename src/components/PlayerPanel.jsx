"use client";
import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, ExternalLink, Monitor, Maximize, WifiOff, Settings, Check } from 'lucide-react';

export default function PlayerPanel({ 
  activeChannel, 
  favorites, 
  onToggleFavorite, 
  onClose,
  isTheaterMode,
  onToggleTheaterMode
}) {
  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hlsInstance, setHlsInstance] = useState(null);
  const [dashInstance, setDashInstance] = useState(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 means Auto
  const [autoHeight, setAutoHeight] = useState('');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Helper for converting hex DRM keys to base64url
  const hexToBase64Url = (hexString) => {
    if (hexString.length % 2 !== 0) return hexString;
    try {
      const hexArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
      const bytes = new Uint8Array(hexArray);
      let binaryString = '';
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binaryString);
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch(e) {
      return hexString;
    }
  };

  // Initialize and attach Player (HLS or DASH)
  useEffect(() => {
    if (!activeChannel) return;

    // Reset player state
    setBuffering(true);
    setErrorMsg('');
    setIsPlaying(false);
    setLevels([]);
    setCurrentLevel(-1);
    setAutoHeight('');
    setShowQualityMenu(false);

    if (hlsInstance) hlsInstance.destroy();
    if (dashInstance) dashInstance.reset();

    // If it's a popup/iframe channel, just stop buffering and do nothing else
    if (activeChannel.iframeUrl) {
      setBuffering(false);
      setIsPlaying(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let newHls = null;
    let newDash = null;
    let currentUrlIndex = 0;
    const urlCount = activeChannel.urlCount || 1;

    const initPlayer = async (index) => {
      const streamUrl = `/api/proxy?id=${activeChannel.id}&idx=${index}&t=${Date.now()}`;

      // Reset previous dash instance if we are retrying
      if (newDash) {
        newDash.reset();
        newDash = null;
      }
      if (newHls) {
        newHls.destroy();
        newHls = null;
      }

      if (activeChannel.isDash || (activeChannel.drm && activeChannel.drm.type)) {
        // Initialize Dash.js for MPEG-DASH streams (with or without DRM)
        try {
          const dashjsModule = await import('dashjs');
          const dashjs = dashjsModule.default || dashjsModule;
          newDash = dashjs.MediaPlayer().create();
          
          // Route dashjs requests through our proxy
          newDash.extend("RequestModifier", function () {
            return {
              modifyRequestURL: function (request) {
                let url = request.url;
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  if (!url.includes('/api/proxy') && !url.includes('/api/football-data')) {
                    // Note: We don't have client-side encryption, but since we are replacing URLs here,
                    // we'll just proxy it with the raw URL. To fix the exposed URL, we would need 
                    // an API endpoint to encrypt it or just let dash.js fetch relative URLs.
                    return window.location.origin + '/api/proxy?url=' + encodeURIComponent(url);
                  }
                }
                return url;
              }
            };
          });

          // Setup DRM Protection Data
          let protectionData = null;
          if (activeChannel.drm && activeChannel.drm.key) {
            let keyStr = activeChannel.drm.key;
            if (keyStr.startsWith('{')) {
              try {
                let parsed = JSON.parse(keyStr);
                if (parsed.keys && parsed.keys.length > 0) {
                  let clearkeys = {};
                  parsed.keys.forEach(k => { clearkeys[k.kid] = k.k; });
                  protectionData = { 'org.w3.clearkey': { clearkeys } };
                }
              } catch (e) {
                console.error("Invalid DRM JSON key", e);
              }
            } else if (keyStr.includes(':')) {
              let [kidHex, keyHex] = keyStr.split(':');
              protectionData = {
                'org.w3.clearkey': {
                  clearkeys: {
                    [hexToBase64Url(kidHex)]: hexToBase64Url(keyHex)
                  }
                }
              };
            }
          }

          // Configure settings BEFORE initialize so dash.js knows about ClearKey upfront
          newDash.updateSettings({
            streaming: {
              protection: {
                keepProtectionMediaKeys: true
              },
              cmcd: {
                enabled: false
              }
            }
          });

          if (protectionData) {
            newDash.setProtectionData(protectionData);
          }

          newDash.initialize(video, streamUrl, true);

          newDash.on(dashjs.MediaPlayer.events.ERROR, (e) => {
            if (e.error === 'download') {
              if (currentUrlIndex < urlCount - 1) {
                currentUrlIndex++;
                initPlayer(currentUrlIndex);
                return;
              }
              setErrorMsg('Dash Stream Error');
              setBuffering(false);
            }
          });

          newDash.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, () => {
             setIsPlaying(true);
             setBuffering(false);
          });

          setDashInstance(newDash);

        } catch (err) {
          console.error("Dash.js load failed", err);
          setErrorMsg('Failed to load Dash player');
          setBuffering(false);
        }

      } else {
        // Initialize HLS.js for .m3u8 streams
        if (window.Hls && window.Hls.isSupported()) {
          newHls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 15,
            liveSyncDurationCount: 1,
            liveMaxLatencyDurationCount: 2,
            maxBufferLength: 10,
            liveDurationIntersectionY: 0,
            xhrSetup: function(xhr, url) {
              if (url.startsWith('http://') || url.startsWith('https://')) {
                if (!url.includes('/api/proxy') && !url.includes('/api/football-data')) {
                  // Actually the proxy is handling this directly through the initial m3u8 token replacement.
                  // But just in case any stray URLs are fetched, we let the proxy encrypt them.
                  // Wait, we don't have `encryptUrl` on the client, so we can't encrypt here!
                  // Luckily, the proxy already encrypted all links inside the m3u8.
                  // Any absolute URL here should have already been encrypted by the proxy.
                  // If it wasn't, we can't proxy it correctly without exposing it.
                  // We'll leave it as is, or use a fallback if needed.
                }
              }
            }
          });
          
          newHls.loadSource(streamUrl);
          newHls.attachMedia(video);

          newHls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const activeLvl = newHls.levels[data.level];
            if (activeLvl) {
              setAutoHeight(activeLvl.height ? `${activeLvl.height}p` : '');
            }
          });

          newHls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            if (newHls.levels && newHls.levels.length > 0) {
              const lvls = newHls.levels.map((lvl, idx) => ({
                index: idx,
                height: lvl.height,
                name: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`
              }));
              lvls.sort((a, b) => b.height - a.height);
              setLevels(lvls);
            }

            video.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.log('Autoplay blocked:', err));
          });

          newHls.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case window.Hls.ErrorTypes.NETWORK_ERROR:
                  if (currentUrlIndex < urlCount - 1) {
                    currentUrlIndex++;
                    initPlayer(currentUrlIndex);
                  } else {
                    setErrorMsg('Server Offline');
                    setBuffering(false);
                  }
                  break;
                case window.Hls.ErrorTypes.MEDIA_ERROR:
                  newHls.recoverMediaError();
                  break;
                default:
                  setErrorMsg('Feed Unavailable');
                  setBuffering(false);
                  newHls.destroy();
                  break;
              }
            }
          });

          setHlsInstance(newHls);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.onloadedmetadata = () => {
            video.play().catch(e => console.log(e));
          };
          video.onerror = () => {
            setErrorMsg('Load stream failed');
            setBuffering(false);
          };
        } else {
          setErrorMsg('HLS streaming not supported');
          setBuffering(false);
        }
      }
    };

    initPlayer(0);

    let lagTimeout = null;

    const onWaiting = () => {
      setBuffering(true);
      if (urlCount > 1) {
        lagTimeout = setTimeout(() => {
          currentUrlIndex = (currentUrlIndex + 1) % urlCount;
          initPlayer(currentUrlIndex);
        }, 6000);
      }
    };

    const onPlaying = () => {
      setBuffering(false);
      setErrorMsg('');
      setIsPlaying(true);
      if (lagTimeout) clearTimeout(lagTimeout);
    };

    const onPause = () => {
      setIsPlaying(false);
      if (lagTimeout) clearTimeout(lagTimeout);
    };

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);

    return () => {
      if (lagTimeout) clearTimeout(lagTimeout);
      if (newHls) newHls.destroy();
      if (newDash) newDash.reset();
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
    };
  }, [activeChannel]);

  // Sync volume state to video ref
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Hotkeys handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (!activeChannel) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeChannel, isPlaying, isMuted, volume]);

  if (!activeChannel) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.log(e));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handlePiP = async () => {
    try {
      const video = videoRef.current;
      if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  const handleFullscreen = async () => {
    const wrapper = videoWrapperRef.current;
    const video = videoRef.current;
    if (!wrapper) return;

    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

    if (!isFullscreen) {
      try {
        if (wrapper.requestFullscreen) {
          await wrapper.requestFullscreen();
          if (screen.orientation && typeof screen.orientation.lock === 'function') {
            await screen.orientation.lock('landscape').catch(err => console.warn(err));
          }
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitFS) {
        exitFS.call(document);
      }
    }
  };

  const isFav = favorites.includes(activeChannel.name);

  return (
    <aside className="player-panel open" id="player-panel">
      <div className="panel-header">
        <h2>Now Streaming</h2>
        <button className="close-panel" id="close-panel" aria-label="Close Player" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="player-container">
        <div className="video-wrapper" ref={videoWrapperRef}>
          {activeChannel.iframeUrl ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'white' }}>
              <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>This channel requires opening in a separate window due to network security.</p>
              <button 
                onClick={() => window.open(`https://tv.roarzone.net/player.php?stream=${activeChannel.iframeUrl.replace('roarzone://', '')}`, '_blank', 'width=800,height=600')}
                style={{ padding: '10px 20px', borderRadius: '6px', background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Open Stream Window
              </button>
            </div>
          ) : (
            <video id="video-player" playsInline ref={videoRef}></video>
          )}
          
          {/* Custom Controls */}
          {!activeChannel.iframeUrl && (
            <div className="player-controls" id="player-controls">
              <div className="controls-progress">
                <div className="progress-bar">
                  <div className="progress-filled" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="controls-row">
                <div className="controls-left">
                  <button className="play-btn" onClick={togglePlay}>
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                <div className="volume-container">
                  <button className="volume-btn" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input 
                    type="range" 
                    className="volume-slider" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                  />
                </div>
                <span className="time-display">Live Stream</span>
              </div>
              <div className="controls-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {levels.length > 0 && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button 
                      className={`pip-btn ${showQualityMenu ? 'active' : ''}`} 
                      title="Video Quality" 
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      style={{ padding: '0 6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', borderRadius: '4px', height: '28px', color: showQualityMenu ? 'var(--color-accent)' : 'white' }}
                    >
                      <Settings size={14} />
                      <span style={{ fontSize: '10px' }}>
                        {currentLevel === -1 
                          ? `Auto${autoHeight ? ` (${autoHeight})` : ''}` 
                          : levels.find(l => l.index === currentLevel)?.name || 'HD'}
                      </span>
                    </button>
                    {showQualityMenu && (
                      <div className="quality-menu" style={{
                        position: 'absolute',
                        bottom: '36px',
                        right: '0',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '6px 0',
                        minWidth: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 100,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        <button 
                          onClick={() => {
                            if (hlsInstance) {
                              hlsInstance.currentLevel = -1;
                              setCurrentLevel(-1);
                            }
                            setShowQualityMenu(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: currentLevel === -1 ? 'var(--color-accent)' : 'white',
                            padding: '6px 14px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: currentLevel === -1 ? '800' : '500',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>Auto (ABR)</span>
                          {currentLevel === -1 && <Check size={12} />}
                        </button>
                        {levels.map(level => (
                          <button 
                            key={level.index}
                            onClick={() => {
                              if (hlsInstance) {
                                hlsInstance.currentLevel = level.index;
                                setCurrentLevel(level.index);
                              }
                              setShowQualityMenu(false);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: currentLevel === level.index ? 'var(--color-accent)' : 'white',
                              padding: '6px 14px',
                              textAlign: 'left',
                              fontSize: '11px',
                              fontWeight: currentLevel === level.index ? '800' : '500',
                              cursor: 'pointer',
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span>{level.name}</span>
                            {currentLevel === level.index && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button className="pip-btn" title="Picture in Picture" onClick={handlePiP}>
                  <ExternalLink size={16} />
                </button>
                <button className={`theater-btn ${isTheaterMode ? 'active' : ''}`} title="Theater Mode" onClick={onToggleTheaterMode}>
                  <Monitor size={16} />
                </button>
                <button className="fullscreen-btn" title="Fullscreen" onClick={handleFullscreen}>
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Buffering Indicator Overlay */}
          {buffering && !errorMsg && (
            <div className="player-overlay" id="player-buffering">
              <div className="spinner"></div>
              <p>Connecting stream...</p>
            </div>
          )}

          {/* Offline/Error Overlay */}
          {errorMsg && (
            <div className="player-overlay error-overlay" id="player-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <WifiOff size={40} style={{ color: 'var(--wc-red)', marginBottom: '12px' }} />
              <p id="player-error-text" style={{ marginBottom: '16px' }}>{errorMsg}</p>

            </div>
          )}
        </div>
      </div>

      <div className="active-channel-details" id="active-channel-details">
        <div className="channel-main-info">
          {activeChannel.logo && activeChannel.logo.trim() !== '' ? (
            <img 
              src={activeChannel.logo} 
              alt={activeChannel.name} 
              className="active-channel-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          <div>
            <h3 id="active-channel-name">{activeChannel.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span id="active-channel-group" style={{ fontSize: '11px', color: 'var(--color-accent)' }}>{activeChannel.group || 'Other'}</span>
            </div>
          </div>
        </div>
        <div className="channel-actions" style={{ display: 'flex', gap: '8px' }}>
          <button className={`star-btn ${isFav ? 'active' : ''}`} onClick={() => onToggleFavorite(activeChannel.name)}>
            <Star size={16} style={{ fill: isFav ? 'currentColor' : 'none' }} />
            <span>{isFav ? 'Bookmarked' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// Inline Star Component for ease
function Star({ size, style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={style.fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
