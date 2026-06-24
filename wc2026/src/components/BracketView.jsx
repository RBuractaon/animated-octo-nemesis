import { C, WINNER_SLOTS } from '../data/constants.js';
import { assignThirdsToMatches } from '../lib/standings.js';

function Pill({ children, color = 'gray' }) {
  const map = {
    cyan:  [`${C.cyan}22`,  C.cyan],
    green: [`${C.green}22`, C.green],
    amber: [`${C.gold}22`,  C.gold],
    red:   [`${C.red}22`,   C.red],
    gray:  ['#27272a',      '#71717a'],
  };
  const [bg, fg] = map[color] || map.gray;
  return (
    <span style={{ background:bg, color:fg, border:`1px solid ${fg}44`,
      fontSize:10, fontFamily:'monospace', padding:'1px 7px', borderRadius:3 }}>
      {children}
    </span>
  );
}

// Sort WINNER_SLOTS by match date order for display
const ANNEX_C_ORDER = ['E','I','A','L','D','G','B','K'];

export default function BracketView({ standings, thirds, loading }) {
  if (loading) return null;
  if (!standings || !thirds) return null;

  // Exclusive assignment: each qualifying 3rd is claimed by exactly one match
  const assigned = assignThirdsToMatches(thirds);

  // Reverse map: matchIdx → third team row
  const matchToThird = {};
  for (const [thirdGroup, info] of Object.entries(assigned)) {
    const thirdTeam = thirds.find(t => t.group === thirdGroup);
    if (thirdTeam) matchToThird[info.matchIdx] = thirdTeam;
  }

  // Set of matchIdxes that already have a third claimed
  const claimedMatchIdxes = new Set(Object.values(assigned).map(a => a.matchIdx));
  // Set of third groups already assigned somewhere
  const claimedGroups = new Set(Object.keys(assigned));

  return (
    <>
      <div style={{ marginBottom:12 }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase' }}>
          R32 Bracket Assignments
        </span>
        <span style={{ fontSize:10, color:'#3a3a46', marginLeft:8 }}>Annex C · who each group winner faces</span>
        <div style={{ height:1, background:C.border, marginTop:4 }} />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:16 }}>
        {ANNEX_C_ORDER.map(grp => {
          const slot = WINNER_SLOTS[grp];
          const winner = standings[grp]?.[0];
          const assignedThird = matchToThird[slot.matchIdx];

          // Pool candidates not yet claimed by another match
          const poolCandidates = thirds.filter(t =>
            slot.pool.includes(t.group) &&
            t.safe &&
            (!claimedGroups.has(t.group) || assigned[t.group]?.matchIdx === slot.matchIdx)
          );

          return (
            <div key={grp} style={{
              background: C.card, border:`1px solid ${C.cyan}33`, borderRadius:5, padding:'10px 13px',
            }}>
              {/* Header row */}
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6, flexWrap:'wrap' }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.cyan }}>
                  {winner?.team || `Group ${grp} winner`}
                </span>
                <Pill color="cyan">Grp {grp}</Pill>
                <span style={{ fontSize:10, color:C.muted }}>
                  Match {slot.match} · {slot.date} · {slot.venue}
                </span>
              </div>

              {/* Opponent row */}
              {assignedThird ? (
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, color:C.muted }}>vs</span>
                  <span style={{ fontSize:13, fontWeight:600, color:C.gold }}>
                    {assignedThird.team}
                  </span>
                  <span style={{ fontSize:10, color:C.muted }}>
                    Grp {assignedThird.group} · {assignedThird.pts}pts · #{assignedThird.rank} of 12 thirds
                  </span>
                </div>
              ) : poolCandidates.length > 0 ? (
                <div>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>
                    3rd-place pool: Groups {slot.pool.join(', ')}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 12px' }}>
                    {poolCandidates.map((t, i) => (
                      <span key={t.team} style={{ fontSize:11 }}>
                        <span style={{ color: i === 0 ? C.gold : C.dim }}>{t.team}</span>
                        <span style={{ color:C.muted }}> Grp{t.group} {t.pts}pts</span>
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize:10, color:'#4a4a58', marginTop:3 }}>
                    Bracket locks Jun 27 — assignment pending
                  </div>
                </div>
              ) : (
                <div style={{ fontSize:10, color:C.muted }}>
                  <div style={{ marginBottom:2 }}>3rd-place pool: Groups {slot.pool.join(', ')}</div>
                  <span style={{ color:'#4a4a58' }}>No qualifying thirds from this pool yet</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Standard bracket (non-Annex-C) */}
      <div style={{ marginBottom:12 }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase' }}>
          Standard Bracket Matches
        </span>
        <span style={{ fontSize:10, color:'#3a3a46', marginLeft:8 }}>1st vs 2nd · exact pairing per FIFA draw</span>
        <div style={{ height:1, background:C.border, marginTop:4 }} />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:16 }}>
        {['C','F','H','J'].map(grp => {
          const winner = standings[grp]?.[0];
          const runnerUp = standings[grp]?.[1];
          return (
            <div key={grp} style={{
              background:'#0f1017', border:`1px solid ${C.border}`, borderRadius:5, padding:'10px 13px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom: runnerUp ? 4 : 0 }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>
                  {winner?.team || `Group ${grp} winner`}
                </span>
                <Pill color="gray">Grp {grp}</Pill>
                <span style={{ fontSize:10, color:C.muted }}>vs runner-up from bracket draw</span>
              </div>
              {runnerUp && (
                <div style={{ fontSize:10, color:'#4a4a58' }}>
                  2nd: {runnerUp.team} ({runnerUp.pts}pts) · opponent TBD by FIFA bracket draw
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background:'#0f1017', border:`1px solid ${C.border}`, borderRadius:5, padding:'11px 13px', fontSize:11, color:C.muted, lineHeight:1.6 }}>
        <span style={{ color:'#a1a1aa', fontWeight:600 }}>How Annex C works: </span>
        A 3rd-place team's <em>group of origin</em> determines which group winner they face.
        FIFA pre-mapped all 495 combinations. The bracket auto-locks June 27 with no draw needed.
        Each 3rd-place team appears in <em>exactly one</em> match slot above.
      </div>
    </>
  );
}
