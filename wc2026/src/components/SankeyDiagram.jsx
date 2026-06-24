import { useState, useMemo } from 'react';
import { C, GROUPS, R32_MATCHES, WINNER_SLOTS, RUNNERUP_MATCH_IDX, MARKET_ODDS } from '../data/constants.js';
import { assignThirdsToMatches } from '../lib/standings.js';

const SVG_W = 920;
const SVG_H = 730;
const GRP_CX  = 90;   // group node center-x
const GRP_NW  = 140;  // group node width
const GRP_NH  = 34;   // group node height
const MATCH_CX = 810; // match node center-x
const MATCH_NW = 160; // match node width
const MATCH_NH = 32;  // match node height
const MID_X   = (GRP_CX + GRP_NW/2 + MATCH_CX - MATCH_NW/2) / 2; // bezier ctrl x

function groupY(i)  { return 38 + i * 56; }
function matchY(j)  { return 24 + j * 43; }

function probToWidth(prob, scale = 90) {
  return Math.max(1.2, Math.sqrt(prob) * scale);
}

function Tooltip({ x, y, children }) {
  return (
    <foreignObject x={x - 90} y={y + 8} width={180} height={60} style={{ pointerEvents:'none' }}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={{
        background:'#1e2030', border:`1px solid ${C.border}`, borderRadius:4,
        padding:'5px 8px', fontSize:10, color: C.text, lineHeight:1.5,
      }}>
        {children}
      </div>
    </foreignObject>
  );
}

export default function SankeyDiagram({ standings, thirds, marketOdds = MARKET_ODDS }) {
  const [hoverId, setHoverId] = useState(null);

  const { links, groupMeta, matchMeta } = useMemo(() => {
    if (!standings) return { links:[], groupMeta:{}, matchMeta:{} };

    const links = [];
    const gMeta = {};
    const mMeta = {};

    // Precompute winner match indices (Annex C groups) + bracket groups
    const WINNER_MATCH = { A:6, B:12, D:8, E:1, G:9, I:4, K:14, L:7 };
    const BRACKET_MATCH = { C:0, F:2, H:3, J:5 };

    // Precompute 3rd-place assignments
    const thirdAssign = thirds ? assignThirdsToMatches(thirds) : {};

    GROUPS.forEach((g, gi) => {
      const winner   = standings[g]?.[0];
      const runner   = standings[g]?.[1];
      const srcY_ctr = groupY(gi);

      gMeta[g] = { gi, winner: winner?.team, runner: runner?.team };

      // ── Winner path (gold) ──────────────────────────────────────────────
      const winMatchIdx = WINNER_MATCH[g] ?? BRACKET_MATCH[g];
      if (winner && winMatchIdx !== undefined) {
        const prob = marketOdds[winner.team] ?? 0;
        const dstY = matchY(winMatchIdx);
        links.push({
          id: `win-${g}`, type:'winner', team: winner.team, group: g,
          matchIdx: winMatchIdx, prob,
          srcY: srcY_ctr - 7, dstY: dstY - 5,
          color: C.gold, width: probToWidth(prob, 95),
          isAnnexC: !!WINNER_MATCH[g],
        });
      }

      // ── Runner-up path (silver) ──────────────────────────────────────────
      const runMatchIdx = RUNNERUP_MATCH_IDX[g];
      if (runner && runMatchIdx !== undefined) {
        const prob = marketOdds[runner.team] ?? 0;
        const dstY = matchY(runMatchIdx);
        links.push({
          id: `run-${g}`, type:'runner', team: runner.team, group: g,
          matchIdx: runMatchIdx, prob,
          srcY: srcY_ctr + 7, dstY: dstY + 5,
          color: C.silver, width: probToWidth(prob, 75),
          isAnnexC: false,
        });
      }

      // ── 3rd-place path (bronze) ──────────────────────────────────────────
      const assign = thirdAssign[g];
      if (assign && thirds) {
        const third = thirds.find(t => t.group === g && t.safe);
        if (third) {
          const prob = marketOdds[third.team] ?? 0;
          const dstY = matchY(assign.matchIdx);
          links.push({
            id: `third-${g}`, type:'third', team: third.team, group: g,
            matchIdx: assign.matchIdx, prob,
            srcY: srcY_ctr, dstY: dstY + 12,
            color: C.bronze, width: probToWidth(prob, 75),
            isAnnexC: true,
          });
        }
      }
    });

    // Build match metadata
    R32_MATCHES.forEach((m, j) => {
      const wGrp = m.winnerGroup;
      const winnerTeam = wGrp ? standings[wGrp]?.[0]?.team : null;
      mMeta[j] = { match: m, winnerTeam };
    });

    return { links, groupMeta: gMeta, matchMeta: mMeta };
  }, [standings, thirds, marketOdds]);

  const [tooltip, setTooltip] = useState(null);

  function handleLinkEnter(link, e) {
    setHoverId(`link-${link.id}`);
    setTooltip({ x: SVG_W / 2, y: SVG_H - 100, link });
  }

  function isHighlighted(link) {
    if (!hoverId) return false;
    if (hoverId === `group-${link.group}`)  return true;
    if (hoverId === `match-${link.matchIdx}`) return true;
    if (hoverId === `link-${link.id}`)     return true;
    return false;
  }

  function pathOpacity(link) {
    if (!hoverId) return 0.48;
    return isHighlighted(link) ? 0.88 : 0.06;
  }

  return (
    <div>
      <div style={{ marginBottom:12 }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', color:C.muted, textTransform:'uppercase' }}>
          Bracket Routing Sankey
        </span>
        <span style={{ fontSize:10, color:'#2e2e38', marginLeft:8 }}>
          Path width = tournament win probability · Hover to trace a group
        </span>
        <div style={{ height:1, background:C.border, marginTop:4 }} />
      </div>

      <div style={{ overflowX:'auto', overflowY:'hidden' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width:'100%', maxWidth: SVG_W, display:'block', minWidth: 600 }}
          onMouseLeave={() => { setHoverId(null); setTooltip(null); }}
        >
          {/* ── Bezier paths (drawn below nodes) ───────────────────────────── */}
          {links.map(link => {
            const srcX = GRP_CX + GRP_NW / 2;
            const dstX = MATCH_CX - MATCH_NW / 2;
            const path = `M ${srcX},${link.srcY} C ${MID_X},${link.srcY} ${MID_X},${link.dstY} ${dstX},${link.dstY}`;
            const hl = isHighlighted(link);
            return (
              <path
                key={link.id}
                d={path}
                fill="none"
                stroke={link.color}
                strokeWidth={link.width}
                strokeOpacity={pathOpacity(link)}
                strokeLinecap="round"
                style={{ cursor:'pointer', transition:'stroke-opacity 0.15s' }}
                onMouseEnter={(e) => handleLinkEnter(link, e)}
                onMouseLeave={() => { setHoverId(null); setTooltip(null); }}
              />
            );
          })}

          {/* ── Group nodes (left) ─────────────────────────────────────────── */}
          {GROUPS.map((g, gi) => {
            const y   = groupY(gi);
            const x   = GRP_CX - GRP_NW / 2;
            const meta = groupMeta[g] || {};
            const isH  = hoverId === `group-${g}`;
            return (
              <g
                key={g}
                onMouseEnter={() => setHoverId(`group-${g}`)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor:'pointer' }}
              >
                <rect
                  x={x} y={y - GRP_NH/2} width={GRP_NW} height={GRP_NH} rx={4}
                  fill={isH ? '#1a2030' : C.card}
                  stroke={isH ? C.cyan : C.border}
                  strokeWidth={isH ? 1.5 : 1}
                />
                <text x={x + 8} y={y - 4} fill={C.cyan} fontSize={8} fontWeight={700} fontFamily="monospace">
                  GROUP {g}
                </text>
                <text x={x + 8} y={y + 9} fill={C.text} fontSize={9} fontFamily="system-ui">
                  {meta.winner ? meta.winner.slice(0, 16) : '–'}
                </text>
              </g>
            );
          })}

          {/* ── R32 Match nodes (right) ────────────────────────────────────── */}
          {R32_MATCHES.map((m, j) => {
            const y   = matchY(j);
            const x   = MATCH_CX - MATCH_NW / 2;
            const isAC = m.type === 'annex-c';
            const isH  = hoverId === `match-${j}`;
            const meta = matchMeta[j] || {};
            const label = meta.winnerTeam ? meta.winnerTeam.slice(0, 14) : (m.winnerGroup ? `Grp${m.winnerGroup}` : '?');

            return (
              <g
                key={m.id}
                onMouseEnter={() => setHoverId(`match-${j}`)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor:'pointer' }}
              >
                <rect
                  x={x} y={y - MATCH_NH/2} width={MATCH_NW} height={MATCH_NH} rx={4}
                  fill={isAC ? '#0f1825' : '#0e0f15'}
                  stroke={isH ? C.cyan : (isAC ? `${C.cyan}33` : C.border)}
                  strokeWidth={isH ? 1.5 : 1}
                />
                <text x={x + 8} y={y - 4}
                  fill={isAC ? C.cyan : C.muted}
                  fontSize={8} fontWeight={700} fontFamily="monospace">
                  M{m.n} {m.date}{isAC ? ' ·AC' : ''}
                </text>
                <text x={x + 8} y={y + 9}
                  fill={isAC ? C.text : '#4a4a55'}
                  fontSize={9} fontFamily="system-ui">
                  {label}
                  {isAC && m.pool && <tspan fill={C.dim}> / 3rd[{m.pool.join('')}]</tspan>}
                </text>
              </g>
            );
          })}

          {/* ── Tooltip ───────────────────────────────────────────────────── */}
          {tooltip && tooltip.link && (
            <foreignObject x={SVG_W/2 - 120} y={SVG_H - 85} width={240} height={70} style={{ pointerEvents:'none' }}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{
                background:'#1a1b28', border:`1px solid ${C.border}`, borderRadius:5,
                padding:'6px 10px', fontSize:10, color:C.text, lineHeight:1.6,
              }}>
                <div style={{ color: tooltip.link.color, fontWeight:700 }}>
                  {tooltip.link.team}
                </div>
                <div style={{ color:C.muted }}>
                  {tooltip.link.type === 'winner'  && 'Group winner'}
                  {tooltip.link.type === 'runner'  && 'Runner-up'}
                  {tooltip.link.type === 'third'   && '3rd place (qualifying)'}
                  {' · '}{(tooltip.link.prob * 100).toFixed(1)}% tournament win prob
                </div>
              </div>
            </foreignObject>
          )}

          {/* ── Legend ────────────────────────────────────────────────────── */}
          <g transform={`translate(${SVG_W/2 - 240}, ${SVG_H - 18})`}>
            {[
              [C.gold,   'Group Winners (Annex C)'],
              [C.silver, 'Runners-up (bracket)'],
              [C.bronze, 'Qualifying 3rds (Annex C)'],
            ].map(([color, label], i) => (
              <g key={i} transform={`translate(${i * 165}, 0)`}>
                <line x1={0} y1={0} x2={22} y2={0} stroke={color} strokeWidth={3} strokeOpacity={0.7} />
                <text x={27} y={4} fill={C.muted} fontSize={9} fontFamily="system-ui">{label}</text>
              </g>
            ))}
          </g>

          {/* Column labels */}
          <text x={GRP_CX} y={12} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="monospace" letterSpacing="0.1em">
            GROUPS
          </text>
          <text x={MATCH_CX} y={12} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="monospace" letterSpacing="0.1em">
            R32 MATCHES
          </text>
          <text x={MID_X} y={12} textAnchor="middle" fill={'#252530'} fontSize={9} fontFamily="monospace" letterSpacing="0.1em">
            ─── path width = win probability ───
          </text>
        </svg>
      </div>

      <p style={{ fontSize:10, color:C.muted, marginTop:8, lineHeight:1.6 }}>
        <strong style={{ color:'#a1a1aa' }}>·AC</strong> = Annex C match (winner vs 3rd place).
        Runner-up paths are approximate — exact pairings per FIFA bracket draw.
        3rd-place routing uses simplified first-eligible-pool assignment; exact mapping per FIFA Annex C lookup table (495 combinations).
      </p>
    </div>
  );
}
