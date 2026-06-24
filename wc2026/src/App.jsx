import { useState, useEffect, useCallback } from 'react';
import { C, OPENFOOTBALL_URL, MARKET_ODDS } from './data/constants.js';
import { computeStandings, computeThirds } from './lib/standings.js';
import { fetchLiveOdds, mergeOdds } from './lib/markets.js';
import ThirdsTable  from './components/ThirdsTable.jsx';
import GroupViewer  from './components/GroupViewer.jsx';
import BracketView  from './components/BracketView.jsx';
import SankeyDiagram from './components/SankeyDiagram.jsx';
import MarketsPanel  from './components/MarketsPanel.jsx';

const TABS = [
  { id:'thirds',  label:'3rd Place'  },
  { id:'groups',  label:'Groups'     },
  { id:'bracket', label:'Bracket'    },
  { id:'sankey',  label:'Sankey'     },
  { id:'markets', label:'Markets'    },
];

// Tailscale network devices. When browsing the hosted app on rogtowerdb itself,
// use the /api/ proxy path instead of a full URL (nginx routes /api/ → host:8080).
const TAILSCALE_HOSTS = [
  { name:'rogtowerdb',      ip:'100.115.169.40', defaultPort:5173, path:'/api/wc2026.json', online:true  },
  { name:'spark-574e',      ip:'100.127.73.22',  defaultPort:8080, path:'/wc2026.json',     online:true  },
  { name:'pixel-10-pro-xl', ip:'100.123.76.21',  defaultPort:8080, path:'/wc2026.json',     online:true  },
];

export default function App() {
  const [tab, setTab]               = useState('thirds');
  const [standings, setStandings]   = useState(null);
  const [thirds, setThirds]         = useState(null);
  const [marketOdds, setMarketOdds] = useState(MARKET_ODDS);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [dataSource, setDataSource] = useState('');
  const [marketSource, setMarketSource] = useState('hardcoded');
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('G');

  // Custom URL support (for RADIANT airball / Tailscale)
  const [customUrl, setCustomUrl]       = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const storedCustomUrl = typeof localStorage !== 'undefined'
    ? localStorage.getItem('wc2026_custom_url') || '' : '';

  useEffect(() => {
    if (storedCustomUrl) setCustomUrl(storedCustomUrl);
  }, []);

  // ── Fetch live scores ──────────────────────────────────────────────────────
  const loadScores = useCallback(async (url) => {
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Support openfootball format OR custom {standings:{...}} format
    if (json.standings) {
      setStandings(json.standings);
      setThirds(computeThirds(json.standings));
      const count = json.completed_matches || '?';
      setDataSource(`Custom source · ${count} matches · ${json.as_of || 'live'}`);
    } else if (json.matches) {
      const s = computeStandings(json.matches);
      const t = computeThirds(s);
      setStandings(s);
      setThirds(t);
      const completed = json.matches.filter(m => m.score).length;
      setDataSource(`openfootball/worldcup.json · ${completed} matches completed`);
    } else {
      throw new Error('Unrecognised JSON format');
    }
  }, []);

  // ── Fetch prediction market odds ──────────────────────────────────────────
  const loadMarkets = useCallback(async () => {
    try {
      const live = await fetchLiveOdds();
      setMarketOdds(mergeOdds(live));
      setMarketSource('Polymarket live');
    } catch {
      // stay with hardcoded
      setMarketSource('hardcoded (Jun 24, 2026)');
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = customUrl || OPENFOOTBALL_URL;
      await loadScores(url);
    } catch (e1) {
      if (customUrl) {
        // Fall back to openfootball
        try {
          await loadScores(OPENFOOTBALL_URL);
        } catch (e2) {
          setError(`Custom URL failed: ${e1.message}. openfootball fallback also failed: ${e2.message}`);
        }
      } else {
        setError(`Failed to load scores: ${e1.message}`);
      }
    }
    await loadMarkets();
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  }, [customUrl, loadScores, loadMarkets]);

  useEffect(() => { loadAll(); }, [loadAll]);

  function saveCustomUrl(url) {
    setCustomUrl(url);
    if (typeof localStorage !== 'undefined')
      localStorage.setItem('wc2026_custom_url', url);
  }

  return (
    <div style={{ background: C.bg, minHeight:'100vh', color: C.text, fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:'14px 14px 0' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:10 }}>
            <div>
              <p style={{ fontSize:9, letterSpacing:'0.2em', color:C.muted, textTransform:'uppercase', marginBottom:2 }}>
                FIFA World Cup 2026
              </p>
              <h1 style={{ fontSize:19, fontWeight:800, color:'#f4f4f5', margin:0 }}>Bracket Intelligence</h1>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
              {lastUpdated && (
                <p style={{ fontSize:10, color:C.muted }}>Updated {lastUpdated}</p>
              )}
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={loadAll} style={{
                  background: C.border, border:'none', color: C.dim, fontSize:10,
                  padding:'4px 9px', borderRadius:3, cursor:'pointer',
                }}>↻ Refresh</button>
                <button onClick={() => setShowSettings(v => !v)} style={{
                  background: showSettings ? '#1a1b22' : 'transparent',
                  border:`1px solid ${showSettings ? C.cyan : C.border}`,
                  color: showSettings ? C.cyan : C.muted,
                  fontSize:10, padding:'4px 9px', borderRadius:3, cursor:'pointer',
                }}>⚙ Source</button>
              </div>
            </div>
          </div>

          {/* Source badge */}
          {dataSource && (
            <div style={{ marginBottom:8, fontSize:10, color:C.muted, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color: customUrl ? C.purple : C.gold }}>●</span>
              <span>{dataSource}</span>
              {marketSource && (
                <>
                  <span style={{ color:'#2e2e38' }}>·</span>
                  <span style={{ color: marketSource.includes('live') ? C.cyan : C.muted }}>
                    {marketSource}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Settings panel */}
          {showSettings && (
            <div style={{
              background:'#0e0f17', border:`1px solid ${C.border}`, borderRadius:5,
              padding:'12px 14px', marginBottom:10,
            }}>
              {/* Tailscale quick-connect */}
              <p style={{ fontSize:9, letterSpacing:'0.12em', color:C.muted, textTransform:'uppercase', marginBottom:6 }}>
                Tailscale devices
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {TAILSCALE_HOSTS.map(h => (
                  <button
                    key={h.ip}
                    onClick={() => setCustomUrl(`http://${h.ip}:${h.defaultPort}${h.path}`)}
                    style={{
                      background: customUrl.includes(h.ip) ? `${C.purple}22` : '#13141a',
                      border: `1px solid ${customUrl.includes(h.ip) ? C.purple : C.border}`,
                      borderRadius:4, padding:'5px 10px', cursor:'pointer', textAlign:'left',
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background: h.online ? C.green : C.muted, display:'inline-block' }} />
                      <span style={{ fontSize:11, color: C.text, fontWeight:600 }}>{h.name}</span>
                    </div>
                    <div style={{ fontSize:9, color:C.dim, fontFamily:'monospace', marginTop:2 }}>
                      {h.ip}:{h.defaultPort}{h.path}
                    </div>
                  </button>
                ))}
              </div>

              {/* Manual URL input */}
              <p style={{ fontSize:9, letterSpacing:'0.12em', color:C.muted, textTransform:'uppercase', marginBottom:5 }}>
                Data URL
              </p>
              <div style={{ display:'flex', gap:6 }}>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="http://100.115.169.40:8080/wc2026.json"
                  style={{
                    flex:1, background:'#13141a', border:`1px solid ${C.border}`,
                    borderRadius:3, padding:'6px 8px', fontSize:11, color:C.text,
                    outline:'none', fontFamily:'monospace',
                  }}
                />
                <button onClick={() => { saveCustomUrl(customUrl); loadAll(); }} style={{
                  background: C.cyan, color:'#000', border:'none', borderRadius:3,
                  padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
                }}>Connect</button>
                {customUrl && (
                  <button onClick={() => { saveCustomUrl(''); loadAll(); }} style={{
                    background:'transparent', border:`1px solid ${C.border}`,
                    color: C.muted, borderRadius:3, padding:'6px 9px', fontSize:11, cursor:'pointer',
                  }}>×</button>
                )}
              </div>
              <p style={{ fontSize:9, color:'#2e2e38', marginTop:5 }}>
                Accepts openfootball {"{"}"matches":[...]{"}"} or {"{"}"standings":{"{"}A:[...]{"}"}, "as_of":"..."{"}"}
              </p>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display:'flex', gap:0 }}>
            {TABS.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background:'none', border:'none',
                borderBottom: tab === id ? `2px solid ${C.cyan}` : '2px solid transparent',
                color: tab === id ? C.cyan : C.muted,
                fontSize:11, fontWeight: tab === id ? 600 : 400,
                padding:'7px 12px', cursor:'pointer', letterSpacing:'0.02em',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'16px 12px' }}>

        {loading && (
          <div style={{ textAlign:'center', padding:50, color: C.muted, fontSize:12 }}>
            Fetching match data…
          </div>
        )}

        {error && (
          <div style={{
            padding:16, background:'#1a0f0f', border:`1px solid ${C.red}44`,
            borderRadius:5, color: C.red, fontSize:12, marginBottom:12,
          }}>
            <strong>Data fetch failed</strong><br/>{error}<br/>
            <button onClick={loadAll} style={{
              marginTop:10, background: C.cyan, color:'#000', border:'none',
              borderRadius:3, padding:'6px 14px', fontSize:11, cursor:'pointer',
            }}>Retry</button>
          </div>
        )}

        {!loading && tab === 'thirds'  && <ThirdsTable  thirds={thirds} loading={false} />}
        {!loading && tab === 'groups'  && (
          <GroupViewer
            standings={standings} thirds={thirds}
            selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup}
            loading={false}
          />
        )}
        {!loading && tab === 'bracket' && <BracketView  standings={standings} thirds={thirds} loading={false} />}
        {!loading && tab === 'sankey'  && (
          <SankeyDiagram standings={standings} thirds={thirds} marketOdds={marketOdds} />
        )}
        {!loading && tab === 'markets' && (
          <MarketsPanel
            standings={standings} thirds={thirds}
            marketOdds={marketOdds} marketSource={marketSource}
          />
        )}
      </div>
    </div>
  );
}
