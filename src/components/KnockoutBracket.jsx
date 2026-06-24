import React from 'react';

const STAGES = [
  { id: 'LAST_32', name: 'Round of 32', matchCount: 16 },
  { id: 'LAST_16', name: 'Round of 16', matchCount: 8 },
  { id: 'QUARTER_FINALS', name: 'Quarter-Finals', matchCount: 4 },
  { id: 'SEMI_FINALS', name: 'Semi-Finals', matchCount: 2 },
  { id: 'FINAL', name: 'Final', matchCount: 1 },
];

export default function KnockoutBracket({ matches }) {
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

  const renderMatch = (match, stageId, index) => {
    const { homeLabel, awayLabel } = getPlaceholderLabels(stageId, index);

    if (match.isPlaceholder) {

      return (
        <div className="wc-bracket-match placeholder" key={match.id}>
          <div className="wc-bracket-team"><span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{homeLabel}</span></div>
          <div className="wc-bracket-team"><span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{awayLabel}</span></div>
        </div>
      );
    }

    const homeScore = match.score?.fullTime?.home ?? '-';
    const awayScore = match.score?.fullTime?.away ?? '-';
    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

    return (
      <div className={`wc-bracket-match ${isLive ? 'live' : ''}`} key={match.id}>
        <div className="wc-bracket-team">
          <div className="team-info">
            {match.homeTeam?.crest && <img src={match.homeTeam.crest} alt="" />}
            <span style={{ fontWeight: match.score?.winner === 'HOME_TEAM' ? '800' : '500', fontSize: match.homeTeam?.name ? '12px' : '10px', color: match.homeTeam?.name ? 'inherit' : 'var(--text-secondary)' }}>
              {match.homeTeam?.name || homeLabel}
            </span>
          </div>
          <div className="team-score">{homeScore}</div>
        </div>
        <div className="wc-bracket-team">
          <div className="team-info">
            {match.awayTeam?.crest && <img src={match.awayTeam.crest} alt="" />}
            <span style={{ fontWeight: match.score?.winner === 'AWAY_TEAM' ? '800' : '500', fontSize: match.awayTeam?.name ? '12px' : '10px', color: match.awayTeam?.name ? 'inherit' : 'var(--text-secondary)' }}>
              {match.awayTeam?.name || awayLabel}
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
    </div>
  );
}
