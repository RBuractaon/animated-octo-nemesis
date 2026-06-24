import { useMemo } from 'react';
import { C, GROUPS, WINNER_SLOTS, MARKET_ODDS } from '../data/constants.js';

function ConfidenceBadge({ level }) {
  const map = { high:[C.green,'HIGH'], med:[C.gold,'MED'], low:[C.red,'LOW'] };
  const [color, label] = map[level] || map.low;
  return (
    <span style={{
      background:`${color}22`, color, border:`1px solid ${color}44`,
      fontSize:9, fontFamily:'monospace', padding:'1px 6px', borderRadius:3, fontWeight:700,
    }}>{label}</span>
  );
}

function ProbBar({ prob, color, max = 0.2 }) {
  const pct = Math.min(1, prob / max) * 100;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:5, background:'#1e1f28', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background: color, borderRadius:3 }} />
      </div>
      <span style={{ fontSize:10, fontFamily:'monospace', color: C.dim, minWidth:38 }}>
        {(prob * 100).toFixed(1)}%
      </span>
    </div>
  );
}

export default function MarketsPanel({ standings, thirds, marketOdds = MARKET_ODDS, marketSource }) {
  const topTeams = useMemo(() => {
    return Object.entries(marketOdds)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 32)
      .map(([team, prob]) => ({ team, prob }));
  }, [marketOdds]);

  const maxProb = topTeams[0]?.prob || 0.2;

  const matchupCards = useMemo(() => {
    if (!standings || !thirds) return [];
    return Object.entries(WINNER_SLOTS).map(([grp, slot]) => {
      const winner = standings[grp]?.[0];
      const eligible = thirds.filter(t => slot.pool.includes(t.group) && t.safe);
      const topThird = eligible[0];
      const winnerProb  = winner  ? (marketOdds[winner.team]  ?? 0) : 0;
      const opponentProb = topThird ? (marketOdds[topThird.team] ?? 0) : 0;

      // Confidence: based on how decided the group is and third-place ranking clarity
      const groupSettled = (standings[grp]?.filter(r => r.mp > 0).length ?? 0) >= 3;
      const thirdsSettled = thirds.length >= 8;
      const confidence =
        groupSettled && thirdsSettled && eligible.length > 0 ? 'high'
        : groupSettled || thirdsSettled ? 'med'
        : 'low';

      // Win probability of the winner in this R32 match
      const totalProb = winnerProb + opponentProb;
      const winnerWinChance = totalProb > 0 ? winnerProb / totalProb : 0.5;

      return {
        group: grp, slot, winner, topThird, eligible,
        winnerProb, opponentProb, winnerWinChance, confidence,
      };
    });
  }, [standings, thirds, marketOdds]);

  // Tournament tier coloring
  function tierColor(prob) {
    if (prob >= 0.08) return C.gold;
    if (prob >= 0.03) return C.cyan;
    if (prob >= 0.01) return C.green;
    return C.muted;
  }

  return (
    <>
      {/* Source note */}
      {marketSource && (
        <div style={{ fontSize:10, color:C.muted, marginBottom:12 }}>
          Market data: <span style={{ color: C.cyan }}>{marketSource}</span>
        </div>
      )}

      {/* ── Win probability bars ───────────────────────────────────────────── */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase', marginBottom:4 }}>
          Tournament Win Probability
        </div>
        <div style={{ height:1, background:C.border, marginBottom:12 }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'6px 16px' }}>
          {topTeams.map(({ team, prob }) => (
            <div key={team} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:11, color: tierColor(prob), minWidth:130, fontWeight: prob >= 0.08 ? 700 : 400 }}>
                {team}
              </span>
              <div style={{ flex:1 }}>
                <ProbBar prob={prob} color={tierColor(prob)} max={maxProb} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:9, color:'#2e2e38', marginTop:8 }}>
          Source: Polymarket / Kalshi composite as of Jun 24, 2026
        </p>
      </div>

      {/* ── R32 Matchup confidence cards ──────────────────────────────────── */}
      {matchupCards.length > 0 && (
        <>
          <div style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase', marginBottom:4 }}>
            Annex C Matchup Predictions
          </div>
          <div style={{ height:1, background:C.border, marginBottom:12 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {matchupCards.map(card => (
              <div key={card.group} style={{
                background: C.card, border:`1px solid ${C.border}`, borderRadius:5,
                padding:'10px 14px',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:6 }}>
                  {/* Winner side */}
                  <div>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>Group {card.group} winner</div>
                    <div style={{ fontSize:14, fontWeight:700, color: C.gold }}>
                      {card.winner?.team || `Group ${card.group}`}
                    </div>
                    <div style={{ fontSize:10, color:C.muted }}>
                      {(card.winnerProb * 100).toFixed(1)}% tournament
                    </div>
                  </div>

                  {/* VS */}
                  <div style={{ fontSize:11, color:C.muted, alignSelf:'center', padding:'0 8px' }}>
                    vs
                  </div>

                  {/* Opponent side */}
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>
                      Most likely 3rd (pool {card.slot.pool.join(',')})
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color: card.topThird ? C.silver : C.muted }}>
                      {card.topThird?.team || 'TBD'}
                    </div>
                    <div style={{ fontSize:10, color:C.muted }}>
                      {card.topThird ? `${(card.opponentProb * 100).toFixed(1)}% tournament` : '–'}
                    </div>
                  </div>
                </div>

                {/* Confidence + win chance */}
                <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <ConfidenceBadge level={card.confidence} />
                  {card.topThird && (
                    <div style={{ fontSize:10, color:C.muted }}>
                      Predicted winner:{' '}
                      <span style={{ color: card.winnerWinChance >= 0.5 ? C.gold : C.silver, fontWeight:600 }}>
                        {card.winnerWinChance >= 0.5 ? card.winner?.team : card.topThird?.team}
                      </span>
                      {' '}at{' '}
                      <span style={{ color:C.text }}>
                        {(Math.max(card.winnerWinChance, 1 - card.winnerWinChance) * 100).toFixed(0)}%
                      </span>
                      {' '}market-implied
                    </div>
                  )}
                  <span style={{ fontSize:10, color:C.muted, marginLeft:'auto' }}>
                    {card.slot.date} · {card.slot.venue}
                  </span>
                </div>

                {/* Eligible pool bar */}
                {card.eligible.length > 1 && (
                  <div style={{ marginTop:6, fontSize:10, color:C.dim }}>
                    Other pool contenders:{' '}
                    {card.eligible.slice(1).map((t, i) => (
                      <span key={t.team}>
                        {i > 0 && ', '}
                        <span style={{ color:'#a1a1aa' }}>{t.team}</span>
                        <span style={{ color:C.muted }}> ({t.pts}pts)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Group × team probability matrix ───────────────────────────────── */}
      <div style={{ marginTop:20 }}>
        <div style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase', marginBottom:4 }}>
          All Groups Summary
        </div>
        <div style={{ height:1, background:C.border, marginBottom:10 }} />
        {standings && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'6px 12px' }}>
            {GROUPS.map(g => {
              const rows = standings[g] || [];
              return (
                <div key={g} style={{ background:'#0f1017', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:C.muted, fontWeight:700, letterSpacing:'0.1em', marginBottom:5 }}>
                    GROUP {g}
                  </div>
                  {rows.map((r, i) => {
                    const prob = marketOdds[r.team] ?? 0;
                    return (
                      <div key={r.team} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                        <span style={{ fontSize:10, color: i < 2 ? C.text : C.muted }}>{r.team}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:50, height:3, background:'#1e1f28', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ width:`${Math.min(1, prob / 0.18) * 100}%`, height:'100%', background: tierColor(prob), borderRadius:2 }} />
                          </div>
                          <span style={{ fontSize:9, fontFamily:'monospace', color:C.dim, minWidth:30 }}>
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  function tierColor(prob) {
    if (prob >= 0.08) return C.gold;
    if (prob >= 0.03) return C.cyan;
    if (prob >= 0.01) return C.green;
    return C.muted;
  }
}
