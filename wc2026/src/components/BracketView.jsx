import { C, WINNER_SLOTS } from '../data/constants.js';

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

export default function BracketView({ standings, thirds, loading }) {
  if (loading) return null;
  if (!standings || !thirds) return null;

  return (
    <>
      <div style={{ marginBottom:12 }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase' }}>
          R32 Bracket Assignments
        </span>
        <span style={{ fontSize:10, color:'#2e2e38', marginLeft:8 }}>Annex C · who each group winner faces</span>
        <div style={{ height:1, background:C.border, marginTop:4 }} />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:16 }}>
        {Object.entries(WINNER_SLOTS).map(([grp, slot]) => {
          const winner = standings[grp]?.[0];
          const eligible = thirds.filter(t => slot.pool.includes(t.group) && t.safe);
          const top = eligible[0];
          const winnerProb = winner ? null : null;

          return (
            <div key={grp} style={{
              background: C.card, border:`1px solid ${C.cyan}33`, borderRadius:5, padding:'10px 13px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5, flexWrap:'wrap' }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.cyan }}>
                  {winner?.team || `Group ${grp} winner`}
                </span>
                <Pill color="cyan">Grp {grp}</Pill>
                <span style={{ fontSize:10, color:C.muted }}>Match {slot.match} · {slot.date} · {slot.venue}</span>
              </div>

              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>
                3rd-place pool:{' '}
                <span style={{ color:'#a1a1aa' }}>Groups {slot.pool.join(', ')}</span>
              </div>

              {eligible.length > 0 ? (
                <div style={{ fontSize:11 }}>
                  {eligible.map((t, i) => (
                    <span key={t.team} style={{ marginRight:10 }}>
                      <span style={{ color: i === 0 ? C.gold : C.dim }}>{t.team}</span>
                      <span style={{ color:C.muted }}> Grp{t.group} {t.pts}pts</span>
                    </span>
                  ))}
                  {top && (
                    <span style={{ fontSize:10, color:C.muted }}>
                      · <span style={{ color:C.gold }}>{top.team}</span> most likely
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize:11, color:C.red }}>
                  No qualifying 3rd-place teams from pool yet
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bracket (non-Annex-C) matches */}
      <div style={{ marginBottom:12 }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase' }}>
          Standard Bracket Matches
        </span>
        <span style={{ fontSize:10, color:'#2e2e38', marginLeft:8 }}>1st vs 2nd · exact pairing per FIFA draw</span>
        <div style={{ height:1, background:C.border, marginTop:4 }} />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:16 }}>
        {['C','F','H','J'].map(grp => {
          const winner = standings[grp]?.[0];
          return (
            <div key={grp} style={{
              background:'#0f1017', border:`1px solid ${C.border}`, borderRadius:5, padding:'10px 13px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>
                  {winner?.team || `Group ${grp} winner`}
                </span>
                <Pill color="gray">Grp {grp}</Pill>
                <span style={{ fontSize:11, color:C.muted }}>vs runner-up from bracket draw</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background:'#0f1017', border:`1px solid ${C.border}`, borderRadius:5, padding:'11px 13px', fontSize:11, color:C.muted, lineHeight:1.6 }}>
        <span style={{ color:'#a1a1aa', fontWeight:600 }}>How Annex C works: </span>
        A 3rd-place team's <em>group of origin</em> (not rank 1–8) determines which group winner they face.
        FIFA pre-mapped all 495 combinations before the tournament. The bracket auto-locks June 27 — no draw needed.
      </div>
    </>
  );
}
