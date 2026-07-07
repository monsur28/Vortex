"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, PlayCircle, List } from 'lucide-react';
import KnockoutBracket from './KnockoutBracket';

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
  const [topScorers, setTopScorers] = useState([]);
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/football-data';
        const [standingsRes, matchesRes, scorersRes] = await Promise.all([
          fetch(`${apiUrl}/v4/competitions/WC/standings`),
          fetch(`${apiUrl}/v4/competitions/WC/matches`),
          fetch(`${apiUrl}/v4/competitions/WC/scorers`).catch(() => ({ ok: false }))
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

        if (scorersRes.ok) {
          const sData = await scorersRes.json();
          if (sData && sData.scorers && sData.scorers.length > 0) {
            setTopScorers(sData.scorers.slice(0, 5).map((s, idx) => ({
              rank: idx + 1,
              name: s.player.name,
              country: s.team.name,
              flag: s.team.crest,
              goals: s.goals,
              color: idx === 0 ? 'var(--wc-gold)' : (idx === 1 ? '#c0c0c0' : (idx === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)'))
            })));
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

  const getMatchOfTheDay = () => {
    if (!matches || matches.length === 0) return null;
    let liveMatch = matches.find(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
    if (liveMatch) return liveMatch;

    const now = new Date();
    const upcomingMatches = matches.filter(m => new Date(m.utcDate) >= now && m.status !== 'FINISHED').sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    if (upcomingMatches.length > 0) return upcomingMatches[0];

    const finishedMatches = matches.filter(m => m.status === 'FINISHED').sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
    if (finishedMatches.length > 0) return finishedMatches[0];

    return matches[0];
  };

  const matchOfTheDay = getMatchOfTheDay();

  // Fallback static data if API is rate limited
  const displayScorers = topScorers.length > 0 ? topScorers : [
    { rank: 1, name: 'K. Mbappé', country: 'France', flag: 'https://flagcdn.com/w40/fr.png', goals: 6, color: 'var(--wc-gold)' },
    { rank: 2, name: 'V. Júnior', country: 'Brazil', flag: 'https://flagcdn.com/w40/br.png', goals: 5, color: '#c0c0c0' },
    { rank: 3, name: 'H. Kane', country: 'England', flag: 'https://flagcdn.com/w40/gb.png', goals: 4, color: '#cd7f32' },
    { rank: 4, name: 'L. Messi', country: 'Argentina', flag: 'https://flagcdn.com/w40/ar.png', goals: 3, color: 'rgba(255,255,255,0.3)' }
  ];

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
      <div className="wc-grid" style={{ marginTop: '20px' }}>
        {/* Live Stream Channels */}
        <div className="wc-matches-section">
          <h3 className="wc-section-header">
            <PlayCircle size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
            LIVE STREAM CHANNELS
          </h3>
          <div className="wc-channels-header" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 23, 42, 0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select to Watch:</span>
            <button className="wc-watch-btn" onClick={() => onWatchLive("ToffeeLive")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>Toffee Live</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("Binge BDIX (BD)")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>Binge Live(BDIX)</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("World Cup TV")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>World Cup TV</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TSN FHD - 1")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>TSN 1</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("FOX ONE 4K")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>FOX 4K</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("Fox One")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>Fox One ALT</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TSPORTS HD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>TSPORTS HD</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("DSports FHD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>DSports FHD</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("Somoy TV B")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>Somoy TV B</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("SporTV BR FHD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>SporTV BR</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TELEMUNDO HD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>TELEMUNDO</button>
            <button className="wc-watch-btn" onClick={() => onWatchLive("TVE La 1 FHD")} style={{ padding: '5px 12px', height: 'auto', borderRadius: '4px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>TVE La 1</button>
          </div>
          {/* Schedule Section */}
          <div className="wc-schedule-section" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                Upcoming Matches
              </h4>
            </div>

            {matches.length > 0 ? (
              <div className="wc-matches-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: isPlayerOpen ? '300px' : '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {matches
                  .filter(m => m.status !== 'FINISHED' && m.status !== 'AWARDED')
                  .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
                  .map(match => {
                    const date = new Date(match.utcDate);
                    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
                    const statusText = isLive ? 'LIVE' : 'UPCOMING';
                    const statusColor = isLive ? '#ef4444' : 'var(--wc-gold)';

                    return (
                      <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', borderLeft: isLive ? '3px solid #ef4444' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: '600' }}>{match.homeTeam?.name || 'TBD'}</span>
                          {match.homeTeam?.crest && <img src={match.homeTeam.crest} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
                        </div>
                        <div style={{ padding: '0 16px', color: statusColor, fontWeight: '800', textAlign: 'center', fontSize: '10px' }}>
                          <div style={{ marginBottom: '4px', display: 'inline-block', padding: '2px 6px', background: isLive ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                            {isLive && <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', marginRight: '4px' }}></span>}
                            {statusText}
                          </div><br />
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
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
                No upcoming matches found.<br />
                <span style={{ fontSize: '10px', opacity: 0.7 }}>(If the API is loading or rate-limited, please check again shortly.)</span>
              </div>
            )}
          </div>
        </div>

        {/* Knockout Hub Panel - Replaces Group Standings */}
        {!isPlayerOpen && (
          <div className="wc-groups-panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
            {/* Match of the Day Card */}
            {matchOfTheDay && (
              <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid var(--wc-gold)', padding: '20px', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'scale(2)' }}>
                  <Trophy size={120} color="var(--wc-gold)" />
                </div>
                <h3 style={{ fontSize: '12px', color: 'var(--wc-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(matchOfTheDay.status === 'IN_PLAY' || matchOfTheDay.status === 'PAUSED') && (
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                  )}
                  Match of the Day
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    {matchOfTheDay.homeTeam?.crest ? (
                      <img src={matchOfTheDay.homeTeam.crest} alt={matchOfTheDay.homeTeam.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', marginBottom: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                    )}
                    <span style={{ fontWeight: '800', fontSize: '14px', textAlign: 'center' }}>{matchOfTheDay.homeTeam?.name || 'TBD'}</span>
                  </div>
                  <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    {matchOfTheDay.status === 'TIMED' || matchOfTheDay.status === 'SCHEDULED' ? (
                      <div style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>
                        {new Date(matchOfTheDay.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{matchOfTheDay.score?.fullTime?.home ?? '-'}</span>
                        <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>:</span>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{matchOfTheDay.score?.fullTime?.away ?? '-'}</span>
                      </div>
                    )}
                    {matchOfTheDay.status === 'IN_PLAY' && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', marginTop: '8px', letterSpacing: '1px' }}>LIVE</span>}
                    {matchOfTheDay.status === 'FINISHED' && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', marginTop: '8px', letterSpacing: '1px' }}>FT</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    {matchOfTheDay.awayTeam?.crest ? (
                      <img src={matchOfTheDay.awayTeam.crest} alt={matchOfTheDay.awayTeam.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', marginBottom: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                    )}
                    <span style={{ fontWeight: '800', fontSize: '14px', textAlign: 'center' }}>{matchOfTheDay.awayTeam?.name || 'TBD'}</span>
                  </div>
                </div>

                {(matchOfTheDay.status === 'IN_PLAY' || matchOfTheDay.status === 'PAUSED') && (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button onClick={() => onWatchLive("ToffeeLive")} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', textTransform: 'uppercase' }}>
                      <PlayCircle size={18} /> Toffee Live
                    </button>
                    <button onClick={() => onWatchLive("FifaLive")} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', textTransform: 'uppercase' }}>
                      <PlayCircle size={18} /> Fifa Live
                    </button>
                    <button onClick={() => onWatchLive("Binge BDIX (BD)")} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', textTransform: 'uppercase' }}>
                      <PlayCircle size={18} /> Binge Live
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Golden Boot Leaderboard */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={14} color="var(--wc-gold)" /> Golden Boot Race
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayScorers.map(player => (
                  <div key={player.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: player.color, minWidth: '16px', textAlign: 'center' }}>{player.rank}</span>
                      <img src={player.flag} alt={player.country} style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${player.color === 'rgba(255,255,255,0.3)' ? 'transparent' : player.color}` }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{player.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{player.country}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>{player.goals}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800' }}>G</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="wc-section-header" style={{ marginLeft: '20px', marginBottom: '20px' }}>
          <Trophy size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
          TOURNAMENT BRACKET
        </h3>
        <KnockoutBracket matches={matches} groupsData={groupsData} />
      </div>
    </div>
  );
}
