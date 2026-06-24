"use client";
import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, Square, Volume2, VolumeX, ExternalLink, Monitor, Maximize, WifiOff, Settings, Check, Star, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';
import Hls from 'hls.js';

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
  const [hlsInstance, setHlsInstance] = useState(null);
  const [mpegtsInstance, setMpegtsInstance] = useState(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 means Auto
  const [autoHeight, setAutoHeight] = useState('');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const controlsTimeoutRef = useRef(null);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.seekable && videoRef.current.seekable.length > 0) {
        const seekableEnd = videoRef.current.seekable.end(videoRef.current.seekable.length - 1);
        const current = videoRef.current.currentTime;
        const delay = Math.round(seekableEnd - current);
        if (delay > 2) {
          setDelaySeconds(delay);
        } else {
          setDelaySeconds(0);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hlsInstance, mpegtsInstance]);

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

  // Initialize and attach Player
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

    if (activeChannel.iframeUrl || activeChannel.useNativeVideo) {
      setBuffering(false);
      setIsPlaying(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;
    let newHls = null;
    let localMpegts = null;
    let currentUrlIndex = 0;
    const urlCount = activeChannel.urlCount || (Array.isArray(activeChannel.url) ? activeChannel.url.length : 1);

    const initPlayer = async (index, retryCount = 0) => {
      await destroyPromiseRef.current;
      if (isCancelled || !videoRef.current) return;

      if (videoRef.current) {
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }

      let rawUrl = Array.isArray(activeChannel.url) ? activeChannel.url[index] : activeChannel.url;
      
      if (rawUrl && typeof rawUrl === 'string') {
        rawUrl = rawUrl
          .replace('{XTREAM_HOST}', process.env.NEXT_PUBLIC_XTREAM_HOST || 'https://premiumtvs.space')
          .replace('{XTREAM_USER}', process.env.NEXT_PUBLIC_XTREAM_USER || '1Aoen7elp5')
          .replace('{XTREAM_PASS}', process.env.NEXT_PUBLIC_XTREAM_PASS || 'IgMJ60tmAa');
      }

      let streamUrl = rawUrl;
      const isMpegTs = rawUrl && (rawUrl.endsWith('.ts') || rawUrl.includes('.ts?'));
      
      if (isMpegTs && rawUrl.startsWith('http://')) {
        streamUrl = `${window.location.origin}/api/proxy?id=${activeChannel.id}&idx=${index}&url=${encodeURIComponent(rawUrl)}&t=${Date.now()}`;
      } else if (!isMpegTs && (activeChannel.proxy || activeChannel.useProxy) && rawUrl.startsWith('http://')) {
        streamUrl = `${window.location.origin}/api/proxy?id=${activeChannel.id}&idx=${index}&url=${encodeURIComponent(rawUrl)}&t=${Date.now()}`;
      }

      if (newHls) {
        newHls.destroy();
        newHls = null;
      }
      if (localMpegts) {
        localMpegts.destroy();
        localMpegts = null;
      }

      try {
        if (isMpegTs) {
          const mpegts = await import('mpegts.js');
          if (mpegts.default.LoggingControl) {
            mpegts.default.LoggingControl.enableAll = false;
          }
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
              if (retryCount < 5) {
                setBuffering(true);
                setTimeout(() => {
                  if (!isCancelled) initPlayer(index, retryCount + 1);
                }, 3000);
              } else if (currentUrlIndex < urlCount - 1) {
                currentUrlIndex++;
                initPlayer(currentUrlIndex, 0);
              } else {
                setErrorMsg('Stream Error: ' + errorDetail);
                setBuffering(false);
              }
            });
          } else {
            setErrorMsg('MPEG-TS playback is not supported in this browser.');
            setBuffering(false);
          }
          return;
        }

        // --- HLS.JS Initialization ---
        if (Hls.isSupported()) {
            class ProxyLoader extends Hls.DefaultConfig.loader {
               constructor(config) {
                 super(config);
                 const originalLoad = this.load.bind(this);
                 this.load = (context, loaderConfig, callbacks) => {
                    if (activeChannel.proxy || activeChannel.useProxy || activeChannel.proxySegments) {
                       if (context.url.startsWith('http') && !context.url.includes('/api/proxy')) {
                          context.url = `${window.location.origin}/api/proxy?id=${activeChannel.id}&url=${encodeURIComponent(context.url)}`;
                       }
                    }
                    originalLoad(context, loaderConfig, callbacks);
                 };
               }
            }

            class FragmentProxyLoader extends Hls.DefaultConfig.loader {
               constructor(config) {
                 super(config);
                 const originalLoad = this.load.bind(this);
                 this.load = (context, loaderConfig, callbacks) => {
                    if (activeChannel.proxySegments || activeChannel.useProxy) {
                       if (context.url.startsWith('http') && !context.url.includes('/api/proxy')) {
                          context.url = `${window.location.origin}/api/proxy?id=${activeChannel.id}&url=${encodeURIComponent(context.url)}`;
                       }
                    }
                    originalLoad(context, loaderConfig, callbacks);
                 };
               }
            }

            const hlsConfig = {
              autoStartLoad: true,
              startPosition: -1,
              maxBufferLength: activeChannel.bufferless ? 10 : 60,
              liveSyncDurationCount: activeChannel.bufferless ? 2 : 3,
              pLoader: ProxyLoader,
              fLoader: FragmentProxyLoader
            };

          if (activeChannel.hasDrm || activeChannel.drm) {
             let clearKeys = {};
             if (activeChannel.drm && activeChannel.drm.key) {
               let keyStr = activeChannel.drm.key;
               if (keyStr.startsWith('{')) {
                 try {
                   let parsed = JSON.parse(keyStr);
                   if (parsed.keys) {
                     parsed.keys.forEach(k => { clearKeys[hexToBase64Url(k.kid)] = hexToBase64Url(k.k); });
                   }
                 } catch(e) {}
               } else if (keyStr.includes(':')) {
                 let [kidHex, keyHex] = keyStr.split(':');
                 clearKeys[hexToBase64Url(kidHex)] = hexToBase64Url(keyHex);
               }
             }
             if (Object.keys(clearKeys).length > 0) {
                hlsConfig.emeEnabled = true;
                hlsConfig.drmSystemOptions = {
                   clearKeys: clearKeys
                };
             }
          }

          newHls = new Hls(hlsConfig);
          
          newHls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
             setBuffering(false);
             setIsPlaying(true);
             video.play().catch(e => console.log('Autoplay blocked:', e));
             
             const lvls = data.levels.map((l, i) => {
                let qName = `${l.height}p`;
                if (l.height >= 2160) qName = '4K (UHD)';
                else if (l.height >= 1440) qName = '2K (QHD)';
                else if (l.height >= 1080) qName = '1080p (FHD)';
                else if (l.height >= 720) qName = '720p (HD)';
                return { index: i, height: l.height, name: qName };
             }).sort((a, b) => b.height - a.height);
             setLevels(lvls);
          });

          newHls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
             const level = newHls.levels[data.level];
             if (level && level.height) {
                let hName = `${level.height}p`;
                if (level.height >= 2160) hName = '4K';
                else if (level.height >= 1440) hName = '2K';
                setAutoHeight(hName);
             }
          });

          newHls.on(Hls.Events.ERROR, (event, data) => {
             if (data.fatal) {
                switch (data.type) {
                   case Hls.ErrorTypes.NETWORK_ERROR:
                      if (currentUrlIndex < urlCount - 1) {
                         currentUrlIndex++;
                         initPlayer(currentUrlIndex);
                      } else {
                         newHls.startLoad();
                      }
                      break;
                   case Hls.ErrorTypes.MEDIA_ERROR:
                      newHls.recoverMediaError();
                      break;
                   default:
                      if (currentUrlIndex < urlCount - 1) {
                         currentUrlIndex++;
                         initPlayer(currentUrlIndex);
                      } else {
                         newHls.destroy();
                         setErrorMsg('Stream Error: ' + data.details);
                         setBuffering(false);
                      }
                      break;
                }
             }
          });

          newHls.loadSource(streamUrl);
          newHls.attachMedia(video);
          setHlsInstance(newHls);

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Fallback for native Safari
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
             setBuffering(false);
             video.play().catch(e => console.log('Autoplay blocked:', e));
          });
        } else {
          setErrorMsg('HLS is not supported in this browser.');
          setBuffering(false);
        }

      } catch (err) {
        console.error('Error loading player', err);
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
      if (newHls) {
        newHls.destroy();
      }
      if (localMpegts) {
        localMpegts.destroy();
      }
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeAttribute('src');
      video.load();
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

  const jumpToLive = () => {
    if (videoRef.current && videoRef.current.seekable && videoRef.current.seekable.length > 0) {
      videoRef.current.currentTime = videoRef.current.seekable.end(videoRef.current.seekable.length - 1);
    }
    setDelaySeconds(0);
    if (!isPlaying) togglePlay();
  };

  const isFav = favorites.includes(activeChannel.name);

  return (
    <div className="fullscreen-player-overlay" id="player-panel">
      <div 
        className={`player-container ${!showControls && isPlaying ? 'controls-hidden' : ''}`}
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <div className="video-wrapper" ref={videoWrapperRef}>
          {activeChannel.iframeUrl ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'white' }}>
              <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>This channel requires opening in a separate window due to network security.</p>
              <button 
                onClick={() => {
                  const targetUrl = activeChannel.iframeUrl.startsWith('roarzone://') 
                    ? `https://tv.roarzone.net/player.php?stream=${activeChannel.iframeUrl.replace('roarzone://', '')}` 
                    : activeChannel.iframeUrl;
                  window.open(targetUrl, '_blank', 'width=800,height=600');
                }}
                style={{ padding: '10px 20px', borderRadius: '6px', background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Open Stream Window
              </button>
            </div>
          ) : activeChannel.useNativeVideo ? (
            <video id="video-player" controls autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }} src={activeChannel.url}></video>
          ) : (
            <video id="video-player" playsInline ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}></video>
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
          
          {/* Bottom Custom Controls */}
          {!activeChannel.iframeUrl && (
            <div className="player-controls" id="player-controls" style={{ background: '#080808', padding: '12px 20px', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingLeft: '4px' }}>
                <span style={{ color: delaySeconds > 0 ? '#94a3b8' : '#ff0000', fontSize: '12px', marginRight: '6px', transition: 'color 0.3s' }}>●</span>
                <span style={{ color: delaySeconds > 0 ? '#94a3b8' : 'white', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', marginRight: '10px', transition: 'color 0.3s' }}>LIVE</span>
                {delaySeconds > 0 && (
                  <button 
                    onClick={jumpToLive}
                    style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid #ff0000', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: '#ff0000', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,0,0,0.2)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,0,0,0.1)'; }}
                  >
                    -{delaySeconds}s Behind (Click to go Live)
                  </button>
                )}
              </div>
              <div className="controls-row">
                <div className="controls-left">
                  <button className="play-btn" onClick={togglePlay} style={{ color: 'white' }}>
                    {isPlaying ? <Square size={16} strokeWidth={3} /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <div className="volume-container">
                    <button className="volume-btn" onClick={toggleMute} style={{ color: 'white' }}>
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input 
                      type="range" 
                      className="volume-slider sportzify-slider" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>
              <div className="controls-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(levels.length > 0 || mpegtsInstance) && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button 
                      className={`pip-btn ${showQualityMenu && levels.length > 0 ? 'active' : ''}`} 
                      title={mpegtsInstance ? "Direct Source Stream" : "Video Quality"} 
                      onClick={() => levels.length > 0 && setShowQualityMenu(!showQualityMenu)}
                      style={{ padding: '0 6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', borderRadius: '4px', height: '28px', color: showQualityMenu && levels.length > 0 ? 'var(--color-accent)' : 'white', cursor: mpegtsInstance ? 'default' : 'pointer' }}
                    >
                      <Settings size={16} />
                      <span style={{ fontSize: '11px' }}>
                        {mpegtsInstance 
                          ? 'Source' 
                          : (currentLevel === -1 
                            ? `Auto${autoHeight ? ` (${autoHeight})` : ''}` 
                            : levels.find(l => l.index === currentLevel)?.name || 'HD')}
                      </span>
                    </button>
                    {showQualityMenu && levels.length > 0 && (
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
                <button className="pip-btn" title="Picture in Picture" onClick={handlePiP} style={{ color: 'white' }}>
                  <Monitor size={18} />
                </button>
                <button className="fullscreen-btn" title="Fullscreen" onClick={handleFullscreen}>
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          )}

          {buffering && !errorMsg && (
            <div className="player-overlay" id="player-buffering">
              <div className="spinner"></div>
              <p>Connecting stream...</p>
            </div>
          )}

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
