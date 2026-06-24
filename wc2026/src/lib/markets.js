import { MARKET_ODDS } from '../data/constants.js';

const POLYMARKET_URL =
  'https://gamma-api.polymarket.com/markets?q=2026+FIFA+World+Cup+winner&limit=50&active=true';

// Map common Polymarket team name variants to our canonical names
const NAME_MAP = {
  'united states': 'United States',
  'usa': 'United States',
  'us': 'United States',
  'ivory coast': 'Ivory Coast',
  "côte d'ivoire": 'Ivory Coast',
  'bosnia and herzegovina': 'Bosnia & Herzegovina',
  'bosnia & herzegovina': 'Bosnia & Herzegovina',
  'dr congo': 'DR Congo',
  'democratic republic of the congo': 'DR Congo',
  'cape verde': 'Cape Verde',
  'new zealand': 'New Zealand',
  'south korea': 'South Korea',
  'south africa': 'South Africa',
  'saudi arabia': 'Saudi Arabia',
};

function normalizeTeam(name) {
  const lower = name.toLowerCase().trim();
  return NAME_MAP[lower] || name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export async function fetchLiveOdds() {
  const res = await fetch(POLYMARKET_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Polymarket ${res.status}`);
  const data = await res.json();
  const markets = Array.isArray(data) ? data : (data.markets || []);

  const odds = {};
  for (const market of markets) {
    const title = (market.question || market.title || '').toLowerCase();
    if (!title.includes('world cup') && !title.includes('winner')) continue;
    const tokens = market.tokens || market.outcomes || [];
    for (const token of tokens) {
      const team = normalizeTeam(token.outcome || token.name || '');
      const price = parseFloat(token.price ?? token.probability ?? 0);
      if (team && price > 0) odds[team] = price;
    }
  }

  if (Object.keys(odds).length < 10) throw new Error('Insufficient market data');
  return odds;
}

export function mergeOdds(liveOdds) {
  return { ...MARKET_ODDS, ...liveOdds };
}
