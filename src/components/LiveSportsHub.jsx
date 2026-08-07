"use client";
import React, { useState } from 'react';
import { Trophy, PlayCircle, Clock, CalendarDays } from 'lucide-react';
import eventsData from '../../data/events.json';

export default function LiveSportsHub({ onWatchLive }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleChannelClick = (channel) => {
    let finalUrl = channel.url || channel.streamUrl || channel.link || '';
    let finalReferer = channel.headers?.Referer || channel.referer || '';
    let finalUserAgent = channel.headers?.['User-Agent'] || channel.userAgent || '';
    
    // Handle pipe-separated link (e.g. url.m3u8|Referer=...&User-Agent=...)
    if (finalUrl.includes('|')) {
      const parts = finalUrl.split('|');
      finalUrl = parts[0];
      const params = new URLSearchParams(parts[1]);
      if (params.has('Referer') || params.has('referer')) finalReferer = params.get('Referer') || params.get('referer');
      if (params.has('User-Agent') || params.has('user-agent')) finalUserAgent = params.get('User-Agent') || params.get('user-agent');
    }

    const mappedChannel = {
      name: channel.title || channel.name || 'Unknown Stream',
      url: finalUrl,
      type: channel.type === 'dash' || channel.type === 0 || finalUrl.includes('.mpd') ? 'dash' : 'hls',
      kid: channel.drm?.kid || (channel.drmKey ? channel.drmKey.split(':')[0] : null) || (channel.api ? channel.api.split(':')[0] : null),
      key: channel.drm?.key || (channel.drmKey ? channel.drmKey.split(':')[1] : null) || (channel.api ? channel.api.split(':')[1] : null),
      useProxy: true,
      referer: finalReferer,
      origin: channel.headers?.Origin || channel.origin || '',
      "user-agent": finalUserAgent
    };
    onWatchLive(mappedChannel);
  };

  return (
    <div className="world-cup-hub"> {/* We can reuse some CSS classes from world-cup-hub */}
      <div className="hub-header">
        <div className="hub-title-area">
          <Trophy className="hub-main-icon" style={{ color: '#00df89' }} />
          <div>
            <h2>Live Sports</h2>
            <p>Catch the latest matches and events</p>
          </div>
        </div>
      </div>

      <div className="hub-content">
        <div className="matches-grid">
          {(Array.isArray(eventsData) ? eventsData : [eventsData]).filter(e => e).map((event) => {
            const teamA = event.teamA || event.homeTeam || event.eventInfo?.teamA || event.apiData?.eventInfo?.teamA || 'Team A';
            const teamB = event.teamB || event.awayTeam || event.eventInfo?.teamB || event.apiData?.eventInfo?.teamB || 'Team B';
            const teamAFlag = event.teamAFlag || event.homeLogo || event.eventInfo?.teamAFlag || event.apiData?.eventInfo?.teamAFlag;
            const teamBFlag = event.teamBFlag || event.awayLogo || event.eventInfo?.teamBFlag || event.apiData?.eventInfo?.teamBFlag;
            const league = event.league || event.eventName || event.eventInfo?.eventName || event.apiData?.eventInfo?.eventName || 'Event';
            const startTime = event.startTime || event.time || event.eventInfo?.startTime || event.apiData?.eventInfo?.startTime;
            const status = event.status || event.eventInfo?.Status || event.apiData?.eventInfo?.Status || 'upcoming';

            return (
            <div key={event.id || Math.random()} className="match-card">
              <div className="match-card-header">
                <span className="match-group">{league}</span>
                <span className={`match-status ${status.toLowerCase() === 'live' ? 'live' : 'upcoming'}`}>
                  {status}
                </span>
              </div>
              
              <div className="match-teams">
                <div className="team">
                  {teamAFlag && <img src={teamAFlag} alt={teamA} className="team-flag" onError={(e) => e.target.style.display='none'} />}
                  <span className="team-name">{teamA}</span>
                </div>
                <div className="vs-badge">VS</div>
                <div className="team">
                  {teamBFlag && <img src={teamBFlag} alt={teamB} className="team-flag" onError={(e) => e.target.style.display='none'} />}
                  <span className="team-name">{teamB}</span>
                </div>
              </div>
              
              <div className="match-footer" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <div className="match-time">
                  <CalendarDays size={14} />
                  <span>{startTime ? new Date(startTime).toLocaleDateString() : 'TBA'}</span>
                </div>
                <div className="match-time">
                  <Clock size={14} />
                  <span>{startTime ? new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBA'}</span>
                </div>
              </div>

              <div className="match-streams" style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>Available Streams</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(event.channels || event.channels_data || event.apiData?.channels_data)?.length > 0 ? (
                    (event.channels || event.channels_data || event.apiData?.channels_data).map((channel, idx) => (
                      <button 
                        key={idx} 
                        className="watch-live-btn"
                        style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', flex: '1 1 auto' }}
                        onClick={() => handleChannelClick(channel)}
                      >
                        <PlayCircle size={14} />
                        {channel.title || channel.name || `Stream ${idx + 1}`}
                      </button>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b' }}>No streams available</span>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
