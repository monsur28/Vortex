import React, { useState } from 'react';
import { X, Calendar, MapPin, Activity } from 'lucide-react';

const STAGES = [
  { id: 'LAST_32', name: 'Round of 32', matchCount: 16 },
  { id: 'LAST_16', name: 'Round of 16', matchCount: 8 },
  { id: 'QUARTER_FINALS', name: 'Quarter-Finals', matchCount: 4 },
  { id: 'SEMI_FINALS', name: 'Semi-Finals', matchCount: 2 },
  { id: 'FINAL', name: 'Final', matchCount: 1 },
];

export default function KnockoutBracket({ matches, groupsData }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Group matches by stage
  const matchesByStage = {};
  
  STAGES.forEach(stage => {
    // Attempt to find matches for this stage. 
    // Fallback if not populated.
    let stageMatches = matches.filter(m => m.stage === stage.id);
    
    // Fill in placeholders if we don't have enough matches
    const filledMatches = [];
    for (let i = 0; i < stage.matchCount; i++) {
      if (stageMatches[i]) {
        filledMatches.push(stageMatches[i]);
      } else {
        filledMatches.push({ id: `placeholder-${stage.id}-${i}`, isPlaceholder: true });
      }
    }
    matchesByStage[stage.id] = filledMatches;
  });

  const getPlaceholderLabels = (stageId, index) => {
    let homeLabel = "TBD";
    let awayLabel = "TBD";

    if (stageId === 'LAST_32') {
      const labels = [
        { home: "1st Group A", away: "3rd Group C/D/E" },
        { home: "2nd Group B", away: "2nd Group F" },
        { home: "1st Group C", away: "3rd Group A/B/F" },
        { home: "2nd Group E", away: "2nd Group I" },
        { home: "1st Group D", away: "3rd Group B/C/E/F" },
        { home: "2nd Group A", away: "2nd Group H" },
        { home: "1st Group F", away: "3rd Group A/B/C" },
        { home: "2nd Group C", away: "2nd Group G" },
        { home: "1st Group E", away: "3rd Group A/B/C/D" },
        { home: "2nd Group D", away: "2nd Group J" },
        { home: "1st Group G", away: "3rd Group H/I/J/K" },
        { home: "2nd Group K", away: "2nd Group L" },
        { home: "1st Group H", away: "3rd Group E/F/G" },
        { home: "1st Group I", away: "3rd Group C/D/H" },
        { home: "1st Group J", away: "3rd Group A/B/F" },
        { home: "1st Group L", away: "3rd Group D/E/I" }
      ];
      if (labels[index]) {
        homeLabel = labels[index].home;
        awayLabel = labels[index].away;
      }
    } else if (stageId === 'LAST_16') {
      homeLabel = `Winner R32 M${(index * 2) + 1}`;
      awayLabel = `Winner R32 M${(index * 2) + 2}`;
    } else if (stageId === 'QUARTER_FINALS') {
      homeLabel = `Winner R16 M${(index * 2) + 1}`;
      awayLabel = `Winner R16 M${(index * 2) + 2}`;
    } else if (stageId === 'SEMI_FINALS') {
      homeLabel = `Winner QF M${(index * 2) + 1}`;
      awayLabel = `Winner QF M${(index * 2) + 2}`;
    } else if (stageId === 'FINAL') {
      homeLabel = `Winner SF 1`;
      awayLabel = `Winner SF 2`;
    }

    return { homeLabel, awayLabel };
  };

  const resolveTeamFromLabel = (label) => {
    if (!groupsData || !label) return null;
    const match = label.match(/(\d)(?:st|nd) Group ([A-L])/);
    if (match) {
      const rank = parseInt(match[1]) - 1;
      const groupName = `GROUP_${match[2]}`;
      const groupStandings = groupsData[groupName];
      if (groupStandings && groupStandings[rank]) {
        return {
          name: groupStandings[rank].name,
          crest: groupStandings[rank].flag
        };
      }
    }
    return null;
  };

  const renderMatch = (match, stageId, index) => {
    const { homeLabel, awayLabel } = getPlaceholderLabels(stageId, index);

    let resolvedHome = resolveTeamFromLabel(homeLabel);
    let resolvedAway = resolveTeamFromLabel(awayLabel);

    if (!match.isPlaceholder) {
      if (match.homeTeam?.name) resolvedHome = match.homeTeam;
      if (match.awayTeam?.name) resolvedAway = match.awayTeam;
    }

    if (match.isPlaceholder) {
      return (
        <div className="wc-bracket-match placeholder" key={match.id} style={{ cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }} onClick={() => setSelectedMatch({ ...match, resolvedHome, resolvedAway, homeLabel, awayLabel, stageId })}>
          <div className="wc-bracket-team">
            <div className="team-info">
              {resolvedHome?.crest && <img src={resolvedHome.crest} alt="" />}
              <span style={{ fontSize: resolvedHome ? '12px' : '11px', color: resolvedHome ? 'inherit' : 'var(--text-secondary)' }}>
                {resolvedHome ? resolvedHome.name : homeLabel}
              </span>
            </div>
          </div>
          <div className="wc-bracket-team">
            <div className="team-info">
              {resolvedAway?.crest && <img src={resolvedAway.crest} alt="" />}
              <span style={{ fontSize: resolvedAway ? '12px' : '11px', color: resolvedAway ? 'inherit' : 'var(--text-secondary)' }}>
                {resolvedAway ? resolvedAway.name : awayLabel}
              </span>
            </div>
          </div>
        </div>
      );
    }

    const homeScore = match.score?.fullTime?.home ?? '-';
    const awayScore = match.score?.fullTime?.away ?? '-';
    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

    return (
      <div className={`wc-bracket-match ${isLive ? 'live' : ''}`} key={match.id} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedMatch({ ...match, resolvedHome, resolvedAway, homeLabel, awayLabel, stageId })}>
        <div className="wc-bracket-team">
          <div className="team-info">
            {resolvedHome?.crest && <img src={resolvedHome.crest} alt="" />}
            <span style={{ fontWeight: match.score?.winner === 'HOME_TEAM' ? '800' : '500', fontSize: resolvedHome?.name ? '12px' : '10px', color: resolvedHome?.name ? 'inherit' : 'var(--text-secondary)' }}>
              {resolvedHome?.name || homeLabel}
            </span>
          </div>
          <div className="team-score">{homeScore}</div>
        </div>
        <div className="wc-bracket-team">
          <div className="team-info">
            {resolvedAway?.crest && <img src={resolvedAway.crest} alt="" />}
            <span style={{ fontWeight: match.score?.winner === 'AWAY_TEAM' ? '800' : '500', fontSize: resolvedAway?.name ? '12px' : '10px', color: resolvedAway?.name ? 'inherit' : 'var(--text-secondary)' }}>
              {resolvedAway?.name || awayLabel}
            </span>
          </div>
          <div className="team-score">{awayScore}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="wc-bracket-wrapper">
      <div className="wc-bracket-container">
        {STAGES.map((stage, stageIndex) => (
          <div className="wc-bracket-round" key={stage.id}>
            <h4 className="wc-bracket-round-title">{stage.name}</h4>
            <div className="wc-bracket-matches">
              {matchesByStage[stage.id].map((match, idx) => {
                const isTopHalf = idx % 2 === 0;
                return (
                  <div className={`wc-bracket-match-wrapper ${stageIndex < STAGES.length - 1 ? (isTopHalf ? 'connect-down' : 'connect-up') : ''}`} key={match.id || idx}>
                    {renderMatch(match, stage.id, idx)}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedMatch(null)}>
          <div style={{
            background: 'linear-gradient(145deg, #0f172a, #1e293b)',
            border: '1px solid var(--wc-gold)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedMatch(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ color: 'var(--wc-gold)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {STAGES.find(s => s.id === selectedMatch.stageId)?.name}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              {/* Home Team */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {selectedMatch.resolvedHome?.crest ? (
                  <img src={selectedMatch.resolvedHome.crest} alt="" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '12px' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                )}
                <span style={{ fontWeight: '800', fontSize: '16px', textAlign: 'center' }}>
                  {selectedMatch.resolvedHome?.name || selectedMatch.homeLabel}
                </span>
              </div>

              {/* Score / VS */}
              <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {selectedMatch.isPlaceholder ? (
                  <span style={{ fontSize: '24px', fontWeight: '900', color: 'rgba(255,255,255,0.3)' }}>VS</span>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '36px', fontWeight: '900' }}>{selectedMatch.score?.fullTime?.home ?? '-'}</span>
                    <span style={{ color: 'var(--wc-gold)' }}>:</span>
                    <span style={{ fontSize: '36px', fontWeight: '900' }}>{selectedMatch.score?.fullTime?.away ?? '-'}</span>
                  </div>
                )}
                {selectedMatch.status === 'IN_PLAY' && (
                  <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                    LIVE
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {selectedMatch.resolvedAway?.crest ? (
                  <img src={selectedMatch.resolvedAway.crest} alt="" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '12px' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                )}
                <span style={{ fontWeight: '800', fontSize: '16px', textAlign: 'center' }}>
                  {selectedMatch.resolvedAway?.name || selectedMatch.awayLabel}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <Calendar size={18} />
                <span style={{ fontSize: '14px' }}>
                  {selectedMatch.utcDate 
                    ? new Date(selectedMatch.utcDate).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                    : 'Date & Time TBD'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <MapPin size={18} />
                <span style={{ fontSize: '14px' }}>USA / Canada / Mexico</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Activity size={18} />
                <span style={{ fontSize: '14px' }}>
                  {selectedMatch.isPlaceholder ? 'Matchup Predictor: 50% / 50%' : 'Win Probability Available Soon'}
                </span>
              </div>
            </div>

            {selectedMatch.status === 'IN_PLAY' && (
              <button style={{ width: '100%', padding: '14px', marginTop: '20px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--wc-gold), #b45309)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} /> WATCH LIVE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
