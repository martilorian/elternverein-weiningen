import { useState, useEffect } from "react";

const STORAGE_KEY = "ev-weiningen-v3";

const SHIFTS = [
  { id: 1, label: "10:00 – 14:00" },
  { id: 2, label: "14:00 – 18:00" },
  { id: 3, label: "18:00 – 22:00" },
  { id: 4, label: "22:00 – 00:00" },
];
const ROLES = [
  { id: "kellnern", label: "Kellnern", slots: 3, icon: "🍽️" },
  { id: "theke",    label: "Theke",    slots: 2, icon: "🍺" },
  { id: "laeufer",  label: "Läufer",   slots: 2, icon: "🏃" },
];

const defaultData = {
  userName: "",
  events: [
    { id: 1, title: "Herbstfest", date: "2026-09-19", time: "14:00", location: "Dorfplatz Weiningen", description: "Unser jährliches Herbstfest mit Spielen und Grillieren.", category: "Fest", tasks: [{ id: 1, label: "Grillmeister", slots: 2, helpers: [] }, { id: 2, label: "Getränke", slots: 3, helpers: [] }, { id: 3, label: "Kinderprogramm", slots: 4, helpers: [] }], attendees: [] },
    { id: 2, title: "Laternenumzug", date: "2026-11-11", time: "17:30", location: "Schulhaus Weiningen", description: "Traditioneller Laternenumzug durch das Dorf.", category: "Tradition", tasks: [{ id: 1, label: "Laternen basteln", slots: 4, helpers: [] }, { id: 2, label: "Wegbegleitung", slots: 6, helpers: [] }], attendees: [] },
    { id: 3, title: "Weihnachtsmarkt", date: "2026-12-05", time: "15:00", location: "Schulhausplatz Weiningen", description: "Glühwein, Punsch und Basteln für Kinder.", category: "Markt", tasks: [{ id: 1, label: "Stand aufbauen", slots: 3, helpers: [] }, { id: 2, label: "Glühwein servieren", slots: 3, helpers: [] }], attendees: [] },
  ],
  ideas: [
    { id: 1, title: "Velotour durchs Limmattal", text: "Geführte Familienvelotour im Sommer.", author: "Lisa M.", date: "2026-03-15", votes: 8, voters: [] },
    { id: 2, title: "Spielzeug-Flohmarkt", text: "Kinder verkaufen selber — Erlös behalten sie.", author: "Thomas K.", date: "2026-03-28", votes: 12, voters: [] },
  ],
  spielgruppen: [
    { id: 1, name: "Krabbelgruppe", age: "0–2 Jahre", day: "Dienstag", time: "09:30", slots: 10, enrolled: [], description: "Bewegung für die Kleinsten, begleitet von Eltern." },
    { id: 2, name: "Zwergliturnen", age: "2–4 Jahre", day: "Donnerstag", time: "09:00", slots: 12, enrolled: [], description: "Turnen und Spielen in der Turnhalle Weiningen." },
    { id: 3, name: "Spielgruppe Sonnenschein", age: "3–5 Jahre", day: "Mo/Mi", time: "08:30", slots: 14, enrolled: [], description: "Spielen, Basteln, Singen — Vorbereitung auf den Kindergarten." },
    { id: 4, name: "Waldspielgruppe", age: "3–5 Jahre", day: "Freitag", time: "09:00", slots: 8, enrolled: [], description: "Draussen in der Natur, bei jedem Wetter." },
  ],
  babysitter: [
    { id: 1, type: "biete", name: "Anna W.", age: 17, text: "Verfügbar abends und am Wochenende. Erfahrung mit Kleinkindern.", contact: "anna@example.ch", date: "2026-04-01" },
    { id: 2, type: "suche", name: "Familie Müller", age: null, text: "Betreuung für 2 Kinder (4+7) an 1–2 Nachmittagen/Woche.", contact: "mueller@example.ch", date: "2026-04-05" },
  ],
  brett: [
    { id: 1, cat: "Fahrgemeinschaft", title: "Fahrgemeinschaft Zoo Samstag", text: "Noch 3 Plätze frei, Abfahrt 9:30 Weiningen.", author: "Claudia R.", date: "2026-04-10", contact: "claudia@example.ch" },
    { id: 2, cat: "Verschenken", title: "Velo-Anhänger zu verschenken", text: "Einsitzer, guter Zustand, Abholung in Weiningen.", author: "Beat K.", date: "2026-04-08", contact: "beat@example.ch" },
  ],
  members: [],
  // Schichtplan: shift[shiftId][roleId] = [names]
  schichten: {
    1: { kellnern: [], theke: [], laeufer: [] },
    2: { kellnern: [], theke: [], laeufer: [] },
    3: { kellnern: [], theke: [], laeufer: [] },
    4: { kellnern: [], theke: [], laeufer: [] },
  },
};

const CAT_COLORS = {
  Fest: { bg: "#e8f5e0", text: "#2d5a1e", dot: "#5aad48" },
  Tradition: { bg: "#fff3e0", text: "#b25c00", dot: "#f09030" },
  Markt: { bg: "#fce4ec", text: "#b0003a", dot: "#e91e63" },
  Kultur: { bg: "#e3f2fd", text: "#0d5a8a", dot: "#1e88e5" },
  default: { bg: "#f3f0eb", text: "#5a5248", dot: "#9c8f83" },
};
const BRETT_CATS = ["Fahrgemeinschaft", "Verschenken", "Kaufen/Verkaufen", "Sonstiges"];
const BRETT_COLORS = {
  Fahrgemeinschaft: { bg: "#e3f2fd", text: "#0d5a8a" },
  Verschenken: { bg: "#e8f5e0", text: "#2d5a1e" },
  "Kaufen/Verkaufen": { bg: "#fff3e0", text: "#b25c00" },
  Sonstiges: { bg: "#f3f0eb", text: "#5a5248" },
};

const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "long" });
const daysUntil = (d) => Math.ceil((new Date(d + "T00:00:00") - new Date().setHours(0,0,0,0)) / 86400000);

const TABS = [
  { id: "rebblüete", label: "Rebblüete Fest", icon: "🍇" },
  { id: "kalender",  label: "Kalender",       icon: "📅" },
  { id: "helfer",    label: "Helfer",          icon: "🙋" },
  { id: "spielgruppen", label: "Spielgruppen", icon: "🧒" },
  { id: "babysitter", label: "Babysitter",     icon: "👶" },
  { id: "brett",     label: "Schwarzes Brett", icon: "📌" },
  { id: "ideen",     label: "Ideen",           icon: "💡" },
  { id: "mitglied",  label: "Mitglied werden", icon: "📋" },
];

// ── localStorage helpers ───────────────────────────────────
const lsGet = () => { try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : null; } catch { return null; } };
const lsSet = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("rebblüete");
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState("Alle");
  const [newIdea, setNewIdea] = useState({ title: "", text: "" });
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [newBrett, setNewBrett] = useState({ cat: "Fahrgemeinschaft", title: "", text: "", contact: "" });
  const [showBrettForm, setShowBrettForm] = useState(false);
  const [newBaby, setNewBaby] = useState({ type: "biete", text: "", contact: "", age: "" });
  const [showBabyForm, setShowBabyForm] = useState(false);
  const [memberForm, setMemberForm] = useState({ vorname: "", nachname: "", strasse: "", email: "", tel: "", kinder: "", bemerkung: "" });
  const [memberSent, setMemberSent] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    const stored = lsGet();
    const d = stored || defaultData;
    // ensure schichten exists
    if (!d.schichten) d.schichten = defaultData.schichten;
    setData(d);
    if (d.userName) setUserName(d.userName);
  }, []);

  const save = (next) => { lsSet(next); setData(next); };

  const toast_ = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const requireLogin = () => { toast_("Bitte zuerst einloggen.", "warn"); };

  const login = () => {
    if (!nameInput.trim()) return;
    const n = nameInput.trim();
    setUserName(n);
    save({ ...data, userName: n });
    toast_(`Willkommen, ${n}!`);
  };

  // ── Schichten ──────────────────────────────────────────
  const toggleSchicht = (shiftId, roleId) => {
    if (!userName) return requireLogin();
    const schichten = JSON.parse(JSON.stringify(data.schichten));
    const list = schichten[shiftId][roleId];
    const role = ROLES.find(r => r.id === roleId);
    if (list.includes(userName)) {
      schichten[shiftId][roleId] = list.filter(n => n !== userName);
    } else {
      if (list.length >= role.slots) return toast_("Alle Plätze in dieser Schicht vergeben.", "warn");
      // check if already in this shift (different role)
      const alreadyInShift = ROLES.some(r => schichten[shiftId][r.id].includes(userName));
      if (alreadyInShift) return toast_("Du bist schon in dieser Schicht eingetragen.", "warn");
      schichten[shiftId][roleId] = [...list, userName];
    }
    save({ ...data, schichten });
  };

  // Count how many shifts a person has
  const myShifts = (d) => {
    if (!d || !userName) return [];
    return SHIFTS.filter(s => ROLES.some(r => d.schichten[s.id][r.id].includes(userName)));
  };

  // ── Events ──────────────────────────────────────────────
  const toggleAttend = (id) => {
    if (!userName) return requireLogin();
    save({ ...data, events: data.events.map(ev => ev.id !== id ? ev : { ...ev, attendees: ev.attendees.includes(userName) ? ev.attendees.filter(a => a !== userName) : [...ev.attendees, userName] }) });
  };
  const toggleHelper = (evId, tId) => {
    if (!userName) return requireLogin();
    let warn = false;
    const next = { ...data, events: data.events.map(ev => ev.id !== evId ? ev : { ...ev, tasks: ev.tasks.map(t => {
      if (t.id !== tId) return t;
      if (t.helpers.includes(userName)) return { ...t, helpers: t.helpers.filter(h => h !== userName) };
      if (t.helpers.length >= t.slots) { warn = true; return t; }
      return { ...t, helpers: [...t.helpers, userName] };
    })})};
    if (warn) return toast_("Alle Plätze vergeben.", "warn");
    save(next);
  };
  const toggleEnroll = (sgId) => {
    if (!userName) return requireLogin();
    const next = { ...data, spielgruppen: data.spielgruppen.map(sg => sg.id !== sgId ? sg : {
      ...sg,
      enrolled: sg.enrolled.includes(userName)
        ? sg.enrolled.filter(e => e !== userName)
        : sg.enrolled.length >= sg.slots
          ? (toast_("Alle Plätze belegt.", "warn"), sg.enrolled)
          : [...sg.enrolled, userName]
    })};
    save(next);
  };
  const voteIdea = (id) => {
    if (!userName) return requireLogin();
    save({ ...data, ideas: data.ideas.map(i => i.id !== id ? i : { ...i, votes: i.voters.includes(userName) ? i.votes - 1 : i.votes + 1, voters: i.voters.includes(userName) ? i.voters.filter(v => v !== userName) : [...i.voters, userName] }) });
  };
  const submitIdea = () => {
    if (!userName) return requireLogin();
    if (!newIdea.title.trim()) return toast_("Bitte Titel eingeben.", "warn");
    save({ ...data, ideas: [{ id: Date.now(), title: newIdea.title.trim(), text: newIdea.text.trim(), author: userName, date: new Date().toISOString().slice(0,10), votes: 0, voters: [] }, ...data.ideas] });
    setNewIdea({ title: "", text: "" }); setShowIdeaForm(false); toast_("Idee eingereicht!");
  };
  const submitBaby = () => {
    if (!userName) return requireLogin();
    if (!newBaby.text.trim() || !newBaby.contact.trim()) return toast_("Text und Kontakt angeben.", "warn");
    save({ ...data, babysitter: [{ id: Date.now(), type: newBaby.type, name: userName, age: newBaby.age ? parseInt(newBaby.age) : null, text: newBaby.text, contact: newBaby.contact, date: new Date().toISOString().slice(0,10) }, ...data.babysitter] });
    setNewBaby({ type: "biete", text: "", contact: "", age: "" }); setShowBabyForm(false); toast_("Publiziert!");
  };
  const submitBrett = () => {
    if (!userName) return requireLogin();
    if (!newBrett.title.trim() || !newBrett.text.trim()) return toast_("Titel und Text angeben.", "warn");
    save({ ...data, brett: [{ id: Date.now(), ...newBrett, author: userName, date: new Date().toISOString().slice(0,10) }, ...data.brett] });
    setNewBrett({ cat: "Fahrgemeinschaft", title: "", text: "", contact: "" }); setShowBrettForm(false); toast_("Publiziert!");
  };
  const submitMember = () => {
    if (!memberForm.vorname || !memberForm.nachname || !memberForm.email) return toast_("Pflichtfelder ausfüllen.", "warn");
    save({ ...data, members: [...(data.members||[]), { id: Date.now(), ...memberForm, date: new Date().toISOString().slice(0,10) }] });
    setMemberSent(true);
  };

  if (!data) return <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>Lädt…</div>;

  const sortedEvents = [...data.events].sort((a,b) => a.date.localeCompare(b.date));
  const cats = ["Alle", ...new Set(data.events.map(e => e.category))];
  const filtEvents = filterCat === "Alle" ? sortedEvents : sortedEvents.filter(e => e.category === filterCat);
  const evWithTasks = sortedEvents.filter(e => e.tasks.length > 0);
  const myShiftsList = myShifts(data);

  // ── total helfer per shift
  const totalInShift = (shiftId) => ROLES.reduce((n, r) => n + data.schichten[shiftId][r.id].length, 0);
  const totalSlots = ROLES.reduce((n, r) => n + r.slots, 0);

  const S = {
    wrap: { minHeight:"100vh", background:"#f5f2ec", fontFamily:"'Georgia','Times New Roman',serif", color:"#1e1a14" },
    header: { background:"#1e3a10", padding:"14px 18px 0", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 16px rgba(0,0,0,.22)" },
    logo: { fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", color:"#7ec85a" },
    h1: { fontSize:"19px", fontWeight:"normal", color:"#f0ead8", margin:"2px 0 12px", letterSpacing:"0.3px" },
    nav: { display:"flex", gap:"1px", overflowX:"auto", scrollbarWidth:"none", paddingBottom:0 },
    navBtn: (a) => ({ padding:"8px 13px", whiteSpace:"nowrap", background: a?"#f5f2ec":"transparent", border:"none", color: a?"#1e3a10":"#7ec85a", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia,serif", borderRadius:"6px 6px 0 0", fontWeight: a?"bold":"normal", transition:"all .12s" }),
    loginBar: { background:"#2d5a1e", padding:"8px 18px", display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" },
    content: { maxWidth:"700px", margin:"0 auto", padding:"18px 14px 60px" },
    card: { background:"#fff", borderRadius:"12px", padding:"16px", marginBottom:"12px", boxShadow:"0 1px 5px rgba(0,0,0,.07)", border:"1px solid #e6e0d4" },
    btn: (v="primary") => ({ padding:"7px 16px", borderRadius:"7px", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia,serif", fontWeight:"bold", background: v==="primary"?"#1e3a10":v==="secondary"?"#4a7a30":v==="danger"?"#a0002a":v==="outline"?"transparent":"#ede8df", color: ["primary","secondary","danger"].includes(v)?"#f0ead8":v==="outline"?"#1e3a10":"#1e1a14", border: v==="outline"?"1.5px solid #1e3a10":"none", transition:"all .13s" }),
    chip: (cat) => { const c=CAT_COLORS[cat]||CAT_COLORS.default; return { display:"inline-flex",alignItems:"center",gap:"5px",background:c.bg,color:c.text,borderRadius:"20px",padding:"3px 9px",fontSize:"11px",fontWeight:"bold" }; },
    input: { width:"100%", padding:"8px 12px", borderRadius:"7px", border:"1.5px solid #d4ccbf", fontSize:"13px", fontFamily:"Georgia,serif", background:"#fafaf7", outline:"none", boxSizing:"border-box" },
    label: { display:"block", fontSize:"11px", fontWeight:"bold", color:"#5a5248", marginBottom:"3px", letterSpacing:"0.5px", textTransform:"uppercase" },
    toast_: (t) => ({ position:"fixed", bottom:"22px", left:"50%", transform:"translateX(-50%)", background:t==="warn"?"#b25c00":"#1e3a10", color:"#fff", borderRadius:"8px", padding:"10px 20px", zIndex:9999, fontFamily:"Georgia,serif", fontSize:"13px", boxShadow:"0 4px 18px rgba(0,0,0,.2)", animation:"fadeUp .2s" }),
  };

  // ── PRINT STYLES ──────────────────────────────────────────
  const printTable = () => {
    const rows = SHIFTS.map(sh => {
      const cells = ROLES.map(r => {
        const names = data.schichten[sh.id][r.id];
        const empty = Array(r.slots - names.length).fill("—");
        return [...names, ...empty].join("\n");
      });
      return [sh.label, ...cells];
    });
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Schichtplan Kaffibohne – Rebblüete Fest</title>
      <style>
        body { font-family: Georgia, serif; padding: 24px; color: #1e1a14; }
        h1 { font-size: 22px; color: #1e3a10; margin-bottom: 4px; }
        h2 { font-size: 14px; color: #5a5248; font-weight: normal; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a10; color: #f0ead8; padding: 10px 12px; font-size: 13px; text-align: left; }
        td { padding: 10px 12px; border: 1px solid #e6e0d4; font-size: 12px; vertical-align: top; white-space: pre-line; }
        tr:nth-child(even) td { background: #f5f2ec; }
        td:first-child { font-weight: bold; color: #1e3a10; }
        .footer { margin-top: 20px; font-size: 10px; color: #9c8f83; }
        .empty { color: #c8c0b0; }
      </style></head><body>
      <h1>🍇 Rebblüete Fest – Kaffibohne</h1>
      <h2>Schichtplan Helfer · Elternverein Weiningen</h2>
      <table>
        <tr><th>Schicht</th>${ROLES.map(r=>`<th>${r.icon} ${r.label} (${r.slots} Pl.)</th>`).join("")}</tr>
        ${SHIFTS.map((sh,i) => `<tr>${["<td>"+sh.label+"</td>", ...ROLES.map(r => {
          const names = data.schichten[sh.id][r.id];
          const empty = Array(r.slots - names.length).fill('<span class="empty">— frei —</span>');
          return `<td>${[...names.map(n=>`<strong>${n}</strong>`), ...empty].join("<br/>")}</td>`;
        })].join("")}</tr>`).join("")}
      </table>
      <div class="footer">Gedruckt: ${new Date().toLocaleDateString("de-CH")} · Elternverein Weiningen</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={S.wrap}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        ::-webkit-scrollbar{display:none} button:hover{opacity:.85} *{box-sizing:border-box}
        input,textarea,select{font-family:Georgia,serif} textarea{resize:vertical}
        @media print { .no-print{display:none!important} }
      `}</style>

      {/* HEADER */}
      <div style={S.header} className="no-print">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div><div style={S.logo}>Elternverein Weiningen</div><div style={S.h1}>Gemeinschaftsplattform</div></div>
          <div style={{ fontSize:"10px", color:"#7ec85a", paddingTop:"2px" }}>Prototyp</div>
        </div>
        <div style={S.nav}>
          {TABS.map(t => <button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.icon} {t.label}</button>)}
        </div>
      </div>

      {/* LOGIN */}
      <div style={S.loginBar} className="no-print">
        {userName ? (
          <span style={{ color:"#f0ead8", fontSize:"13px" }}>
            👤 <strong>{userName}</strong>
            {myShiftsList.length > 0 && <span style={{ marginLeft:"10px", background:"#7ec85a", color:"#1e3a10", borderRadius:"20px", padding:"2px 8px", fontSize:"11px", fontWeight:"bold" }}>🍇 {myShiftsList.length} Schicht{myShiftsList.length>1?"en":""}</span>}
            <button onClick={()=>{setUserName("");save({...data,userName:""});}} style={{ marginLeft:"10px",background:"none",border:"none",color:"#7ec85a",cursor:"pointer",fontSize:"11px" }}>wechseln</button>
          </span>
        ) : (
          <>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Dein Name zum Einloggen…" style={{ ...S.input, width:"190px", background:"#255018", color:"#f0ead8", border:"none" }} />
            <button style={S.btn("secondary")} onClick={login}>Einloggen</button>
            <span style={{ color:"#7ec85a", fontSize:"11px" }}>Für Anmeldungen &amp; Schichteinteilung</span>
          </>
        )}
      </div>

      <div style={S.content}>

        {/* ══ REBBLÜETE FEST / SCHICHTPLAN ══════════════════ */}
        {tab==="rebblüete" && <>
          {/* Hero */}
          <div style={{ background:"linear-gradient(135deg,#1e3a10,#2d5a1e)", borderRadius:"14px", padding:"20px 20px 16px", marginBottom:"14px", color:"#f0ead8" }}>
            <div style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"#7ec85a", marginBottom:"4px" }}>Weiningen · 2026</div>
            <div style={{ fontSize:"24px", marginBottom:"4px" }}>🍇 Rebblüete Fest</div>
            <div style={{ fontSize:"13px", color:"#a8c88a" }}>Café Kaffibohne · Helfer-Einteilung · 10:00 – 00:00 Uhr</div>
            <div style={{ display:"flex", gap:"10px", marginTop:"14px", flexWrap:"wrap" }}>
              <div style={{ background:"rgba(255,255,255,.08)", borderRadius:"8px", padding:"8px 14px", textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:"bold" }}>{SHIFTS.length}</div>
                <div style={{ fontSize:"10px", color:"#a8c88a" }}>Schichten</div>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)", borderRadius:"8px", padding:"8px 14px", textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:"bold" }}>{ROLES.length}</div>
                <div style={{ fontSize:"10px", color:"#a8c88a" }}>Aufgaben</div>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)", borderRadius:"8px", padding:"8px 14px", textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:"bold" }}>{SHIFTS.length * totalSlots}</div>
                <div style={{ fontSize:"10px", color:"#a8c88a" }}>Plätze total</div>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)", borderRadius:"8px", padding:"8px 14px", textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:"bold", color:"#7ec85a" }}>{SHIFTS.reduce((n,s)=>n+totalInShift(s.id),0)}</div>
                <div style={{ fontSize:"10px", color:"#a8c88a" }}>Belegt</div>
              </div>
            </div>
          </div>

          {/* Meine Schichten */}
          {userName && myShiftsList.length > 0 && (
            <div style={{ ...S.card, borderColor:"#7ec85a", background:"#f6fbf2", marginBottom:"14px" }}>
              <div style={{ fontSize:"13px", fontWeight:"bold", color:"#1e3a10", marginBottom:"6px" }}>✓ Deine Schichten</div>
              {myShiftsList.map(sh => {
                const myRole = ROLES.find(r => data.schichten[sh.id][r.id].includes(userName));
                return (
                  <div key={sh.id} style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"4px" }}>
                    <span style={{ fontSize:"12px", fontWeight:"bold", color:"#1e3a10" }}>{sh.label}</span>
                    <span style={{ background:"#1e3a10", color:"#7ec85a", borderRadius:"20px", padding:"2px 9px", fontSize:"11px" }}>{myRole?.icon} {myRole?.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legende */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"12px", flexWrap:"wrap" }}>
            {ROLES.map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:"5px", background:"#fff", border:"1px solid #e6e0d4", borderRadius:"8px", padding:"5px 12px", fontSize:"12px" }}>
                <span>{r.icon}</span><strong>{r.label}</strong><span style={{ color:"#9c8f83" }}>{r.slots} Pl./Schicht</span>
              </div>
            ))}
          </div>

          {/* Schicht-Karten */}
          {SHIFTS.map(sh => {
            const filled = totalInShift(sh.id);
            const pct = (filled / totalSlots) * 100;
            const isMyShift = ROLES.some(r => data.schichten[sh.id][r.id].includes(userName));
            return (
              <div key={sh.id} style={{ ...S.card, borderLeft: `4px solid ${isMyShift?"#7ec85a":"#e6e0d4"}`, background: isMyShift?"#f9fdf7":"#fff" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px", flexWrap:"wrap", gap:"6px" }}>
                  <div>
                    <span style={{ fontSize:"16px", fontWeight:"bold" }}>⏰ {sh.label}</span>
                    {isMyShift && <span style={{ marginLeft:"8px", background:"#7ec85a", color:"#1e3a10", borderRadius:"20px", padding:"2px 8px", fontSize:"10px", fontWeight:"bold" }}>✓ Du bist dabei</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"80px", height:"5px", background:"#e6e0d4", borderRadius:"4px" }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:pct>=100?"#b0003a":pct>60?"#f09030":"#5aad48", borderRadius:"4px", transition:"width .3s" }} />
                    </div>
                    <span style={{ fontSize:"11px", color:"#9c8f83" }}>{filled}/{totalSlots}</span>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:`repeat(${ROLES.length}, 1fr)`, gap:"8px" }}>
                  {ROLES.map(r => {
                    const names = data.schichten[sh.id][r.id];
                    const isMe = names.includes(userName);
                    const full = !isMe && names.length >= r.slots;
                    const alreadyOtherRole = !isMe && ROLES.some(ro => ro.id !== r.id && data.schichten[sh.id][ro.id].includes(userName));
                    const canJoin = !isMe && !full && !alreadyOtherRole;
                    return (
                      <div key={r.id} style={{ background: isMe?"#e8f5e0":full?"#fafaf7":"#fafaf7", border:`1px solid ${isMe?"#7ec85a":"#e6e0d4"}`, borderRadius:"8px", padding:"10px 10px 8px", display:"flex", flexDirection:"column", gap:"5px" }}>
                        <div style={{ fontSize:"13px", fontWeight:"bold", color:isMe?"#1e3a10":"#2a2420" }}>{r.icon} {r.label}</div>
                        <div style={{ flex:1 }}>
                          {names.map(n => (
                            <div key={n} style={{ fontSize:"11px", background: n===userName?"#1e3a10":"#e8f5e0", color: n===userName?"#7ec85a":"#1e3a10", borderRadius:"4px", padding:"2px 6px", marginBottom:"3px", fontWeight:"bold" }}>{n}</div>
                          ))}
                          {Array(r.slots - names.length).fill(0).map((_, i) => (
                            <div key={i} style={{ fontSize:"11px", color:"#c8c0b0", borderRadius:"4px", padding:"2px 6px", marginBottom:"3px", border:"1px dashed #e6e0d4" }}>— frei —</div>
                          ))}
                        </div>
                        <button
                          style={{ padding:"5px 0", borderRadius:"6px", border:"none", cursor: canJoin?"pointer":"default", background: isMe?"#1e3a10":full||alreadyOtherRole?"#e6e0d4":"#c8e8b0", color: isMe?"#7ec85a":full||alreadyOtherRole?"#9c8f83":"#1e3a10", fontFamily:"Georgia,serif", fontSize:"11px", fontWeight:"bold", width:"100%" }}
                          onClick={() => toggleSchicht(sh.id, r.id)}>
                          {isMe ? "✓ Abmelden" : full ? "Voll" : alreadyOtherRole ? "Schon dabei" : "+ Eintragen"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Zeitplan-Übersicht + Export */}
          <div style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", flexWrap:"wrap", gap:"8px" }}>
              <div style={{ fontSize:"14px", fontWeight:"bold" }}>📋 Gesamtübersicht</div>
              <button style={S.btn("primary")} onClick={printTable}>🖨️ Zeitplan drucken / PDF</button>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                <thead>
                  <tr>
                    <th style={{ background:"#1e3a10", color:"#f0ead8", padding:"8px 10px", textAlign:"left", borderRadius:"6px 0 0 0" }}>Schicht</th>
                    {ROLES.map((r,i) => <th key={r.id} style={{ background:"#1e3a10", color:"#f0ead8", padding:"8px 10px", textAlign:"left", borderRadius: i===ROLES.length-1?"0 6px 0 0":"0" }}>{r.icon} {r.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SHIFTS.map((sh, si) => (
                    <tr key={sh.id} style={{ background: si%2===0?"#fafaf7":"#fff" }}>
                      <td style={{ padding:"8px 10px", fontWeight:"bold", color:"#1e3a10", whiteSpace:"nowrap", borderBottom:"1px solid #e6e0d4" }}>{sh.label}</td>
                      {ROLES.map(r => {
                        const names = data.schichten[sh.id][r.id];
                        return (
                          <td key={r.id} style={{ padding:"8px 10px", borderBottom:"1px solid #e6e0d4", verticalAlign:"top" }}>
                            {names.length > 0
                              ? names.map(n => <div key={n} style={{ marginBottom:"2px", color: n===userName?"#1e3a10":"#2a2420", fontWeight: n===userName?"bold":"normal" }}>{n}</div>)
                              : Array(r.slots).fill(0).map((_,i) => <div key={i} style={{ color:"#c8c0b0", fontSize:"11px" }}>— frei —</div>)
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>}

        {/* ══ KALENDER ══════════════════════════════════════ */}
        {tab==="kalender" && <>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"16px" }}>
            {cats.map(cat => <button key={cat} onClick={()=>setFilterCat(cat)} style={{ padding:"4px 13px", borderRadius:"20px", border:"1.5px solid #c8c0b0", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia,serif", background:filterCat===cat?"#1e3a10":"#fff", color:filterCat===cat?"#f0ead8":"#1e1a14", fontWeight:filterCat===cat?"bold":"normal" }}>{cat}</button>)}
          </div>
          {filtEvents.map(ev => {
            const isAtt = ev.attendees.includes(userName);
            const days = daysUntil(ev.date);
            const cc = CAT_COLORS[ev.category]||CAT_COLORS.default;
            return (
              <div key={ev.id} style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"10px", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:"180px" }}>
                    <div style={{ display:"flex", gap:"6px", marginBottom:"5px", flexWrap:"wrap", alignItems:"center" }}>
                      <span style={S.chip(ev.category)}><span style={{ width:"6px", height:"6px", borderRadius:"50%", background:cc.dot, display:"inline-block" }}/>{ev.category}</span>
                      {days>=0&&days<=60&&<span style={{ fontSize:"10px", color:"#b25c00", fontWeight:"bold", background:"#fff3e0", padding:"2px 7px", borderRadius:"20px" }}>in {days} Tagen</span>}
                    </div>
                    <div style={{ fontSize:"17px", marginBottom:"3px" }}>{ev.title}</div>
                    <div style={{ fontSize:"11px", color:"#7a6e60" }}>{fmt(ev.date)} · {ev.time} · {ev.location}</div>
                    <div style={{ fontSize:"12px", color:"#5a5248", marginTop:"7px" }}>{ev.description}</div>
                    {ev.attendees.length>0&&<div style={{ fontSize:"10px", color:"#9c8f83", marginTop:"5px" }}>👥 {ev.attendees.join(", ")}</div>}
                    {ev.tasks.length>0&&<button style={{ ...S.btn("outline"), marginTop:"8px", fontSize:"11px", padding:"4px 10px" }} onClick={()=>setTab("helfer")}>🙋 Helfer gesucht →</button>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
                    <button style={S.btn(isAtt?"danger":"primary")} onClick={()=>toggleAttend(ev.id)}>{isAtt?"✓ Dabei":"Ich komme"}</button>
                    <span style={{ fontSize:"10px", color:"#9c8f83" }}>{ev.attendees.length} Zusagen</span>
                  </div>
                </div>
              </div>
            );
          })}
        </>}

        {/* ══ HELFER ════════════════════════════════════════ */}
        {tab==="helfer" && <>
          <p style={{ fontSize:"13px", color:"#5a5248", marginBottom:"16px" }}>Klick auf "+ Helfen" um dich einzutragen.</p>
          {evWithTasks.map(ev => (
            <div key={ev.id} style={S.card}>
              <div style={{ fontSize:"16px", marginBottom:"3px" }}>{ev.title}</div>
              <div style={{ fontSize:"11px", color:"#7a6e60", marginBottom:"12px" }}>{fmt(ev.date)} · {ev.time}</div>
              {ev.tasks.map(t => {
                const isMe = t.helpers.includes(userName);
                const full = !isMe && t.helpers.length>=t.slots;
                const pct = (t.helpers.length/t.slots)*100;
                return (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:"7px", background:isMe?"#e8f5e0":"#fafaf7", border:`1px solid ${isMe?"#7ec85a":"#e6e0d4"}`, marginBottom:"7px", gap:"8px" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"13px", fontWeight:"bold" }}>{t.label}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"3px" }}>
                        <div style={{ flex:1, height:"4px", background:"#e6e0d4", borderRadius:"4px" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:pct>=100?"#b0003a":"#5aad48", borderRadius:"4px" }} />
                        </div>
                        <span style={{ fontSize:"10px", color:"#9c8f83" }}>{t.helpers.length}/{t.slots}</span>
                      </div>
                      {t.helpers.length>0&&<div style={{ fontSize:"10px", color:"#9c8f83", marginTop:"2px" }}>{t.helpers.join(", ")}</div>}
                    </div>
                    <button style={{ padding:"5px 12px", borderRadius:"6px", border:"none", cursor:full?"default":"pointer", background:isMe?"#1e3a10":full?"#e6e0d4":"#e8f5e0", color:isMe?"#fff":full?"#9c8f83":"#1e3a10", fontFamily:"Georgia,serif", fontSize:"11px", fontWeight:"bold" }} onClick={()=>!full&&toggleHelper(ev.id,t.id)}>
                      {isMe?"✓ Dabei":full?"Voll":"+ Helfen"}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </>}

        {/* ══ SPIELGRUPPEN ══════════════════════════════════ */}
        {tab==="spielgruppen" && <>
          <p style={{ fontSize:"13px", color:"#5a5248", marginBottom:"16px" }}>Platz direkt reservieren — Bestätigung per E-Mail.</p>
          {data.spielgruppen.map(sg => {
            const isIn = sg.enrolled.includes(userName);
            const full = sg.enrolled.length>=sg.slots;
            const pct = (sg.enrolled.length/sg.slots)*100;
            return (
              <div key={sg.id} style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"10px", flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"16px", marginBottom:"3px" }}>{sg.name}</div>
                    <div style={{ fontSize:"11px", color:"#7a6e60", marginBottom:"6px" }}>🎂 {sg.age} · 📅 {sg.day} · ⏰ {sg.time}</div>
                    <div style={{ fontSize:"12px", color:"#5a5248", marginBottom:"8px" }}>{sg.description}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                      <div style={{ width:"100px", height:"4px", background:"#e6e0d4", borderRadius:"4px" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:pct>=100?"#b0003a":pct>70?"#f09030":"#5aad48", borderRadius:"4px" }} />
                      </div>
                      <span style={{ fontSize:"11px", color:"#9c8f83" }}>{sg.enrolled.length}/{sg.slots} belegt</span>
                    </div>
                  </div>
                  <button style={S.btn(isIn?"danger":full?"secondary":"primary")} onClick={()=>toggleEnroll(sg.id)}>
                    {isIn?"✓ Angemeldet":full?"Warteliste":"Anmelden"}
                  </button>
                </div>
              </div>
            );
          })}
        </>}

        {/* ══ BABYSITTER ════════════════════════════════════ */}
        {tab==="babysitter" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
            <p style={{ fontSize:"13px", color:"#5a5248", margin:0 }}>Nur für Vereinsmitglieder sichtbar.</p>
            <button style={S.btn()} onClick={()=>setShowBabyForm(!showBabyForm)}>{showBabyForm?"Abbrechen":"+ Inserat"}</button>
          </div>
          {showBabyForm && (
            <div style={{ ...S.card, borderColor:"#7ec85a", background:"#f6fbf2" }}>
              <div style={{ display:"flex", gap:"7px", marginBottom:"12px" }}>
                {["biete","suche"].map(t=><button key={t} style={S.btn(newBaby.type===t?"primary":"outline")} onClick={()=>setNewBaby({...newBaby,type:t})}>{t==="biete"?"🙋 Biete":"🔍 Suche"}</button>)}
              </div>
              {newBaby.type==="biete"&&<div style={{ marginBottom:"8px" }}><label style={S.label}>Alter</label><input value={newBaby.age} onChange={e=>setNewBaby({...newBaby,age:e.target.value})} placeholder="z.B. 17" style={{ ...S.input, width:"90px" }}/></div>}
              <div style={{ marginBottom:"8px" }}><label style={S.label}>Beschreibung *</label><textarea value={newBaby.text} onChange={e=>setNewBaby({...newBaby,text:e.target.value})} rows={3} style={S.input}/></div>
              <div style={{ marginBottom:"12px" }}><label style={S.label}>Kontakt *</label><input value={newBaby.contact} onChange={e=>setNewBaby({...newBaby,contact:e.target.value})} style={S.input}/></div>
              <button style={S.btn()} onClick={submitBaby}>Publizieren</button>
            </div>
          )}
          {["biete","suche"].map(type=>(
            <div key={type}>
              <div style={{ fontSize:"10px", fontWeight:"bold", color:"#5a5248", margin:"14px 0 8px", letterSpacing:"1px", textTransform:"uppercase" }}>{type==="biete"?"🙋 Angebote":"🔍 Gesuche"}</div>
              {data.babysitter.filter(b=>b.type===type).map(b=>(
                <div key={b.id} style={{ ...S.card, borderLeft:`4px solid ${type==="biete"?"#5aad48":"#1e88e5"}` }}>
                  <div style={{ fontWeight:"bold", fontSize:"14px" }}>{b.name}{b.age?`, ${b.age} J.`:""}</div>
                  <div style={{ fontSize:"12px", color:"#5a5248", margin:"4px 0" }}>{b.text}</div>
                  <div style={{ fontSize:"10px", color:"#9c8f83" }}>📅 {fmt(b.date)} · ✉️ {b.contact}</div>
                </div>
              ))}
            </div>
          ))}
        </>}

        {/* ══ SCHWARZES BRETT ═══════════════════════════════ */}
        {tab==="brett" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
            <p style={{ fontSize:"13px", color:"#5a5248", margin:0 }}>Fahrgemeinschaften, Verschenken, Kaufen/Verkaufen.</p>
            <button style={S.btn()} onClick={()=>setShowBrettForm(!showBrettForm)}>{showBrettForm?"Abbrechen":"+ Inserat"}</button>
          </div>
          {showBrettForm && (
            <div style={{ ...S.card, borderColor:"#7ec85a", background:"#f6fbf2" }}>
              <div style={{ marginBottom:"8px" }}><label style={S.label}>Kategorie</label><div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>{BRETT_CATS.map(c=><button key={c} style={{ ...S.btn(newBrett.cat===c?"primary":"outline"), fontSize:"11px", padding:"4px 10px" }} onClick={()=>setNewBrett({...newBrett,cat:c})}>{c}</button>)}</div></div>
              <div style={{ marginBottom:"8px" }}><label style={S.label}>Titel *</label><input value={newBrett.title} onChange={e=>setNewBrett({...newBrett,title:e.target.value})} style={S.input}/></div>
              <div style={{ marginBottom:"8px" }}><label style={S.label}>Text *</label><textarea value={newBrett.text} onChange={e=>setNewBrett({...newBrett,text:e.target.value})} rows={2} style={S.input}/></div>
              <div style={{ marginBottom:"12px" }}><label style={S.label}>Kontakt</label><input value={newBrett.contact} onChange={e=>setNewBrett({...newBrett,contact:e.target.value})} style={S.input}/></div>
              <button style={S.btn()} onClick={submitBrett}>Publizieren</button>
            </div>
          )}
          {data.brett.map(b=>{
            const bc=BRETT_COLORS[b.cat]||BRETT_COLORS.Sonstiges;
            return (
              <div key={b.id} style={S.card}>
                <span style={{ background:bc.bg, color:bc.text, borderRadius:"20px", padding:"2px 9px", fontSize:"11px", fontWeight:"bold" }}>{b.cat}</span>
                <div style={{ fontSize:"15px", margin:"5px 0 3px" }}>{b.title}</div>
                <div style={{ fontSize:"12px", color:"#5a5248", marginBottom:"5px" }}>{b.text}</div>
                <div style={{ fontSize:"10px", color:"#9c8f83" }}>{b.author} · {fmt(b.date)}{b.contact&&` · ${b.contact}`}</div>
              </div>
            );
          })}
        </>}

        {/* ══ IDEEN ══════════════════════════════════════════ */}
        {tab==="ideen" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
            <p style={{ fontSize:"13px", color:"#5a5248", margin:0 }}>Ideen einreichen und abstimmen.</p>
            <button style={S.btn()} onClick={()=>setShowIdeaForm(!showIdeaForm)}>{showIdeaForm?"Abbrechen":"+ Neue Idee"}</button>
          </div>
          {showIdeaForm && (
            <div style={{ ...S.card, borderColor:"#7ec85a", background:"#f6fbf2" }}>
              <div style={{ marginBottom:"8px" }}><label style={S.label}>Titel *</label><input value={newIdea.title} onChange={e=>setNewIdea({...newIdea,title:e.target.value})} style={S.input}/></div>
              <div style={{ marginBottom:"12px" }}><label style={S.label}>Beschreibung</label><textarea value={newIdea.text} onChange={e=>setNewIdea({...newIdea,text:e.target.value})} rows={3} style={S.input}/></div>
              <button style={S.btn()} onClick={submitIdea}>Einreichen</button>
            </div>
          )}
          {[...data.ideas].sort((a,b)=>b.votes-a.votes).map(idea=>{
            const voted=idea.voters.includes(userName);
            return (
              <div key={idea.id} style={S.card}>
                <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                  <button onClick={()=>voteIdea(idea.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1px", background:voted?"#1e3a10":"#f3f0eb", border:`1.5px solid ${voted?"#1e3a10":"#d4ccbf"}`, borderRadius:"7px", padding:"7px 11px", cursor:"pointer", minWidth:"48px" }}>
                    <span style={{ fontSize:"12px", color:voted?"#7ec85a":"#9c8f83" }}>{voted?"▲":"△"}</span>
                    <span style={{ fontSize:"16px", fontWeight:"bold", color:voted?"#fff":"#1e1a14" }}>{idea.votes}</span>
                  </button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"15px", marginBottom:"3px" }}>{idea.title}</div>
                    {idea.text&&<div style={{ fontSize:"12px", color:"#5a5248", marginBottom:"4px" }}>{idea.text}</div>}
                    <div style={{ fontSize:"10px", color:"#9c8f83" }}>von {idea.author} · {fmt(idea.date)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>}

        {/* ══ MITGLIED ════════════════════════════════════════ */}
        {tab==="mitglied" && (
          memberSent ? (
            <div style={{ ...S.card, textAlign:"center", padding:"36px 20px" }}>
              <div style={{ fontSize:"44px", marginBottom:"10px" }}>🎉</div>
              <div style={{ fontSize:"18px", marginBottom:"6px" }}>Willkommen im Elternverein!</div>
              <div style={{ fontSize:"13px", color:"#5a5248" }}>Bestätigung folgt per E-Mail.</div>
              <button style={{ ...S.btn("outline"), marginTop:"16px" }} onClick={()=>setMemberSent(false)}>Weitere Anmeldung</button>
            </div>
          ) : (
            <div style={S.card}>
              <div style={{ fontSize:"17px", marginBottom:"3px" }}>Mitglied werden</div>
              <div style={{ fontSize:"12px", color:"#5a5248", marginBottom:"18px" }}>Jahresbeitrag: CHF 30.– pro Familie</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
                {[["Vorname *","vorname"],["Nachname *","nachname"]].map(([l,k])=>(
                  <div key={k}><label style={S.label}>{l}</label><input value={memberForm[k]} onChange={e=>setMemberForm({...memberForm,[k]:e.target.value})} style={S.input}/></div>
                ))}
              </div>
              <div style={{ marginBottom:"10px" }}><label style={S.label}>Strasse &amp; Ort</label><input value={memberForm.strasse} onChange={e=>setMemberForm({...memberForm,strasse:e.target.value})} placeholder="Musterstrasse 1, 8104 Weiningen" style={S.input}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
                <div><label style={S.label}>E-Mail *</label><input value={memberForm.email} onChange={e=>setMemberForm({...memberForm,email:e.target.value})} style={S.input}/></div>
                <div><label style={S.label}>Telefon</label><input value={memberForm.tel} onChange={e=>setMemberForm({...memberForm,tel:e.target.value})} style={S.input}/></div>
              </div>
              <div style={{ marginBottom:"10px" }}><label style={S.label}>Kinder (Name &amp; Jahrgang)</label><input value={memberForm.kinder} onChange={e=>setMemberForm({...memberForm,kinder:e.target.value})} placeholder="z.B. Lena 2019, Max 2022" style={S.input}/></div>
              <div style={{ marginBottom:"18px" }}><label style={S.label}>Bemerkungen</label><textarea value={memberForm.bemerkung} onChange={e=>setMemberForm({...memberForm,bemerkung:e.target.value})} rows={2} style={S.input}/></div>
              <button style={S.btn()} onClick={submitMember}>Anmeldung einreichen</button>
            </div>
          )
        )}

      </div>

      {toast && <div style={S.toast_(toast.type)}>{toast.msg}</div>}
    </div>
  );
}
