import { C } from '../data/constants.js';

// React is required in scope for <> fragments when using older JSX transform
// (no-op import under new transform but harmless)
import React from 'react';

function Pill({ children, color = 'gray' }) {
  const map = {
    green:  [`${C.green}22`, C.green],
    red:    [`${C.red}22`,   C.red],
    amber:  [`${C.gold}22`,  C.gold],
    cyan:   [`${C.cyan}22`,  C.cyan],
    gray:   ['#27272a',      '#71717a'],
  };
  const [bg, fg] = map[color] || map.gray;
  return (
    <span style={{
      background: bg, color: fg, border: `1px solid ${fg}44`,
      fontSize: 10, fontFamily: 'monospace', padding: '1px 7px', borderRadius: 3,
    }}>
      {children}
    </span>
  );
}

function GDCell({ v }) {
  return (
    <td style={{ textAlign:'center', fontFamily:'monospace', padding:'6px 5px',
      color: v > 0 ? C.green : v < 0 ? C.red : C.dim }}>
      {v > 0 ? `+${v}` : v}
    </td>
  );
}

const td = (v, x = {}) => (
  <td style={{ textAlign:'center', fontFamily:'monospace', color: C.dim, padding:'6px 5px', ...x }}>
    {v}
  </td>
);

const th = (v, left) => (
  <th style={{
    textAlign: left ? 'left' : 'center', padding:'5px 5px',
    fontSize: 9, letterSpacing:'0.08em', textTransform:'uppercase',
    color: C.muted, fontWeight: 500,
  }}>
    {v}
  </th>
);

export default function ThirdsTable({ thirds, groupProgress = {}, loading }) {
  if (loading) return null;
  if (!thirds || thirds.length === 0)
    return <p style={{ color: C.muted, fontSize: 12 }}>No 3rd-place data yet — waiting for matchday results.</p>;

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 10 }}>
          <span style={{ fontSize:10, letterSpacing:'0.15em', color: C.muted, textTransform:'uppercase' }}>
            3rd Place Rankings
          </span>
          <span style={{ fontSize:10, color:'#2e2e38' }}>Top 8 advance · Pts→GD→GF→FIFA Rank</span>
        </div>
        <div style={{ height:1, background: C.border, marginTop:4 }} />
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {[['#'],['Team',true],['Grp'],['MP'],['W'],['D'],['L'],['GF'],['GA'],['GD'],['Pts'],['Status']].map(([h,l],i)=>
                <React.Fragment key={i}>{th(h,l)}</React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {thirds.map((r, i) => (
              <React.Fragment key={r.team}>
                {i === 8 && (
                  <tr>
                    <td colSpan={12} style={{ padding:'3px 5px' }}>
                      <div style={{ borderTop:`1px dashed ${C.border}`, margin:'2px 0' }} />
                      <span style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                        ── eliminated ──
                      </span>
                    </td>
                  </tr>
                )}
                <tr style={{
                  borderBottom:`1px solid #111116`,
                  background: i < 8 ? 'rgba(34,211,238,0.02)' : 'transparent',
                  opacity: i < 8 ? 1 : 0.5,
                }}>
                  {td(r.rank, { color: C.muted })}
                  <td style={{ padding:'6px 5px', fontWeight:500, color: C.text, whiteSpace:'nowrap' }}>
                    {r.team}
                    {i === 7 && <span style={{ fontSize:9, color: C.gold, marginLeft:6 }}>◀ cutline</span>}
                  </td>
                  <td style={{ textAlign:'center', fontFamily:'monospace', color:'#a1a1aa', padding:'6px 5px', whiteSpace:'nowrap' }}>
                    {r.group}
                    {groupProgress[r.group] === 6
                      ? <span style={{ color:C.green, fontSize:9, marginLeft:3 }}>✓</span>
                      : groupProgress[r.group]
                        ? <span style={{ color:C.muted, fontSize:9, marginLeft:3 }}>{groupProgress[r.group]}/6</span>
                        : null}
                  </td>
                  {td(r.mp)}{td(r.w)}{td(r.d)}{td(r.l)}{td(r.gf)}{td(r.ga)}
                  <GDCell v={r.gd} />
                  {td(r.pts, { fontWeight:700, color:'#f4f4f5' })}
                  <td style={{ padding:'6px 5px', textAlign:'center' }}>
                    {i < 8 ? <Pill color="green">IN</Pill> : <Pill color="red">OUT</Pill>}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:10, color: C.muted, marginTop:8 }}>
        Note: Fair-play (card) tiebreaker not available in this feed — FIFA ranking used as proxy.
        Final seeding confirmed by FIFA June 27.
      </p>
    </>
  );
}

