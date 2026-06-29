"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Grid, Search, Star, AlertCircle, 
  Menu, X, Trophy, Layers, Tv, Globe, Smile, 
  BookOpen, Music, LayoutGrid, Languages, Film, 
  CloudSun, Compass, Sparkles, HelpCircle 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PlayerPanel from './components/PlayerPanel';
import WorldCupHub from './components/WorldCupHub';
import GlobalTVHub from './components/GlobalTVHub';
import ChannelGrid from './components/ChannelGrid';
import DownloadApp from './components/DownloadApp';
import { database, ref, onValue, onDisconnect, set, push } from './firebase';

const categoryIcons = {
  'fifa world cup 2026': Trophy,
  'all': Layers,
  'favorites': Star,
  'bangla': Tv,
  'indian bangla': Tv,
  'news': Globe,
  'sports': Trophy,
  'kids': Smile,
  'religious': BookOpen,
  'music': Music,
  'channels': LayoutGrid,
  'english': Languages,
  'hindi': Languages,
  'movie': Film,
  'drama': Film,
  'weather': CloudSun,
  'documentary': Compass,
  'latest': Sparkles,
  'other': HelpCircle
};

export default function App({ initialChannels = [] }) {
  const [channels, setChannels] = useState(initialChannels);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('vortex_favorites')) || [];
      setFavorites(stored);
    }
  }, []);
  const [currentCategory, setCurrentCategory] = useState('FIFA World Cup 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [visibleCount, setVisibleCount] = useState(80);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoriesSheetOpen, setIsCategoriesSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastFade, setToastFade] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(1); // Default to 1 (the current user)

  // Firebase Presence Tracking
  useEffect(() => {
    if (!database) return; // Wait until firebase is configured

    const connectedRef = ref(database, '.info/connected');
    const myConnectionsRef = ref(database, 'visitors');
    let newConnectionRef = null;

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)!
        newConnectionRef = push(myConnectionsRef);
        // When I disconnect, remove this device
        onDisconnect(newConnectionRef).remove().then(() => {
          // Add this device to my connections list
          set(newConnectionRef, true);
        });
      }
    });

    const unsubscribeVisitors = onValue(myConnectionsRef, (snap) => {
      if (snap.exists()) {
        setLiveVisitors(Object.keys(snap.val()).length);
      } else {
        setLiveVisitors(0);
      }
    });

    return () => {
      unsubscribeConnected();
      unsubscribeVisitors();
      if (newConnectionRef) {
        set(newConnectionRef, null); // Remove on unmount
      }
    };
  }, []);




  const feedRef = useRef(null);



  // Parse M3U playlist content
  const parseM3U = (m3uText) => {
    const lines = m3uText.split('\n');
    const parsed = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('#EXTINF:')) {
        current = {};
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        if (logoMatch) current.logo = logoMatch[1];

        const groupMatch = line.match(/group-title="([^"]+)"/);
        current.group = groupMatch ? groupMatch[1] : 'Other';

        const commaIndex = line.lastIndexOf(',');
        if (commaIndex > -1) {
          current.name = line.substring(commaIndex + 1).trim();
        } else {
          current.name = 'Unknown Channel';
        }
      } else if (!line.startsWith('#') && current) {
        current.url = line;
        parsed.push(current);
        current = null;
      }
    }
    return parsed;
  };

  // Toast notifier helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastFade(false);
    setTimeout(() => {
      setToastFade(true);
      setTimeout(() => setToastMessage(''), 300);
    }, 3000);
  };

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('vortex_favorites', JSON.stringify(favorites));
  }, [favorites]);



  // Filter channels
  const filteredChannels = React.useMemo(() => {
    let filtered = [...channels];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ch =>
        ch.name.toLowerCase().includes(query) ||
        (ch.group && ch.group.toLowerCase().includes(query))
      );
    } else if (showFavoritesOnly) {
      filtered = filtered.filter(ch => favorites.includes(ch.name));
    } else if (currentCategory === 'FIFA World Cup 2026') {
      filtered = filtered.filter(ch => ch.group === 'Sports');
    } else if (currentCategory !== 'All') {
      filtered = filtered.filter(ch => ch.group === currentCategory);
    }

    return filtered;
  }, [channels, searchQuery, showFavoritesOnly, currentCategory, favorites]);
  const slicedChannels = filteredChannels.slice(0, visibleCount);

  // Category change handler
  const handleSelectCategory = (catName) => {
    if (catName === 'Favorites') {
      setShowFavoritesOnly(true);
      setCurrentCategory('Favorites');
    } else {
      setShowFavoritesOnly(false);
      setCurrentCategory(catName);
    }
    setSearchQuery('');
    setVisibleCount(80);
    setIsSidebarOpen(false);
    setIsCategoriesSheetOpen(false);

    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  };

  // Toggle favorites view toggler button in header
  const handleToggleFavoritesHeader = () => {
    const isNowFav = !showFavoritesOnly;
    setShowFavoritesOnly(isNowFav);
    setCurrentCategory(isNowFav ? 'Favorites' : 'Bangla');
    setVisibleCount(80);
  };

  // Toggle single channel favorite status
  const handleToggleFavoriteChannel = (name) => {
    setFavorites(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  // Select stream channel play handler
  const handleSelectChannel = (channel) => {
    setActiveChannel(channel);
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
    // Always open in theater mode (fullscreen overlay)
    setIsTheaterMode(true);
  };

  const handleNextChannel = () => {
    if (!activeChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.name === activeChannel.name);
    if (currentIndex !== -1 && currentIndex < filteredChannels.length - 1) {
      handleSelectChannel(filteredChannels[currentIndex + 1]);
    } else if (filteredChannels.length > 0) {
      handleSelectChannel(filteredChannels[0]);
    }
  };

  const handlePrevChannel = () => {
    if (!activeChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.name === activeChannel.name);
    if (currentIndex > 0) {
      handleSelectChannel(filteredChannels[currentIndex - 1]);
    } else if (filteredChannels.length > 0) {
      handleSelectChannel(filteredChannels[filteredChannels.length - 1]);
    }
  };

  // Infinite scroll trigger
  const handleScroll = (e) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 150) {
      if (visibleCount < filteredChannels.length) {
        setVisibleCount(prev => prev + 80);
      }
    }
  };

  // Watch Live from World Cup Hub
  const handleWatchLiveHub = (targetChannelName) => {
    let channel = null;

    if (targetChannelName === "Fox Sports 1") {
      channel = channels.find(c => c.name === "Fox Sports (720p)") || 
                channels.find(c => c.name.toLowerCase().includes("fox sports")) ||
                channels.find(c => c.name.toLowerCase().includes("fox"));
    } else if (targetChannelName === "Rai 1") {
      channel = channels.find(c => c.name === "Rai 1 (720p)") || 
                channels.find(c => c.name.toLowerCase().includes("rai 1")) ||
                channels.find(c => c.name.toLowerCase().includes("rai"));
    } else {
      channel = channels.find(c => c.name.toLowerCase() === targetChannelName.toLowerCase()) ||
                channels.find(c => c.name.toLowerCase().includes(targetChannelName.toLowerCase()));
      // Fallback search with single words if not found
      if (!channel) {
        const words = targetChannelName.split(' ');
        for (const word of words) {
          if (word.length > 2 && word.toLowerCase() !== 'sports' && word.toLowerCase() !== 'hd') {
            channel = channels.find(c => c.name.toLowerCase().includes(word.toLowerCase()));
            if (channel) break;
          }
        }
      }
    }

    if (channel) {
      handleSelectChannel(channel);
    } else {
      triggerToast(`"${targetChannelName}" stream not active. Loading fallback Sports channel...`);
      const fallback = channels.find(c => c.group === 'Sports');
      if (fallback) handleSelectChannel(fallback);
    }
  };

  // Dynamically compute header title & channel counts
  const getHeaderTitle = () => {
    if (searchQuery.trim() !== '') {
      return `Search results for "${searchQuery}"`;
    }
    if (showFavoritesOnly) {
      return 'Bookmarks';
    }
    return currentCategory;
  };

  const getHeaderCountBadge = () => {
    return `${filteredChannels.length} Channels`;
  };

  // Dynamic categories counts per group
  const { groupsMap, sortedGroups } = React.useMemo(() => {
    const map = {};
    channels.forEach(ch => {
      const groupName = ch.group || 'Other';
      map[groupName] = (map[groupName] || 0) + 1;
    });
    return {
      groupsMap: map,
      sortedGroups: Object.keys(map).sort((a, b) => a.localeCompare(b))
    };
  }, [channels]);

  const totalCount = channels.length;
  const favCount = favorites.length;

  const isWcActive = currentCategory === 'FIFA World Cup 2026' && !showFavoritesOnly;

  return (
    <div className={`app-container ${isTheaterMode ? 'theater-mode' : ''}`}>
      {/* Sidebar Desktop */}
      <Sidebar 
        channels={channels}
        favorites={favorites}
        currentCategory={currentCategory}
        showFavoritesOnly={showFavoritesOnly}
        onSelectCategory={handleSelectCategory}
        isOpen={isSidebarOpen}
      />

      <main className="main-content">
        <Header 
          currentCategoryTitle={getHeaderTitle()}
          channelCountText={getHeaderCountBadge()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={handleToggleFavoritesHeader}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          liveVisitors={liveVisitors}
          currentCategory={currentCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Mobile horizontal categories bar */}
        <div className="mobile-categories-bar">
          <div 
            className={`category-chip ${isWcActive ? 'active' : ''}`}
            onClick={() => handleSelectCategory('FIFA World Cup 2026')}
            style={{ borderColor: 'rgba(0, 223, 137, 0.4)' }}
          >
            <Trophy size={14} style={{ color: 'var(--wc-green)', marginRight: '4px' }} />
            <span style={{ color: 'var(--wc-green)', fontWeight: 600 }}>World Cup</span>
          </div>
          <div 
            className={`category-chip ${currentCategory === 'All' && !showFavoritesOnly ? 'active' : ''}`}
            onClick={() => handleSelectCategory('All')}
          >
            <Layers size={14} style={{ marginRight: '4px' }} />
            <span>All</span>
          </div>
          <div 
            className={`category-chip ${currentCategory === 'Global TV' ? 'active' : ''}`}
            onClick={() => handleSelectCategory('Global TV')}
          >
            <Globe size={14} style={{ marginRight: '4px' }} />
            <span>Global TV</span>
          </div>
          <div 
            className={`category-chip ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => handleSelectCategory('Favorites')}
          >
            <Star size={14} style={{ marginRight: '4px' }} />
            <span>Bookmarks</span>
          </div>

          {sortedGroups.map(group => {
            const isActive = currentCategory === group && !showFavoritesOnly;
            return (
              <div 
                key={group}
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectCategory(group)}
              >
                <span>{group}</span>
              </div>
            );
          })}
        </div>

        <div className="content-body">
          {/* HLS Video Player Panel */}
          {activeChannel && (
            <PlayerPanel 
              activeChannel={activeChannel}
              favorites={favorites}
              onToggleFavorite={handleToggleFavoriteChannel}
              onClose={() => {
                setActiveChannel(null);
                setIsTheaterMode(false);
              }}
              isTheaterMode={isTheaterMode}
              onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
              onNextChannel={handleNextChannel}
              onPrevChannel={handlePrevChannel}
            />
          )}

          {/* Channels Feed (Matches + Channels Grid) */}
          <section className="feed-section" ref={feedRef} onScroll={handleScroll}>
            {currentCategory === 'Download App' ? (
              <DownloadApp />
            ) : (
              <>
                {/* World Cup Hub */}
                {currentCategory === 'FIFA World Cup 2026' && searchQuery.trim() === '' && !showFavoritesOnly && (
                  <WorldCupHub 
                    isPlayerOpen={activeChannel !== null}
                    onWatchLive={handleWatchLiveHub}
                  />
                )}

                {/* Global TV Hub */}
                {currentCategory === 'Global TV' && (
                  <GlobalTVHub 
                    isPlayerOpen={activeChannel !== null}
                    onWatchLive={handleSelectChannel}
                  />
                )}

                {currentCategory !== 'Global TV' && filteredChannels.length > 0 ? (
                  <ChannelGrid 
                    channels={slicedChannels}
                    favorites={favorites}
                    activeChannel={activeChannel}
                    onSelectChannel={handleSelectChannel}
                    onToggleFavorite={handleToggleFavoriteChannel}
                  />
                ) : (
                  <div className="empty-state" style={{ display: 'flex' }}>
                    <AlertCircle className="empty-icon" size={48} />
                    <h3>No channels found</h3>
                    <p>Try refining your search query or choosing another category.</p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`nav-item ${currentCategory === 'FIFA World Cup 2026' && !showFavoritesOnly ? 'active' : ''}`}
          onClick={() => handleSelectCategory('FIFA World Cup 2026')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button 
          className="nav-item"
          onClick={() => setIsCategoriesSheetOpen(true)}
        >
          <Grid size={20} />
          <span>Categories</span>
        </button>
        <button 
          className="nav-item"
          onClick={() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
          }}
        >
          <Search size={20} />
          <span>Search</span>
        </button>
        <button 
          className={`nav-item ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => handleSelectCategory('Favorites')}
        >
          <Star size={20} />
          <span>Bookmarks</span>
        </button>
      </nav>

      {/* Mobile Bottom Sheet drawer for Categories selector */}
      <div className={`bottom-sheet ${isCategoriesSheetOpen ? 'open' : ''}`}>
        <div className="bottom-sheet-backdrop" onClick={() => setIsCategoriesSheetOpen(false)}></div>
        <div className="bottom-sheet-content">
          <div className="bottom-sheet-header">
            <div className="sheet-handle"></div>
            <h3>Select Category</h3>
          </div>
          <div className="bottom-sheet-body">
            <ul className="categories-list-mobile">
              <li 
                className={`category-item ${isWcActive ? 'active' : ''}`}
                onClick={() => handleSelectCategory('FIFA World Cup 2026')}
              >
                <div className="category-item-left" style={{ color: 'var(--wc-green)', fontWeight: 700 }}>
                  <Trophy size={18} />
                  <span>World Cup 2026</span>
                </div>
                <span className="category-count" style={{ backgroundColor: 'rgba(0, 223, 137, 0.15)', color: 'var(--wc-green)', fontWeight: 700 }}>LIVE</span>
              </li>
              <li 
                className={`category-item ${currentCategory === 'All' && !showFavoritesOnly ? 'active' : ''}`}
                onClick={() => handleSelectCategory('All')}
              >
                <div className="category-item-left">
                  <Layers size={18} />
                  <span>All Channels</span>
                </div>
                <span className="category-count">{totalCount}</span>
              </li>
              <li 
                className={`category-item ${currentCategory === 'Global TV' ? 'active' : ''}`}
                onClick={() => handleSelectCategory('Global TV')}
              >
                <div className="category-item-left">
                  <Globe size={18} />
                  <span>Global TV</span>
                </div>
                <span className="category-count" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 700 }}>NEW</span>
              </li>
              <li 
                className={`category-item ${showFavoritesOnly ? 'active' : ''}`}
                onClick={() => handleSelectCategory('Favorites')}
              >
                <div className="category-item-left">
                  <Star size={18} />
                  <span>Bookmarks</span>
                </div>
                <span className="category-count">{favCount}</span>
              </li>

              {sortedGroups.map(group => {
                const isActive = currentCategory === group && !showFavoritesOnly;
                const IconComponent = categoryIcons[group.toLowerCase()] || Tv;
                return (
                  <li 
                    key={group}
                    className={`category-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(group)}
                  >
                    <div className="category-item-left">
                      <IconComponent size={18} />
                      <span>{group}</span>
                    </div>
                    <span className="category-count">{groupsMap[group]}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Background toast message */}
      {toastMessage && (
        <div className={`player-toast ${toastFade ? 'fade-out' : ''}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
