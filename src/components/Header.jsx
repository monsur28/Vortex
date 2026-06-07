import React from 'react';
import { Menu, Search, X, Star, Users, Download } from 'lucide-react';

export default function Header({
  currentCategoryTitle,
  channelCountText,
  searchQuery,
  setSearchQuery,
  showFavoritesOnly,
  onToggleFavorites,
  onToggleSidebar,
  liveVisitors,
  onSelectCategory,
  currentCategory
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle" id="menu-toggle" aria-label="Toggle Sidebar" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="current-view-info">
          <h1 id="current-category-title">{currentCategoryTitle}</h1>
          <span className="badge" id="channel-count-badge">{channelCountText}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 128, 0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(0, 255, 128, 0.2)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff80', boxShadow: '0 0 8px #00ff80', animation: 'pulse 2s infinite' }}></div>
            <Users size={12} color="#00ff80" />
            <span style={{ fontSize: '11px', color: '#00ff80', fontWeight: '800' }}>{liveVisitors || 1} LIVE</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div className="search-box open" id="header-search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            id="search-input" 
            placeholder="Search channels..." 
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" id="clear-search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <button 
          className={`fav-toggle-btn ${currentCategory === 'Download App' ? 'active' : ''}`} 
          title="Download App"
          onClick={() => onSelectCategory('Download App')}
          style={{ background: 'rgba(0, 223, 137, 0.15)', color: 'var(--wc-green)', border: '1px solid rgba(0, 223, 137, 0.3)' }}
        >
          <Download size={16} />
          <span>App</span>
        </button>

        <button 
          className={`fav-toggle-btn ${showFavoritesOnly ? 'active' : ''}`} 
          id="fav-toggle-btn" 
          title="Show Bookmarked"
          onClick={onToggleFavorites}
        >
          <Star size={16} />
          <span>Favorites</span>
        </button>
      </div>
    </header>
  );
}
