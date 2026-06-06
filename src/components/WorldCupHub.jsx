import React, { useState, useEffect } from 'react';
import { Trophy, PlayCircle, List } from 'lucide-react';

const wcGroupsData = {
  'Group A': [
    { rank: 1, name: 'Mexico', flag: 'https://flagcdn.com/w40/mx.png', p: 0, pts: 0 },
    { rank: 2, name: 'USA', flag: 'https://flagcdn.com/w40/us.png', p: 0, pts: 0 },
    { rank: 3, name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png', p: 0, pts: 0 },
    { rank: 4, name: 'Argentina', flag: 'https://flagcdn.com/w40/ar.png', p: 0, pts: 0 }
  ],
  'Group B': [
    { rank: 1, name: 'France', flag: 'https://flagcdn.com/w40/fr.png', p: 0, pts: 0 },
    { rank: 2, name: 'Spain', flag: 'https://flagcdn.com/w40/es.png', p: 0, pts: 0 },
    { rank: 3, name: 'England', flag: 'https://flagcdn.com/w40/gb.png', p: 0, pts: 0 },
    { rank: 4, name: 'Netherlands', flag: 'https://flagcdn.com/w40/nl.png', p: 0, pts: 0 }
  ],
  'Group C': [
    { rank: 1, name: 'Brazil', flag: 'https://flagcdn.com/w40/br.png', p: 0, pts: 0 },
    { rank: 2, name: 'Germany', flag: 'https://flagcdn.com/w40/de.png', p: 0, pts: 0 },
    { rank: 3, name: 'Portugal', flag: 'https://flagcdn.com/w40/pt.png', p: 0, pts: 0 },
    { rank: 4, name: 'Japan', flag: 'https://flagcdn.com/w40/jp.png', p: 0, pts: 0 }
  ],
  'Group D': [
    { rank: 1, name: 'Italy', flag: 'https://flagcdn.com/w40/it.png', p: 0, pts: 0 },
    { rank: 2, name: 'Belgium', flag: 'https://flagcdn.com/w40/be.png', p: 0, pts: 0 },
    { rank: 3, name: 'Uruguay', flag: 'https://flagcdn.com/w40/uy.png', p: 0, pts: 0 },
    { rank: 4, name: 'Morocco', flag: 'https://flagcdn.com/w40/ma.png', p: 0, pts: 0 }
  ],
  'Group E': [
    { rank: 1, name: 'Croatia', flag: 'https://flagcdn.com/w40/hr.png', p: 0, pts: 0 },
    { rank: 2, name: 'Senegal', flag: 'https://flagcdn.com/w40/sn.png', p: 0, pts: 0 },
    { rank: 3, name: 'Iran', flag: 'https://flagcdn.com/w40/ir.png', p: 0, pts: 0 },
    { rank: 4, name: 'Colombia', flag: 'https://flagcdn.com/w40/co.png', p: 0, pts: 0 }
  ],
  'Group F': [
    { rank: 1, name: 'Switzerland', flag: 'https://flagcdn.com/w40/ch.png', p: 0, pts: 0 },
    { rank: 2, name: 'Denmark', flag: 'https://flagcdn.com/w40/dk.png', p: 0, pts: 0 },
    { rank: 3, name: 'South Korea', flag: 'https://flagcdn.com/w40/kr.png', p: 0, pts: 0 },
    { rank: 4, name: 'Australia', flag: 'https://flagcdn.com/w40/au.png', p: 0, pts: 0 }
  ],
  'Group G': [
    { rank: 1, name: 'Poland', flag: 'https://flagcdn.com/w40/pl.png', p: 0, pts: 0 },
    { rank: 2, name: 'Ukraine', flag: 'https://flagcdn.com/w40/ua.png', p: 0, pts: 0 },
    { rank: 3, name: 'Egypt', flag: 'https://flagcdn.com/w40/eg.png', p: 0, pts: 0 },
    { rank: 4, name: 'Cameroon', flag: 'https://flagcdn.com/w40/cm.png', p: 0, pts: 0 }
  ],
  'Group H': [
    { rank: 1, name: 'Sweden', flag: 'https://flagcdn.com/w40/se.png', p: 0, pts: 0 },
    { rank: 2, name: 'Chile', flag: 'https://flagcdn.com/w40/cl.png', p: 0, pts: 0 },
    { rank: 3, name: 'Ecuador', flag: 'https://flagcdn.com/w40/ec.png', p: 0, pts: 0 },
    { rank: 4, name: 'Saudi Arabia', flag: 'https://flagcdn.com/w40/sa.png', p: 0, pts: 0 }
  ],
  'Group I': [
    { rank: 1, name: 'Turkey', flag: 'https://flagcdn.com/w40/tr.png', p: 0, pts: 0 },
    { rank: 2, name: 'Austria', flag: 'https://flagcdn.com/w40/at.png', p: 0, pts: 0 },
    { rank: 3, name: 'Peru', flag: 'https://flagcdn.com/w40/pe.png', p: 0, pts: 0 },
    { rank: 4, name: 'Nigeria', flag: 'https://flagcdn.com/w40/ng.png', p: 0, pts: 0 }
  ],
  'Group J': [
    { rank: 1, name: 'Wales', flag: 'https://flagcdn.com/w40/gb.png', p: 0, pts: 0 },
    { rank: 2, name: 'Hungary', flag: 'https://flagcdn.com/w40/hu.png', p: 0, pts: 0 },
    { rank: 3, name: 'Algeria', flag: 'https://flagcdn.com/w40/dz.png', p: 0, pts: 0 },
    { rank: 4, name: 'Costa Rica', flag: 'https://flagcdn.com/w40/cr.png', p: 0, pts: 0 }
  ],
  'Group K': [
    { rank: 1, name: 'Scotland', flag: 'https://flagcdn.com/w40/gb.png', p: 0, pts: 0 },
    { rank: 2, name: 'Serbia', flag: 'https://flagcdn.com/w40/rs.png', p: 0, pts: 0 },
    { rank: 3, name: 'Ghana', flag: 'https://flagcdn.com/w40/gh.png', p: 0, pts: 0 },
    { rank: 4, name: 'Qatar', flag: 'https://flagcdn.com/w40/qa.png', p: 0, pts: 0 }
  ],
  'Group L': [
    { rank: 1, name: 'Czechia', flag: 'https://flagcdn.com/w40/cz.png', p: 0, pts: 0 },
    { rank: 2, name: 'Norway', flag: 'https://flagcdn.com/w40/no.png', p: 0, pts: 0 },
    { rank: 3, name: 'Tunisia', flag: 'https://flagcdn.com/w40/tn.png', p: 0, pts: 0 },
    { rank: 4, name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png', p: 0, pts: 0 }
  ]
};

const wcMatchesData = [
  { home: 'Mexico', homeFlag: 'mx', away: 'USA', awayFlag: 'us', date: 'June 11', time: '08:30 PM', primary: true },
  { home: 'Canada', homeFlag: 'ca', away: 'Argentina', awayFlag: 'ar', date: 'June 11', time: '11:00 PM' },
  { home: 'Brazil', homeFlag: 'br', away: 'Spain', awayFlag: 'es', date: 'June 12', time: '06:00 PM' },
  { home: 'France', homeFlag: 'fr', away: 'Germany', awayFlag: 'de', date: 'June 12', time: '09:00 PM' },
  { home: 'England', homeFlag: 'gb', away: 'Italy', awayFlag: 'it', date: 'June 13', time: '03:00 PM' },
  { home: 'Portugal', homeFlag: 'pt', away: 'Netherlands', awayFlag: 'nl', date: 'June 13', time: '06:00 PM' },
  { home: 'Uruguay', homeFlag: 'uy', away: 'Japan', awayFlag: 'jp', date: 'June 14', time: '06:00 PM' },
  { home: 'Belgium', homeFlag: 'be', away: 'Morocco', awayFlag: 'ma', date: 'June 14', time: '09:00 PM' },
  { home: 'Senegal', homeFlag: 'sn', away: 'Colombia', awayFlag: 'co', date: 'June 15', time: '06:00 PM' },
  { home: 'South Korea', homeFlag: 'kr', away: 'Croatia', awayFlag: 'hr', date: 'June 15', time: '09:00 PM' },
  { home: 'Germany', homeFlag: 'de', away: 'Japan', awayFlag: 'jp', date: 'June 16', time: '06:00 PM' },
  { home: 'Spain', homeFlag: 'es', away: 'Canada', awayFlag: 'ca', date: 'June 16', time: '09:00 PM' },
  { home: 'Argentina', homeFlag: 'ar', away: 'Chile', awayFlag: 'cl', date: 'June 17', time: '06:00 PM' },
  { home: 'USA', homeFlag: 'us', away: 'Colombia', awayFlag: 'co', date: 'June 17', time: '09:00 PM' },
  { home: 'England', homeFlag: 'gb', away: 'USA', awayFlag: 'us', date: 'June 18', time: '03:00 PM' },
  { home: 'France', homeFlag: 'fr', away: 'Denmark', awayFlag: 'dk', date: 'June 18', time: '06:00 PM' },
  { home: 'Brazil', homeFlag: 'br', away: 'Portugal', awayFlag: 'pt', date: 'June 19', time: '06:00 PM' },
  { home: 'Netherlands', homeFlag: 'nl', away: 'Italy', awayFlag: 'it', date: 'June 19', time: '09:00 PM' },
  { home: 'Spain', homeFlag: 'es', away: 'Germany', awayFlag: 'de', date: 'June 20', time: '06:00 PM' },
  { home: 'Argentina', homeFlag: 'ar', away: 'France', awayFlag: 'fr', date: 'June 20', time: '09:00 PM' }
];

export default function WorldCupHub({ isPlayerOpen, onWatchLive }) {
  const [activeGroup, setActiveGroup] = useState('Group A');
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00', live: false });

  useEffect(() => {
    const kickoffDate = new Date('2026-06-11T18:00:00+06:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = kickoffDate - now;

      if (distance < 0) {
        setCountdown({ days: '00', hours: '00', mins: '00', secs: '00', live: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(minutes).padStart(2, '0'),
        secs: String(seconds).padStart(2, '0'),
        live: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const standingsData = wcGroupsData[activeGroup] || [];

  return (
    <div id="world-cup-hub" className="world-cup-hub" style={{ display: 'block' }}>
      <div className="wc-header">
        <div className="wc-title-area">
          <span className="wc-logo-badge">
            <Trophy size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> 
            FIFA 2026
          </span>
          <h2>FIFA WORLD CUP HUB</h2>
        </div>
        <div className="wc-countdown">
          {countdown.live ? (
            <span className="countdown-label" style={{ color: 'var(--wc-gold)' }}>TOURNAMENT LIVE</span>
          ) : (
            <>
              <span className="countdown-label">KICKOFF IN</span>
              <div className="countdown-timer" id="wc-timer">
                <span>{countdown.days}</span>d{' '}
                <span>{countdown.hours}</span>h{' '}
                <span>{countdown.mins}</span>m{' '}
                <span>{countdown.secs}</span>s
              </div>
            </>
          )}
        </div>
      </div>

      <div className="wc-grid">
        {/* Live & Upcoming Matches */}
        <div className="wc-matches-section">
          <h3 className="wc-section-header">
            <PlayCircle size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> 
            MATCH SCHEDULE & STREAMING
          </h3>
          <div className="wc-channels-header" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 23, 42, 0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Channels:</span>
            <button className="wc-watch-btn" onClick={() => onWatchLive("FIFA+")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>FIFA+</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("T Sports HD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>T Sports</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("A sports")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>A Sports</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("PTV Sports")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>PTV Sports</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("SONY SPORTS 2 HD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>Sony Sports</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("STAR SPORTS SELECT1 HD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>Star Sports</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("Fox Sports 1")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>Fox Sports</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("Telemundo")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>Telemundo</button>
          </div>

          <div className="wc-matches-list" style={isPlayerOpen ? { gridTemplateColumns: '1fr' } : {}}>
            {wcMatchesData.map((match, index) => (
              <div key={index} className="wc-match-card">
                {/* Row 1: Teams playing */}
                <div className="match-teams" style={{ justifyContent: 'center', width: 100 + '%', gap: '12px', marginBottom: '8px' }}>
                  <div className="team home" style={{ fontSize: '13px', fontWeight: 700, flex: 1, justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{match.home}</span>
                    <img src={`https://flagcdn.com/w40/${match.homeFlag}.png`} className="team-flag" alt={match.home} style={{ width: '22px', height: '14px', objectFit: 'cover', borderRadius: '2px' }} />
                  </div>
                  <span className="match-vs" style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '10px' }}>VS</span>
                  <div className="team away" style={{ fontSize: '13px', fontWeight: 700, flex: 1, justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={`https://flagcdn.com/w40/${match.awayFlag}.png`} className="team-flag" alt={match.away} style={{ width: '22px', height: '14px', objectFit: 'cover', borderRadius: '2px' }} />
                    <span>{match.away}</span>
                  </div>
                </div>
                {/* Row 2: Date/Time */}
                <div className="match-info-action" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTop: 'none', paddingTop: '2px', gap: '2px', width: '100%' }}>
                  <div className="match-time-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                    <span style={{ fontWeight: 800, color: match.primary ? 'var(--wc-green)' : 'var(--text-primary)', fontSize: '11px' }}>{match.date}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{match.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Standings Panel - Hidden when video player is open */}
        {!isPlayerOpen && (
          <div className="wc-groups-panel">
            <h3 className="wc-section-header">
              <List size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> 
              GROUP STANDINGS
            </h3>
            <div className="wc-groups-selector">
              {Object.keys(wcGroupsData).map(group => (
                <button 
                  key={group} 
                  className={`group-btn ${activeGroup === group ? 'active' : ''}`} 
                  onClick={() => setActiveGroup(group)}
                >
                  {group.replace('Group ', 'Grp ')}
                </button>
              ))}
            </div>
            <div className="wc-table-wrapper" id="wc-standings-table-container">
              <table className="wc-table">
                <thead>
                  <tr>
                    <th className="rank">#</th>
                    <th>Team</th>
                    <th className="stats">P</th>
                    <th className="stats">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standingsData.map(team => (
                    <tr key={team.name}>
                      <td className="rank">{team.rank}</td>
                      <td className="team-name">
                        <img src={team.flag} className="team-flag" alt={team.name} />
                        <span>{team.name}</span>
                      </td>
                      <td className="stats">{team.p}</td>
                      <td className="stats pts">{team.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
