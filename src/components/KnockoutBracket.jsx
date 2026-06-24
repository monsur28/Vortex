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

  const renderMatch = (match) => {
    if (match.isPlaceholder) {
      return (
        <div className="wc-bracket-match placeholder" key={match.id}>
          <div className="wc-bracket-team"><span>TBD</span></div>
          <div className="wc-bracket-team"><span>TBD</span></div>
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
            <span style={{ fontWeight: match.score?.winner === 'HOME_TEAM' ? '800' : '500' }}>{match.homeTeam?.name || 'TBD'}</span>
          </div>
          <div className="team-score">{homeScore}</div>
        </div>
        <div className="wc-bracket-team">
          <div className="team-info">
            {match.awayTeam?.crest && <img src={match.awayTeam.crest} alt="" />}
            <span style={{ fontWeight: match.score?.winner === 'AWAY_TEAM' ? '800' : '500' }}>{match.awayTeam?.name || 'TBD'}</span>
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
                    {renderMatch(match)}
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
