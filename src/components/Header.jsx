import React from 'react';
import { Menu, Search, X, Star } from 'lucide-react';

export default function Header({
  currentCategoryTitle,
  channelCountText,
  searchQuery,
  setSearchQuery,
  showFavoritesOnly,
  onToggleFavorites,
  onToggleSidebar
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
