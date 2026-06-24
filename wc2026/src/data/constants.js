export const GROUP_TEAMS = {
  A: ["Mexico","South Korea","Czech Republic","South Africa"],
  B: ["Canada","Switzerland","Bosnia & Herzegovina","Qatar"],
  C: ["Brazil","Morocco","Scotland","Haiti"],
  D: ["United States","Australia","Paraguay","Turkey"],
  E: ["Germany","Ivory Coast","Ecuador","Curacao"],
  F: ["Netherlands","Japan","Sweden","Tunisia"],
  G: ["Egypt","Belgium","Iran","New Zealand"],
  H: ["Spain","Cape Verde","Uruguay","Saudi Arabia"],
  I: ["France","Norway","Senegal","Iraq"],
  J: ["Argentina","Austria","Algeria","Jordan"],
  K: ["Colombia","Portugal","DR Congo","Uzbekistan"],
  L: ["England","Ghana","Croatia","Panama"],
};

export const FIFA_RANK = {
  "France":1,"Argentina":2,"Spain":3,"England":5,"Brazil":6,"Portugal":7,
  "Netherlands":8,"Belgium":9,"Croatia":10,"Germany":11,"Norway":12,
  "Morocco":13,"USA":13,"Colombia":14,"Senegal":15,"Mexico":16,
  "Japan":18,"Switzerland":19,"Uruguay":20,"Iran":21,
  "South Korea":22,"Turkey":22,"Ecuador":23,"Australia":24,
  "Sweden":25,"Tunisia":27,"Austria":28,"Panama":34,"Egypt":35,
  "Czech Republic":40,"Canada":40,"Algeria":47,"Ivory Coast":48,
  "Bosnia & Herzegovina":52,"DR Congo":55,"Qatar":56,"Saudi Arabia":58,
  "Ghana":60,"Paraguay":61,"South Africa":66,"Iraq":69,"Uzbekistan":73,
  "Cape Verde":75,"Haiti":82,"Curacao":85,"New Zealand":95,"Jordan":96,
  "United States":13,
};

// Annex C: group winner → 3rd-place pool + match details
// Match numbers and venues confirmed from CBS Sports bracket (Jun 24 2026)
export const WINNER_SLOTS = {
  A: { pool:["C","E","F","H","I"], match:79, matchIdx:6,  date:"Jun 30", venue:"Mexico City"     }, // vs C3 Scotland
  B: { pool:["E","F","G","I","J"], match:84, matchIdx:11, date:"Jul 2",  venue:"Vancouver"        }, // vs G3 Belgium
  D: { pool:["B","E","F","I","J"], match:82, matchIdx:9,  date:"Jul 1",  venue:"Santa Clara"      }, // vs B3 Bosnia
  E: { pool:["A","B","C","D","F"], match:75, matchIdx:2,  date:"Jun 29", venue:"Foxborough"       }, // vs D3 Paraguay
  G: { pool:["A","E","H","I","J"], match:81, matchIdx:8,  date:"Jul 1",  venue:"Seattle"          }, // vs A3 Czechia
  I: { pool:["C","D","F","G","H"], match:78, matchIdx:5,  date:"Jun 30", venue:"East Rutherford"  }, // vs F3 Sweden
  K: { pool:["D","E","I","J","L"], match:88, matchIdx:15, date:"Jul 3",  venue:"Kansas City"      }, // vs L3 Croatia
  L: { pool:["E","H","I","J","K"], match:80, matchIdx:7,  date:"Jul 1",  venue:"Atlanta"          }, // vs H3 Cabo Verde
};

// All 16 R32 matches (M73–M88) — CBS Sports confirmed bracket Jun 24 2026
// matchIdx = 0-based index (M73=0, M74=1, ... M88=15)
export const R32_MATCHES = [
  { id:"M73", n:73, type:"runner",  date:"Jun 28", venue:"Inglewood",       note:"A2 South Korea vs B2 Canada"              },
  { id:"M74", n:74, type:"bracket", date:"Jun 29", venue:"Houston",         winnerGroup:"C", note:"C1 Brazil vs F2 Japan"   },
  { id:"M75", n:75, type:"annex-c", date:"Jun 29", venue:"Foxborough",      winnerGroup:"E", pool:["A","B","C","D","F"]     }, // E1 Germany vs D3 Paraguay
  { id:"M76", n:76, type:"bracket", date:"Jun 29", venue:"Monterrey",       winnerGroup:"F", note:"F1 Netherlands vs C2 Morocco" },
  { id:"M77", n:77, type:"runner",  date:"Jun 30", venue:"Arlington",       note:"E2 Ivory Coast vs I2 Norway"              },
  { id:"M78", n:78, type:"annex-c", date:"Jun 30", venue:"East Rutherford", winnerGroup:"I", pool:["C","D","F","G","H"]     }, // I1 France vs F3 Sweden
  { id:"M79", n:79, type:"annex-c", date:"Jun 30", venue:"Mexico City",     winnerGroup:"A", pool:["C","E","F","H","I"]     }, // A1 Mexico vs C3 Scotland
  { id:"M80", n:80, type:"annex-c", date:"Jul 1",  venue:"Atlanta",         winnerGroup:"L", pool:["E","H","I","J","K"]     }, // L1 England vs H3 Cabo Verde
  { id:"M81", n:81, type:"annex-c", date:"Jul 1",  venue:"Seattle",         winnerGroup:"G", pool:["A","E","H","I","J"]     }, // G1 Egypt vs A3 Czechia
  { id:"M82", n:82, type:"annex-c", date:"Jul 1",  venue:"Santa Clara",     winnerGroup:"D", pool:["B","E","F","I","J"]     }, // D1 USA vs B3 Bosnia
  { id:"M83", n:83, type:"bracket", date:"Jul 2",  venue:"Inglewood",       winnerGroup:"H", note:"H1 Spain vs J2 Austria"  },
  { id:"M84", n:84, type:"annex-c", date:"Jul 2",  venue:"Vancouver",       winnerGroup:"B", pool:["E","F","G","I","J"]     }, // B1 Switzerland vs G3 Belgium
  { id:"M85", n:85, type:"runner",  date:"Jul 2",  venue:"Toronto",         note:"K2 Portugal vs L2 Ghana"                  },
  { id:"M86", n:86, type:"runner",  date:"Jul 3",  venue:"Arlington",       note:"D2 Australia vs G2 Iran"                  },
  { id:"M87", n:87, type:"bracket", date:"Jul 3",  venue:"Miami Gardens",   winnerGroup:"J", note:"J1 Argentina vs H2 Uruguay" },
  { id:"M88", n:88, type:"annex-c", date:"Jul 3",  venue:"Kansas City",     winnerGroup:"K", pool:["D","E","I","J","L"]     }, // K1 Colombia vs L3 Croatia
];

// Runner-up matchIdx — which R32 match each group's runner-up plays in
// Confirmed from CBS Sports bracket (Jun 24 2026)
export const RUNNERUP_MATCH_IDX = {
  A:0,  // South Korea (A2) → M73
  B:0,  // Canada (B2) → M73
  C:3,  // Morocco (C2) → M76
  D:13, // Australia (D2) → M86
  E:4,  // Ivory Coast (E2) → M77
  F:1,  // Japan (F2) → M74
  G:13, // Iran (G2) → M86
  H:14, // Uruguay (H2) → M87
  I:4,  // Norway (I2) → M77
  J:10, // Austria (J2) → M83
  K:12, // Portugal (K2) → M85
  L:12, // Ghana (L2) → M85
};

// Polymarket / Kalshi composite win-probability (as of Jun 24, 2026)
export const MARKET_ODDS = {
  "France":0.175, "Argentina":0.135, "Spain":0.115, "England":0.085,
  "Brazil":0.075, "Germany":0.065, "Portugal":0.055, "Netherlands":0.045,
  "United States":0.045, "Colombia":0.025, "Belgium":0.022, "Uruguay":0.018,
  "Mexico":0.015, "Morocco":0.014, "Norway":0.012, "Croatia":0.010,
  "Japan":0.009, "Egypt":0.008, "South Korea":0.007, "Australia":0.006,
  "Switzerland":0.006, "Sweden":0.005, "Canada":0.005, "Algeria":0.005,
  "Austria":0.004, "Senegal":0.004, "Ivory Coast":0.004,
  "Ecuador":0.003, "Turkey":0.003, "Ghana":0.002, "Scotland":0.002,
  "DR Congo":0.002, "Panama":0.002, "Iran":0.002, "Cape Verde":0.0015,
  "Bosnia & Herzegovina":0.001, "Paraguay":0.001, "Qatar":0.001,
  "Saudi Arabia":0.001, "South Africa":0.001, "Tunisia":0.001,
  "Czech Republic":0.001, "Iraq":0.0008, "Jordan":0.0005, "New Zealand":0.0005,
  "Curacao":0.0003, "Uzbekistan":0.0003, "Haiti":0.0002,
};

export const C = {
  bg:"#0b0c10", card:"#13141a", border:"#1e1f28",
  cyan:"#22d3ee", gold:"#f59e0b", green:"#34d399",
  red:"#f87171", muted:"#52525b", text:"#d4d4d8", dim:"#71717a",
  silver:"#94a3b8", bronze:"#b87333", purple:"#a78bfa",
};

export const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
