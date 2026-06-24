import { C, GROUPS, WINNER_SLOTS } from '../data/constants.js';

function GDCell({ v }) {
  return (
    <td style={{ textAlign:'center', fontFamily:'monospace', padding:'6px 5px',
      color: v > 0 ? C.green : v < 0 ? C.red : C.dim }}>
      {v > 0 ? `+${v}` : v}
    </td>
  );
}

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

export default function GroupViewer({ standings, thirds, selectedGroup, setSelectedGroup, loading }) {
  if (loading) return null;
  if (!standings) return null;

  const slot = WINNER_SLOTS[selectedGroup];
  const rows = standings[selectedGroup] || [];

  return (
    <>
      <div style={{ marginBottom:12 }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase' }}>
          Group Standings
        </span>
        <div style={{ height:1, background:C.border, marginTop:4 }} />
      </div>

      {/* Group selector */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setSelectedGroup(g)} style={{
            background: selectedGroup === g ? C.cyan : '#1a1b22',
            border: 'none',
            color: selectedGroup === g ? '#000' : C.dim,
            fontSize:11, fontWeight: selectedGroup === g ? 700 : 400,
            padding:'4px 11px', borderRadius:3, cursor:'pointer',
          }}>
            {g}
          </button>
        ))}
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, marginBottom:10 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {[['Pos'],['Team',true],['MP'],['W'],['D'],['L'],['GF'],['GA'],['GD'],['Pts'],['Status']].map(([h,l],i) => (
              <th key={i} style={{
                textAlign: l ? 'left' : 'center', padding:'5px 5px',
                fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase',
                color:C.muted, fontWeight:500,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.team} style={{
              borderBottom:`1px solid #111116`,
              background: r.pos <= 2 ? 'rgba(34,211,238,0.03)' : 'transparent',
            }}>
              <td style={{ textAlign:'center', fontFamily:'monospace', color:C.dim, padding:'6px 5px' }}>{r.pos}</td>
              <td style={{ padding:'6px 5px', fontWeight:500, color:C.text }}>{r.team}</td>
              {['mp','w','d','l','gf','ga'].map(k => (
                <td key={k} style={{ textAlign:'center', fontFamily:'monospace', color:C.dim, padding:'6px 5px' }}>{r[k]}</td>
              ))}
              <GDCell v={r.gd} />
              <td style={{ textAlign:'center', fontFamily:'monospace', fontWeight:700, color:'#f4f4f5', padding:'6px 5px' }}>{r.pts}</td>
              <td style={{ padding:'6px 5px', textAlign:'center' }}>
                {r.pos===1 ? <Pill color="cyan">1st</Pill>
                 : r.pos===2 ? <Pill color="green">2nd</Pill>
                 : r.pos===3 ? <Pill color="amber">3rd</Pill>
                 : <Pill color="red">4th</Pill>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {slot && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:5, padding:'12px 14px' }}>
          <p style={{ fontSize:12, color:C.text, marginBottom:5 }}>
            <span style={{ color:C.cyan, fontWeight:700 }}>Group {selectedGroup} winner</span>
            {' '}→ R32 Match {slot.match} · 3rd-place pool: Groups{' '}
            <strong>{slot.pool.join(', ')}</strong>
          </p>
          <p style={{ fontSize:11, color:C.muted }}>{slot.date} · {slot.venue}</p>
          {thirds && (() => {
            const eligible = thirds.filter(t => slot.pool.includes(t.group) && t.safe);
            if (!eligible.length) return null;
            return (
              <p style={{ fontSize:11, color:C.text, marginTop:6 }}>
                Currently qualifying from pool:{' '}
                {eligible.map((t, i) => (
                  <span key={t.team}>
                    {i > 0 && ', '}
                    <span style={{ color: i === 0 ? C.gold : C.text }}>{t.team}</span>
                    <span style={{ color:C.muted }}> (Grp{t.group}, {t.pts}pts)</span>
                  </span>
                ))}
              </p>
            );
          })()}
        </div>
      )}

      {!slot && selectedGroup && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:5, padding:'12px 14px', fontSize:11, color:C.muted }}>
          Group {selectedGroup} winner faces a <strong style={{ color:C.silver }}>runner-up</strong> from
          a predetermined bracket slot (not an Annex C 3rd-place assignment).
        </div>
      )}
    </>
  );
}
