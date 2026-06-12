"use client";
import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, ExternalLink, Monitor, Maximize, WifiOff, Settings, Check, Star, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';

export default function PlayerPanel({ 
  activeChannel, 
  favorites, 
  onToggleFavorite, 
  onClose,
  isTheaterMode,
  onToggleTheaterMode,
  onNextChannel,
  onPrevChannel
}) {
  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const destroyPromiseRef = useRef(Promise.resolve());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shakaInstance, setShakaInstance] = useState(null);
  const [mpegtsInstance, setMpegtsInstance] = useState(null);
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

  // Initialize and attach Shaka Player
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

    // If it's a popup/iframe channel, just stop buffering and do nothing else
    if (activeChannel.iframeUrl) {
      setBuffering(false);
      setIsPlaying(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;
    let newShaka = null;
    let localMpegts = null;
    let currentUrlIndex = 0;
    const urlCount = activeChannel.urlCount || (Array.isArray(activeChannel.url) ? activeChannel.url.length : 1);

    const initPlayer = async (index) => {
      // Wait for any previous player to finish destroying before creating a new one
      await destroyPromiseRef.current;
      if (isCancelled || !videoRef.current) return; // Component unmounted or channel switched

      let rawUrl = Array.isArray(activeChannel.url) ? activeChannel.url[index] : activeChannel.url;
      
      // Interpolate Xtream variables if they exist in the URL
      if (rawUrl && typeof rawUrl === 'string') {
        rawUrl = rawUrl
          .replace('{XTREAM_HOST}', process.env.NEXT_PUBLIC_XTREAM_HOST || 'http://premiumtvs.space:80')
          .replace('{XTREAM_USER}', process.env.NEXT_PUBLIC_XTREAM_USER || '1Aoen7elp5')
          .replace('{XTREAM_PASS}', process.env.NEXT_PUBLIC_XTREAM_PASS || 'IgMJ60tmAa');
      }

      let streamUrl = rawUrl;
      
      const isMpegTs = rawUrl && (rawUrl.endsWith('.ts') || rawUrl.includes('.ts?'));
      
      // For MPEG-TS, it's a single file stream, so proxying the streamUrl works natively
      if (isMpegTs) {
        streamUrl = `${window.location.origin}/api/proxy?id=${activeChannel.id}&idx=${index}&url=${encodeURIComponent(rawUrl)}&t=${Date.now()}`;
      }

      if (newShaka) {
        await newShaka.destroy();
        newShaka = null;
      }
      if (localMpegts) {
        localMpegts.destroy();
        localMpegts = null;
      }

      try {
        // If it's a raw .ts stream (like Xtream Codes), use mpegts.js instead of Shaka
        if (rawUrl && (rawUrl.endsWith('.ts') || rawUrl.includes('.ts?'))) {
          const mpegts = await import('mpegts.js');
          if (mpegts.default.getFeatureList().mseLivePlayback) {
            const player = mpegts.default.createPlayer({
              type: 'mse',
              isLive: true,
              url: streamUrl
            });
            player.attachMediaElement(video);
            player.load();
            player.play().catch(e => console.log('MPEGTS Autoplay blocked:', e));
            localMpegts = player;
            setMpegtsInstance(player);
            setBuffering(false);
            
            player.on(mpegts.default.Events.ERROR, (errorType, errorDetail, errorInfo) => {
              console.error('MPEG-TS Error', errorType, errorDetail, errorInfo);
              if (currentUrlIndex < urlCount - 1) {
                currentUrlIndex++;
                initPlayer(currentUrlIndex);
              } else {
                setErrorMsg('Stream Error: ' + errorDetail);
                setBuffering(false);
              }
            });
          } else {
            setErrorMsg('MPEG-TS playback is not supported in this browser.');
            setBuffering(false);
          }
          return; // Stop here, don't init Shaka
        }

        const shaka = await import('shaka-player');
        shaka.polyfill.installAll();

        if (!shaka.Player.isBrowserSupported()) {
          setErrorMsg('Browser not supported');
          setBuffering(false);
          return;
        }

        newShaka = new shaka.Player();
        await newShaka.attach(video);

        const drmConfig = {};
        if (activeChannel.hasDrm) {
          try {
            const resp = await fetch(`${window.location.origin}/api/clearkey?id=${activeChannel.id}`, { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}) 
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data.keys && data.keys.length > 0) {
                const clearKeys = {};
                data.keys.forEach(k => {
                  clearKeys[k.kid] = k.k;
                });
                drmConfig.clearKeys = clearKeys;
              }
            }
          } catch(e) {
            console.error('Failed to fetch DRM keys', e);
          }
          
          if (drmConfig.clearKeys) {
            newShaka.configure('drm.clearKeys', drmConfig.clearKeys);
          }
        }

        // Add error event listener
        newShaka.addEventListener('error', (event) => {
          console.error('Shaka Error', event.detail);
          if (currentUrlIndex < urlCount - 1) {
            currentUrlIndex++;
            initPlayer(currentUrlIndex);
          } else {
            setErrorMsg('Stream Error: ' + (event.detail?.message || 'Playback failed'));
            setBuffering(false);
          }
        });

        // Intercept manifest to strip Widevine/PlayReady tags if we are forcing ClearKey
        if (activeChannel.hasDrm) {
          newShaka.getNetworkingEngine().registerResponseFilter((type, response) => {
            if (type === 0) { // shaka.net.NetworkingEngine.RequestType.MANIFEST
              let bodyText = new TextDecoder('utf-8').decode(response.data);
              bodyText = bodyText.replace(/<ContentProtection[^>]*urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed[^>]*>[\s\S]*?<\/ContentProtection>/gi, '');
              bodyText = bodyText.replace(/<ContentProtection[^>]*urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95[^>]*>[\s\S]*?<\/ContentProtection>/gi, '');
              response.data = new TextEncoder().encode(bodyText);
            }
          });
        }

        // Intercept requests if proxying is enabled
        if (activeChannel.proxy || activeChannel.useProxy || activeChannel.proxySegments) {
          newShaka.getNetworkingEngine().registerRequestFilter((type, request) => {
            if (request.uris[0] && request.uris[0].startsWith('http') && !request.uris[0].includes('/api/proxy')) {
              // type 0 = MANIFEST, type 1 = SEGMENT, type 2 = LICENSE
              const isManifestProxy = (activeChannel.proxy || activeChannel.useProxy) && type === 0;
              const isSegmentProxy = activeChannel.proxySegments && type === 1;
              const isLicenseProxy = activeChannel.proxySegments && type === 2;

              if (isManifestProxy || isSegmentProxy || isLicenseProxy) {
                request.uris[0] = `${window.location.origin}/api/proxy?id=${activeChannel.id}&url=${encodeURIComponent(request.uris[0])}`;
              }
            }
          });
        }
        
        // Listen to adaptation events to update autoHeight
        newShaka.addEventListener('adaptation', () => {
          if (newShaka) {
            const tracks = newShaka.getVariantTracks();
            const activeTrack = tracks.find(t => t.active);
            if (activeTrack && activeTrack.height) {
              setAutoHeight(`${activeTrack.height}p`);
            }
          }
        });

        await newShaka.load(streamUrl);
        
        // Load was successful
        setBuffering(false);
        setIsPlaying(true);
        video.play().catch(e => console.log('Autoplay blocked:', e));

        // Get video qualities
        const tracks = newShaka.getVariantTracks();
        if (tracks && tracks.length > 0) {
          const lvls = tracks
            .filter(t => t.type === 'variant' && t.height)
            .map(t => ({
              index: t.id,
              height: t.height,
              name: `${t.height}p`
            }))
            .filter((v, i, a) => a.findIndex(t => (t.height === v.height)) === i) // Keep unique heights
            .sort((a, b) => b.height - a.height);
          
          setLevels(lvls);
          
          // Initial auto height
          const activeTrack = tracks.find(t => t.active);
          if (activeTrack && activeTrack.height) {
            setAutoHeight(`${activeTrack.height}p`);
          }
        }

        setShakaInstance(newShaka);

      } catch (err) {
        console.error('Error loading shaka', err);
        if (currentUrlIndex < urlCount - 1) {
          currentUrlIndex++;
          initPlayer(currentUrlIndex);
        } else {
          setErrorMsg('Failed to load stream');
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
      isCancelled = true;
      if (lagTimeout) clearTimeout(lagTimeout);
      if (newShaka) {
        destroyPromiseRef.current = newShaka.destroy().catch(() => {});
      }
      if (localMpegts) {
        localMpegts.destroy();
      }
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

  const skipForward = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const skipBackward = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const isFav = favorites.includes(activeChannel.name);

  return (
    <div className="fullscreen-player-overlay" id="player-panel">
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
            <video id="video-player" playsInline ref={videoRef} onClick={togglePlay}></video>
          )}

          {/* Top Header Overlay inside Player */}
          <div className="player-top-overlay">
            <div className="player-top-left">
              {activeChannel.logo && activeChannel.logo.trim() !== '' && (
                <img 
                  src={activeChannel.logo} 
                  alt={activeChannel.name} 
                  className="player-channel-logo"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="player-channel-info">
                <h3>{activeChannel.name}</h3>
                <span>{activeChannel.group || 'Other'}</span>
              </div>
            </div>
            <div className="player-top-right">
              <button className="top-btn" onClick={() => onToggleFavorite(activeChannel.name)}>
                <Star size={20} style={{ fill: isFav ? 'var(--wc-gold)' : 'none', color: isFav ? 'var(--wc-gold)' : 'white' }} />
              </button>
              <button className="top-btn" onClick={onClose} aria-label="Close Player">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Center Controls & Side Arrows Overlay */}
          {!activeChannel.iframeUrl && (
            <div className="center-controls-overlay">
              <button className="side-nav-arrow left" onClick={(e) => { e.stopPropagation(); onPrevChannel && onPrevChannel(); }}>
                <ChevronLeft size={48} />
              </button>

              <div className="center-buttons-container">
                <button className="center-btn skip" onClick={skipBackward}>
                  <RotateCcw size={36} />
                  <span className="skip-text">10</span>
                </button>
                <button className="center-btn play-pause" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                  {isPlaying ? <Pause size={48} /> : <Play size={48} style={{ marginLeft: '4px' }} />}
                </button>
                <button className="center-btn skip" onClick={skipForward}>
                  <RotateCw size={36} />
                  <span className="skip-text">10</span>
                </button>
              </div>

              <button className="side-nav-arrow right" onClick={(e) => { e.stopPropagation(); onNextChannel && onNextChannel(); }}>
                <ChevronRight size={48} />
              </button>
            </div>
          )}
          
          {/* Bottom Custom Controls */}
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
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                <div className="volume-container">
                  <button className="volume-btn" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                <span className="time-display live-badge">LIVE</span>
              </div>
              <div className="controls-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {levels.length > 0 && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button 
                      className={`pip-btn ${showQualityMenu ? 'active' : ''}`} 
                      title="Video Quality" 
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      style={{ padding: '0 6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', borderRadius: '4px', height: '28px', color: showQualityMenu ? 'var(--color-accent)' : 'white' }}
                    >
                      <Settings size={16} />
                      <span style={{ fontSize: '11px' }}>
                        {currentLevel === -1 
                          ? `Auto${autoHeight ? ` (${autoHeight})` : ''}` 
                          : levels.find(l => l.index === currentLevel)?.name || 'HD'}
                      </span>
                    </button>
                    {showQualityMenu && (
                      <div className="quality-menu" style={{
                        position: 'absolute',
                        bottom: '40px',
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
                            if (shakaInstance) {
                              shakaInstance.configure({ abr: { enabled: true } });
                              setCurrentLevel(-1);
                            }
                            setShowQualityMenu(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: currentLevel === -1 ? 'var(--color-accent)' : 'white',
                            padding: '8px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
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
                          {currentLevel === -1 && <Check size={14} />}
                        </button>
                        {levels.map(level => (
                          <button 
                            key={level.index}
                            onClick={() => {
                              if (shakaInstance) {
                                shakaInstance.configure({ abr: { enabled: false } });
                                const tracks = shakaInstance.getVariantTracks();
                                const targetTrack = tracks.find(t => t.height === level.height);
                                if (targetTrack) {
                                  shakaInstance.selectVariantTrack(targetTrack, true);
                                }
                                setCurrentLevel(level.index);
                              }
                              setShowQualityMenu(false);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: currentLevel === level.index ? 'var(--color-accent)' : 'white',
                              padding: '8px 16px',
                              textAlign: 'left',
                              fontSize: '12px',
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
                            {currentLevel === level.index && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button className="pip-btn" title="Picture in Picture" onClick={handlePiP}>
                  <ExternalLink size={18} />
                </button>
                <button className="fullscreen-btn" title="Fullscreen" onClick={handleFullscreen}>
                  <Maximize size={18} />
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
    </div>
  );
}
