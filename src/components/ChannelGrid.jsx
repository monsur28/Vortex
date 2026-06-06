import React from 'react';
import { Play } from 'lucide-react';

export default function ChannelGrid({ 
  channels, 
  favorites, 
  activeChannel, 
  onSelectChannel, 
  onToggleFavorite 
}) {
  return (
    <div className="channels-grid" id="channels-grid">
      {channels.map((ch, index) => {
        const isFav = favorites.includes(ch.name);
        const logoUrl = ch.logo && ch.logo.trim() !== '' ? ch.logo : null;
        const isPlaying = activeChannel && activeChannel.name === ch.name;

        return (
          <div 
            key={ch.name + '-' + index} 
            className={`channel-card ${isPlaying ? 'now-playing' : ''}`} 
            onClick={() => onSelectChannel(ch)}
            style={{ animationDelay: `${Math.min(index * 0.015, 0.4)}s` }}
          >
            <button 
              className={`card-fav-btn ${isFav ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(ch.name);
              }}
            >
              <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <div className="card-logo-container">
              {logoUrl ? (
                <img 
                  className="card-logo" 
                  src={logoUrl} 
                  alt={ch.name} 
                  loading="lazy" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="fallback-logo" 
                style={{ 
                  display: logoUrl ? 'none' : 'flex',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--bg-surface-elevated), var(--bg-dark))',
                  fontFamily: '"Outfit"',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: 'var(--text-secondary)'
                }}
              >
                {ch.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="card-play-overlay">
                <Play size={24} />
              </div>
            </div>
            <div className="card-info">
              <h4 className="card-name" title={ch.name}>{ch.name}</h4>
              <span className="card-group">{ch.group || 'Other'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Star({ size, fill }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
