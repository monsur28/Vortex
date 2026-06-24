"use client";
import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, Square, Volume2, VolumeX, ExternalLink, Monitor, Maximize, WifiOff, Settings, Check, Star, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';

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
  const [bitmovinInstance, setBitmovinInstance] = useState(null);
  const [mpegtsInstance, setMpegtsInstance] = useState(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 means Auto
  const [autoHeight, setAutoHeight] = useState('');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    // Timeout logic removed since we are using native controls
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bitmovinInstance && bitmovinInstance.isLive && bitmovinInstance.isLive()) {
        const shift = bitmovinInstance.getTimeShift();
        if (shift < -2) {
          setDelaySeconds(Math.abs(Math.round(shift)));
        } else {
          setDelaySeconds(0);
        }
      } else if (videoRef.current && videoRef.current.seekable && videoRef.current.seekable.length > 0) {
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
  }, [bitmovinInstance]);

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

    // If it's a popup/iframe channel or uses native video, just stop buffering and do nothing else with Bitmovin
    if (activeChannel.iframeUrl || activeChannel.useNativeVideo) {
      setBuffering(false);
      setIsPlaying(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;
    let newBitmovin = null;
    let localMpegts = null;
    let currentUrlIndex = 0;
    const urlCount = activeChannel.urlCount || (Array.isArray(activeChannel.url) ? activeChannel.url.length : 1);

    const initPlayer = async (index, retryCount = 0) => {
      // Wait for any previous player to finish destroying before creating a new one
      await destroyPromiseRef.current;
      if (isCancelled || !videoRef.current) return; // Component unmounted or channel switched

      // Reset video element to clear any previous MediaErrors
      if (videoRef.current) {
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }

      let rawUrl = Array.isArray(activeChannel.url) ? activeChannel.url[index] : activeChannel.url;
      
      // Interpolate Xtream variables if they exist in the URL
      if (rawUrl && typeof rawUrl === 'string') {
        rawUrl = rawUrl
          .replace('{XTREAM_HOST}', process.env.NEXT_PUBLIC_XTREAM_HOST || 'https://premiumtvs.space')
          .replace('{XTREAM_USER}', process.env.NEXT_PUBLIC_XTREAM_USER || '1Aoen7elp5')
          .replace('{XTREAM_PASS}', process.env.NEXT_PUBLIC_XTREAM_PASS || 'IgMJ60tmAa');
      }

      let streamUrl = rawUrl;
      
      const isMpegTs = rawUrl && (rawUrl.endsWith('.ts') || rawUrl.includes('.ts?'));
      
      // For MPEG-TS, it's a single file stream.
      // We only proxy it if it's HTTP, to avoid Mixed Content errors. If it's HTTPS, we can play it directly!
      if (isMpegTs && rawUrl.startsWith('http://')) {
        streamUrl = `${window.location.origin}/api/proxy?id=${activeChannel.id}&idx=${index}&url=${encodeURIComponent(rawUrl)}&t=${Date.now()}`;
      }

      if (newBitmovin) {
        await newBitmovin.destroy();
        newBitmovin = null;
      }
      if (localMpegts) {
        localMpegts.destroy();
        localMpegts = null;
      }

      try {
        // If it's a raw .ts stream (like Xtream Codes), use mpegts.js instead of Shaka
        if (rawUrl && (rawUrl.endsWith('.ts') || rawUrl.includes('.ts?'))) {
          const mpegts = await import('mpegts.js');
          if (mpegts.default.LoggingControl) {
            mpegts.default.LoggingControl.enableAll = false;
            mpegts.default.LoggingControl.enableDebug = false;
            mpegts.default.LoggingControl.enableInfo = false;
            mpegts.default.LoggingControl.enableWarn = false;
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
                console.log(`Stream dropped or MSE Error. Reconnecting... (Attempt ${retryCount + 1})`);
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
          return; // Stop here, don't init Shaka
        }

        const bitmovinModule = await import('bitmovin-player');
        const bitmovin = bitmovinModule.default || bitmovinModule;
        const Player = bitmovin.Player || bitmovinModule.Player;
        const PlayerEvent = bitmovin.PlayerEvent || bitmovinModule.PlayerEvent;
        const HttpRequestType = bitmovin.HttpRequestType || bitmovinModule.HttpRequestType;

        const config = {
          key: 'a68001f0-1a8c-4347-b14e-d0a9481165bd',
          playback: {
            autoplay: true,
            muted: isMuted,
          },
          tweaks: {
            app_id: 'com.iptv.app',
            startup_threshold: 4, // Wait for 4s of video to buffer before playing
            max_buffer_level: 60 // Allow up to 60s of buffer ahead
          },
          buffer: {
            video: {
              forwardduration: 40,
              backwardduration: 10
            },
            audio: {
              forwardduration: 40,
              backwardduration: 10
            }
          },
          adaptation: {
            desktop: {
              startupBitrate: 800000 // Start at a low bitrate to instantly load chunks
            },
            mobile: {
              startupBitrate: 500000
            }
          },
          network: {
            preprocessHttpRequest: (type, request) => {
                if (activeChannel.proxy || activeChannel.useProxy || activeChannel.proxySegments) {
                    if (request.url && request.url.startsWith('http') && !request.url.includes('/api/proxy')) {
                      if (activeChannel.proxy || activeChannel.useProxy || activeChannel.proxySegments) {
                        request.url = `${window.location.origin}/api/proxy?id=${activeChannel.id}&url=${encodeURIComponent(request.url)}`;
                      }
                    }
                }
                return Promise.resolve(request);
            }
          }
        };

        if (activeChannel.bufferless) {
            config.live = { lowLatency: true };
            config.tweaks = { ...config.tweaks, max_buffer_level: 5 };
        }

        let container = document.getElementById('bm-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'bm-container';
          container.style.position = 'absolute';
          container.style.inset = '0';
          container.style.zIndex = '0';
          videoRef.current.parentNode.insertBefore(container, videoRef.current);
          videoRef.current.style.display = 'none';
        }

        newBitmovin = new Player(container, config);

        const source = {
            title: activeChannel.name
        };
        
        if (streamUrl.includes('.mpd')) {
            source.dash = streamUrl;
        } else if (streamUrl.includes('.m3u8')) {
            source.hls = streamUrl;
        } else {
            source.hls = streamUrl; 
        }

        if (activeChannel.hasDrm || activeChannel.drm) {
          try {
            let clearKeys = [];
            
            // Extract keys directly from the channel object to avoid a network request
            if (activeChannel.drm && activeChannel.drm.key) {
              let keyStr = activeChannel.drm.key;
              if (keyStr.startsWith('{')) {
                try {
                  let parsed = JSON.parse(keyStr);
                  if (parsed.keys) {
                    parsed.keys.forEach(k => clearKeys.push({ kid: k.kid, key: k.k }));
                  }
                } catch(e) {}
              } else if (keyStr.includes(':')) {
                let [kidHex, keyHex] = keyStr.split(':');
                clearKeys.push({ kid: kidHex, key: keyHex });
              }
            }

            if (clearKeys.length > 0) {
              source.drm = {
                clearkey: clearKeys
              };
            } else if (activeChannel.hasDrm) {
              // Fallback network request only if embedded keys are missing
              const resp = await fetch(`${window.location.origin}/api/clearkey?id=${activeChannel.id}`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) 
              });
              if (resp.ok) {
                const data = await resp.json();
                if (data.keys && data.keys.length > 0) {
                  source.drm = {
                      clearkey: data.keys.map(k => ({
                          kid: k.kid,
                          key: k.k
                      }))
                  };
                }
              }
            }
          } catch(e) {
            console.error('Failed to parse DRM keys', e);
          }
        }

        newBitmovin.on(PlayerEvent.Error, (event) => {
          console.error('Bitmovin Error', event);
          if (currentUrlIndex < urlCount - 1) {
            currentUrlIndex++;
            initPlayer(currentUrlIndex);
          } else {
            setErrorMsg('Stream Error: ' + (event.message || 'Playback failed'));
            setBuffering(false);
          }
        });

        // Request filter has been moved to config.network.preprocessHttpRequest
        newBitmovin.on(PlayerEvent.VideoPlaybackQualityChanged, (e) => {
           if (e.targetQuality && e.targetQuality.height) {
              let hName = e.targetQuality.height + 'p';
              if (e.targetQuality.height >= 2160) hName = '4K';
              else if (e.targetQuality.height >= 1440) hName = '2K';
              setAutoHeight(hName);
           }
        });

        await newBitmovin.load(source);
        
        setBuffering(false);
        setIsPlaying(true);
        newBitmovin.play().catch(e => console.log('Autoplay blocked:', e));

        const tracks = newBitmovin.getAvailableVideoQualities();
        if (tracks && tracks.length > 0) {
          const lvls = tracks
            .map(t => {
              let qName = `${t.height}p`;
              if (t.height >= 2160) qName = '4K (UHD)';
              else if (t.height >= 1440) qName = '2K (QHD)';
              else if (t.height >= 1080) qName = '1080p (FHD)';
              else if (t.height >= 720) qName = '720p (HD)';
              return {
                index: t.id,
                height: t.height,
                name: qName
              };
            })
            .filter((v, i, a) => a.findIndex(t => (t.height === v.height)) === i)
            .sort((a, b) => b.height - a.height);
          setLevels(lvls);
        }

        setBitmovinInstance(newBitmovin);

      } catch (err) {
        console.error('Error loading bitmovin', err);
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
      if (newBitmovin) {
        destroyPromiseRef.current = newBitmovin.destroy().catch(() => {});
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
    if (bitmovinInstance) {
      bitmovinInstance.setVolume(volume * 100);
      if (isMuted) bitmovinInstance.mute(); else bitmovinInstance.unmute();
    }
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, bitmovinInstance]);

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
    if (bitmovinInstance) {
      if (isPlaying) {
        bitmovinInstance.pause();
        setIsPlaying(false);
      } else {
        bitmovinInstance.play();
        setIsPlaying(true);
      }
      return;
    }
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
    if (bitmovinInstance) { bitmovinInstance.seek(bitmovinInstance.getCurrentTime() + 10); return; }
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const skipBackward = (e) => {
    if (e) e.stopPropagation();
    if (bitmovinInstance) { bitmovinInstance.seek(Math.max(0, bitmovinInstance.getCurrentTime() - 10)); return; }
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const jumpToLive = () => {
    if (bitmovinInstance && bitmovinInstance.isLive && bitmovinInstance.isLive()) {
      bitmovinInstance.timeShift(0);
    } else if (videoRef.current && videoRef.current.seekable && videoRef.current.seekable.length > 0) {
      videoRef.current.currentTime = videoRef.current.seekable.end(videoRef.current.seekable.length - 1);
    }
    setDelaySeconds(0);
    if (!isPlaying) togglePlay();
  };

  const isFav = favorites.includes(activeChannel.name);

  return (
    <div className="fullscreen-player-overlay" id="player-panel">
      <div 
        className="player-container"
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
            <video id="video-player" controls playsInline ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}></video>
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

          {/* Custom controls removed as per user request to use native player */}

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
