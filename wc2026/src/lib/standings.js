import { GROUP_TEAMS, FIFA_RANK } from '../data/constants.js';

export function computeStandings(matches) {
  const standings = {};
  for (const [g, teams] of Object.entries(GROUP_TEAMS)) {
    standings[g] = {};
    for (const t of teams)
      standings[g][t] = { mp:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 };
  }

  for (const m of matches) {
    if (!m.score || !m.group) continue;
    const g = m.group.replace('Group ', '');
    if (!standings[g]) continue;
    const [t1, t2] = [m.team1, m.team2];
    const [g1, g2] = m.score.ft;
    for (const [t, gf, ga] of [[t1,g1,g2],[t2,g2,g1]]) {
      if (!standings[g][t])
        standings[g][t] = { mp:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 };
      const s = standings[g][t];
      s.mp++; s.gf += gf; s.ga += ga; s.gd += gf - ga;
      if (gf > ga) { s.w++; s.pts += 3; }
      else if (gf < ga) s.l++;
      else { s.d++; s.pts++; }
    }
  }

  const sorted = {};
  for (const [g, teams] of Object.entries(standings)) {
    sorted[g] = Object.entries(teams)
      .sort(([, a], [, b]) =>
        b.pts - a.pts || b.gd - a.gd || b.gf - a.gf ||
        (FIFA_RANK[a] || 99) - (FIFA_RANK[b] || 99)
      )
      .map(([team, s], i) => ({ pos: i+1, team, ...s }));
  }
  return sorted;
}

export function computeThirds(standings) {
  const thirds = [];
  for (const [g, rows] of Object.entries(standings)) {
    if (rows.length >= 3 && rows[2].mp > 0)
      thirds.push({ group: g, ...rows[2] });
  }
  return thirds
    .sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf ||
      (FIFA_RANK[a.team] || 99) - (FIFA_RANK[b.team] || 99)
    )
    .map((t, i) => ({ rank: i+1, safe: i < 8, ...t }));
}

// Assign qualifying thirds to their Annex C match (simplified: first eligible pool)
export function assignThirdsToMatches(thirds) {
  const ANNEX_C = [
    { winnerGroup:'E', pool:['A','B','C','D','F'], matchIdx:1  },
    { winnerGroup:'I', pool:['C','D','F','G','H'], matchIdx:4  },
    { winnerGroup:'A', pool:['C','E','F','H','I'], matchIdx:6  },
    { winnerGroup:'L', pool:['E','H','I','J','K'], matchIdx:7  },
    { winnerGroup:'D', pool:['B','E','F','I','J'], matchIdx:8  },
    { winnerGroup:'G', pool:['A','E','H','I','J'], matchIdx:9  },
    { winnerGroup:'B', pool:['E','F','G','I','J'], matchIdx:12 },
    { winnerGroup:'K', pool:['D','E','I','J','L'], matchIdx:14 },
  ];
  const used = new Set();
  const result = {};
  for (const t of thirds.slice(0, 8)) {
    for (const entry of ANNEX_C) {
      if (!used.has(entry.matchIdx) && entry.pool.includes(t.group)) {
        result[t.group] = { matchIdx: entry.matchIdx, winnerGroup: entry.winnerGroup };
        used.add(entry.matchIdx);
        break;
      }
    }
  }
  return result;
}
