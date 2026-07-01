"use client";
import React from 'react';
import { 
  Trophy, Layers, Star, Tv, Globe, Smile, 
  BookOpen, Music, LayoutGrid, Languages, Film, 
  CloudSun, Compass, Sparkles, HelpCircle, Download 
} from 'lucide-react';

const categoryIcons = {
  'fifa world cup 2026': Trophy,
  'bangla': Languages,
  'hindi': Film,
  'english': Globe,
  'sports': Trophy,
  'news': BookOpen,
  'entertainment': Smile,
  'music': Music,
  'kids': Sparkles,
  'movies': Film,
  'documentary': Compass,
  'lifestyle': CloudSun,
  'general': LayoutGrid,
  'religious': BookOpen,
  'other': HelpCircle
};

export default function Sidebar({ 
  channels, 
  favorites, 
  currentCategory, 
  showFavoritesOnly, 
  onSelectCategory,
  isOpen
}) {
  // Calculate counts per group
  const groupsMap = {};
  channels.forEach(ch => {
    const groupName = ch.group || 'Other';
    groupsMap[groupName] = (groupsMap[groupName] || 0) + 1;
  });

  const sortedGroups = Object.keys(groupsMap).sort((a, b) => a.localeCompare(b));

  const totalCount = channels.length;
  const favCount = favorites.length;

  const isWcActive = currentCategory === 'FIFA World Cup 2026' && !showFavoritesOnly;

  const getIcon = (groupName) => {
    const IconComponent = categoryIcons[groupName.toLowerCase()] || Tv;
    return <IconComponent size={18} />;
  };



  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg className="logo-icon-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px', filter: 'drop-shadow(0 0 6px rgba(124, 58, 237, 0.4))' }}>
            <defs>
              <linearGradient id="vortexGradSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" stroke="url(#vortexGradSidebar)" strokeWidth="12" strokeDasharray="180 60" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="50" r="20" fill="url(#vortexGradSidebar)" />
          </svg>
          <span>WORLD CUP</span>
        </div>
      </div>

      <nav className="categories-nav">
        <div className="section-title">
          <span>CATEGORIES</span>
        </div>
        <ul className="categories-list" id="categories-list">
          {/* World Cup 2026 */}
          <li 
            className={`category-item ${isWcActive ? 'active' : ''}`} 
            onClick={() => onSelectCategory('FIFA World Cup 2026')}
            style={{ 
              borderLeft: '3px solid var(--wc-green)', 
              background: isWcActive ? 'linear-gradient(90deg, rgba(0, 223, 137, 0.15) 0%, transparent 100%)' : 'transparent' 
            }}
          >
            <div className="category-item-left" style={{ color: 'var(--wc-green)', fontWeight: 700 }}>
              <Trophy size={18} />
              <span>World Cup 2026</span>
            </div>
            <span className="category-count" style={{ backgroundColor: 'rgba(0, 223, 137, 0.15)', color: 'var(--wc-green)', fontWeight: 700 }}>LIVE</span>
          </li>

          {/* All Channels */}
          <li 
            className={`category-item ${currentCategory === 'All' && !showFavoritesOnly ? 'active' : ''}`} 
            onClick={() => onSelectCategory('All')}
          >
            <div className="category-item-left">
              <Layers size={18} />
              <span>All Channels</span>
            </div>
            <span className="category-count">{totalCount}</span>
          </li>

          {/* Xtream TV */}
          <li 
            className={`category-item ${currentCategory === 'Xtream TV' ? 'active' : ''}`} 
            onClick={() => onSelectCategory('Xtream TV')}
            style={{ 
              borderLeft: currentCategory === 'Xtream TV' ? '3px solid #3b82f6' : 'transparent', 
              background: currentCategory === 'Xtream TV' ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%)' : 'transparent' 
            }}
          >
            <div className="category-item-left" style={{ color: currentCategory === 'Xtream TV' ? '#3b82f6' : 'var(--text-secondary)' }}>
              <Globe size={18} />
              <span>Xtream TV</span>
            </div>
            <span className="category-count" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 700 }}>NEW</span>
          </li>

          {/* Bookmarks */}
          <li 
            className={`category-item ${showFavoritesOnly ? 'active' : ''}`} 
            onClick={() => onSelectCategory('Favorites')}
          >
            <div className="category-item-left">
              <Star size={18} />
              <span>Bookmarks</span>
            </div>
            <span className="category-count" id="sidebar-fav-count">{favCount}</span>
          </li>

          {/* Dynamic Groups */}
          {sortedGroups.filter(g => g !== 'Xtream TV' && g !== 'FIFA World Cup 2026').map(group => {
            const isActive = currentCategory === group && !showFavoritesOnly;
            return (
              <li 
                key={group} 
                className={`category-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(group)}
              >
                <div className="category-item-left">
                  {getIcon(group)}
                  <span>{group}</span>
                </div>
                <span className="category-count">{groupsMap[group]}</span>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch', padding: '12px 16px' }}>

        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', margin: '2px 0 0' }}>World Cup Player v1.0.0</p>
      </div>
    </aside>
  );
}
