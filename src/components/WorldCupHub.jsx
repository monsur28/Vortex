"use client";
import React, { useState, useEffect, useRef } from 'react';
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


export default function WorldCupHub({ isPlayerOpen, onWatchLive }) {
  const [activeGroup, setActiveGroup] = useState('Group A');
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00', live: false });
  const [groupsData, setGroupsData] = useState(wcGroupsData);
  const [matches, setMatches] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (carouselRef.current) {
      const activeEl = carouselRef.current.querySelector('.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeGroup]);

  useEffect(() => {
    const fetchStandingsAndMatches = async () => {
      try {
        const [standingsRes, matchesRes] = await Promise.all([
          fetch('/api/football-data/v4/competitions/WC/standings', {
            headers: { 'X-Auth-Token': process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY }
          }),
          fetch('/api/football-data/v4/competitions/WC/matches', {
            headers: { 'X-Auth-Token': process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY }
          })
        ]);

        if (standingsRes.ok) {
          const data = await standingsRes.json();
          const newGroupsData = {};
          
          if (data && data.standings) {
            data.standings.forEach(standing => {
              if (standing.type === 'TOTAL') {
                const groupName = standing.group;
                newGroupsData[groupName] = standing.table.map(row => ({
                  rank: row.position,
                  name: row.team.name,
                  flag: row.team.crest,
                  p: row.playedGames,
                  pts: row.points
                }));
              }
            });
            
            if (Object.keys(newGroupsData).length > 0) {
              setGroupsData(newGroupsData);
            }
          }
        }

        if (matchesRes.ok) {
          const mData = await matchesRes.json();
          if (mData && mData.matches) {
            setMatches(mData.matches);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic data, falling back to static data", err);
      }
    };
    
    fetchStandingsAndMatches();
  }, []);

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

  const standingsData = groupsData[activeGroup] || [];
  const activeGroupCode = activeGroup.toUpperCase().replace(' ', '_');
  const groupMatches = matches.filter(m => m.group === activeGroupCode);

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

      {/* Mobile Group Carousel */}
      <div className="wc-mobile-carousel-container">
        <div className="wc-groups-carousel" ref={carouselRef}>
          {Object.keys(groupsData).map(group => (
            <button 
              key={group} 
              className={`group-carousel-item ${activeGroup === group ? 'active' : ''}`} 
              onClick={() => setActiveGroup(group)}
            >
              {group.replace('Group ', 'Grp ')}
            </button>
          ))}
        </div>
      </div>

      <div className="wc-grid">
        {/* Live Stream Channels */}
        <div className="wc-matches-section">
          <h3 className="wc-section-header">
            <PlayCircle size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> 
            LIVE STREAM CHANNELS
          </h3>
          <div className="wc-channels-header" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 23, 42, 0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select to Watch:</span>
            <button className="wc-watch-btn" onClick={() => onWatchLive("FIFA+")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>FIFA+</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TELEMUNDO 🇲🇽")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>Telemundo</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TSN 1")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>TSN 1</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TSN 2")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>TSN 2</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("BTV NATIONAL HD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', boxShadow: 'none' }}>BTV National</button>
          </div>

          {/* Schedule Section */}
          <div className="wc-schedule-section" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                {activeGroup} Schedule
              </h4>
              {isPlayerOpen && (
                 <select 
                   value={activeGroup} 
                   onChange={(e) => setActiveGroup(e.target.value)}
                   style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px' }}
                 >
                   {Object.keys(groupsData).map(grp => (
                     <option key={grp} value={grp}>{grp}</option>
                   ))}
                 </select>
              )}
            </div>
            
            {groupMatches.length > 0 ? (
              <div className="wc-matches-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: isPlayerOpen ? '300px' : 'none', overflowY: 'auto', paddingRight: '4px' }}>
                {groupMatches.map(match => {
                  const date = new Date(match.utcDate);
                  return (
                    <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                        <span style={{ fontWeight: '600' }}>{match.homeTeam?.name || 'TBD'}</span>
                        {match.homeTeam?.crest && <img src={match.homeTeam.crest} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
                      </div>
                      <div style={{ padding: '0 16px', color: 'var(--wc-gold)', fontWeight: '800', textAlign: 'center', fontSize: '10px' }}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br/>
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-start' }}>
                        {match.awayTeam?.crest && <img src={match.awayTeam.crest} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
                        <span style={{ fontWeight: '600' }}>{match.awayTeam?.name || 'TBD'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                No schedule data found for this group right now.<br/>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>(If the API is loading or rate-limited, please check again shortly.)</span>
              </div>
            )}
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
              {Object.keys(groupsData).map(group => (
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
                      <td className="stats pts-col">{team.pts}</td>
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
