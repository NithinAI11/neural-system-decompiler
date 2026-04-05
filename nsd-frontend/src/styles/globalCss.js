export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');

  /* ── accent palette: override --ac via data-accent ─────────────────── */
  :root,[data-theme="dark"]                     { --ac:#00c8ff; --ac-rgb:0,200,255; }
  [data-accent="violet"]                        { --ac:#8b5cf6; --ac-rgb:139,92,246; }
  [data-accent="emerald"]                       { --ac:#10b981; --ac-rgb:16,185,129; }
  [data-accent="rose"]                          { --ac:#f43f5e; --ac-rgb:244,63,94; }
  [data-accent="amber"]                         { --ac:#f59e0b; --ac-rgb:245,158,11; }
  [data-accent="indigo"]                        { --ac:#6366f1; --ac-rgb:99,102,241; }
  [data-accent="cyan"],[data-accent="cyan"]     { --ac:#00c8ff; --ac-rgb:0,200,255; }

  /* ── dark theme (default) ─────────────────────────────────────────── */
  :root, [data-theme="dark"] {
    --bg-void:   #000000;
    --bg-deep:   #050505;
    --bg-panel:  #0c0c0c;
    --bg-glass:  rgba(14,14,14,0.85);
    --bg-hover:  rgba(var(--ac-rgb),0.05);
    --bg-card:   rgba(18,18,18,0.9);

    --border-dim:  rgba(var(--ac-rgb),0.07);
    --border-mid:  rgba(var(--ac-rgb),0.16);
    --border-hi:   rgba(var(--ac-rgb),0.42);

    --text-primary:   #f0f0f0;
    --text-secondary: #888;
    --text-muted:     #444;
    --text-danger:    #f43f5e;
    --text-success:   #10b981;

    --tag-cyan-fg:    #00c8ff; --tag-cyan-bg:    rgba(0,200,255,0.07);    --tag-cyan-bd:    rgba(0,200,255,0.25);
    --tag-violet-fg:  #8b5cf6; --tag-violet-bg:  rgba(139,92,246,0.07);  --tag-violet-bd:  rgba(139,92,246,0.25);
    --tag-emerald-fg: #10b981; --tag-emerald-bg: rgba(16,185,129,0.07);  --tag-emerald-bd: rgba(16,185,129,0.25);
    --tag-rose-fg:    #f43f5e; --tag-rose-bg:    rgba(244,63,94,0.07);   --tag-rose-bd:    rgba(244,63,94,0.25);
    --tag-amber-fg:   #f59e0b; --tag-amber-bg:   rgba(245,158,11,0.07);  --tag-amber-bd:   rgba(245,158,11,0.25);
    --tag-orange-fg:  #f97316; --tag-orange-bg:  rgba(249,115,22,0.07);  --tag-orange-bd:  rgba(249,115,22,0.25);
    --tag-blue-fg:    #3b82f6; --tag-blue-bg:    rgba(59,130,246,0.07);  --tag-blue-bd:    rgba(59,130,246,0.25);

    --font-display: 'Orbitron', monospace;
    --font-mono:    'JetBrains Mono', monospace;
    --font-body:    'Inter', sans-serif;
  }

  /* ── light theme ──────────────────────────────────────────────────── */
  [data-theme="light"] {
    --bg-void:   #f4f4f5;
    --bg-deep:   #e8e8ec;
    --bg-panel:  #ffffff;
    --bg-glass:  rgba(255,255,255,0.88);
    --bg-hover:  rgba(var(--ac-rgb),0.06);
    --bg-card:   rgba(255,255,255,0.95);

    --border-dim:  rgba(0,0,0,0.08);
    --border-mid:  rgba(0,0,0,0.16);
    --border-hi:   rgba(var(--ac-rgb),0.5);

    --text-primary:   #0f0f0f;
    --text-secondary: #444;
    --text-muted:     #999;
    --text-danger:    #dc2626;
    --text-success:   #059669;

    --tag-cyan-fg:    #0077aa; --tag-cyan-bg:    rgba(0,119,170,0.08);   --tag-cyan-bd:    rgba(0,119,170,0.28);
    --tag-violet-fg:  #6d28d9; --tag-violet-bg:  rgba(109,40,217,0.08);  --tag-violet-bd:  rgba(109,40,217,0.28);
    --tag-emerald-fg: #047857; --tag-emerald-bg: rgba(4,120,87,0.08);    --tag-emerald-bd: rgba(4,120,87,0.28);
    --tag-rose-fg:    #be123c; --tag-rose-bg:    rgba(190,18,60,0.08);   --tag-rose-bd:    rgba(190,18,60,0.28);
    --tag-amber-fg:   #b45309; --tag-amber-bg:   rgba(180,83,9,0.08);    --tag-amber-bd:   rgba(180,83,9,0.28);
    --tag-orange-fg:  #c2410c; --tag-orange-bg:  rgba(194,65,12,0.08);   --tag-orange-bd:  rgba(194,65,12,0.28);
    --tag-blue-fg:    #1d4ed8; --tag-blue-bg:    rgba(29,78,216,0.08);   --tag-blue-bd:    rgba(29,78,216,0.28);
  }

  html, body, #root {
    width:100%; height:100%; overflow:hidden;
    background:var(--bg-void);
    color:var(--text-primary);
    font-family:var(--font-body);
    transition: background 0.3s, color 0.3s;
  }

  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border-mid); border-radius:2px; }

  .scanlines::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:100;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px);
  }
  [data-theme="light"] .scanlines::after { display:none; }

  .corner-mark { position:relative; }
  .corner-mark::before,.corner-mark::after { content:''; position:absolute; width:10px; height:10px; pointer-events:none; }
  .corner-mark::before { top:0; left:0; border-top:1.5px solid var(--border-hi); border-left:1.5px solid var(--border-hi); }
  .corner-mark::after  { bottom:0; right:0; border-bottom:1.5px solid var(--border-hi); border-right:1.5px solid var(--border-hi); }

  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
  .pulse-dot { animation:pulse-dot 2s ease-in-out infinite; }

  @keyframes scan-line { 0%{top:-5%} 100%{top:105%} }
  .scan-anim { animation:scan-line 4s linear infinite; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .cursor-blink::after { content:'_'; animation:blink 1s step-end infinite; }

  @keyframes page-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .page-enter { animation:page-in 0.25s ease forwards; }

  @keyframes anomaly-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.4)} 70%{box-shadow:0 0 0 8px rgba(244,63,94,0)} }
  .anomaly-card { animation:anomaly-pulse 2s ease-out infinite; }

  .glass-card {
    background:var(--bg-glass);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border:1px solid var(--border-dim);
    border-radius:8px;
    transition: background 0.3s, border-color 0.3s;
  }

  /* ── neon button ─── */
  .btn-neon {
    font-family:var(--font-display); font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
    padding:10px 20px; border:1px solid var(--ac); border-radius:4px;
    background:rgba(var(--ac-rgb),0.07); color:var(--ac); cursor:pointer; transition:all 0.2s;
    position:relative; overflow:hidden;
  }
  .btn-neon::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(var(--ac-rgb),0.15),transparent);
    transform:translateX(-100%); transition:transform 0.4s;
  }
  .btn-neon:hover::before { transform:translateX(100%); }
  .btn-neon:hover { background:rgba(var(--ac-rgb),0.14); box-shadow:0 0 18px rgba(var(--ac-rgb),0.3); }
  .btn-neon:disabled { opacity:0.3; cursor:not-allowed; }
  .btn-neon:disabled::before { display:none; }

  /* ── input ─── */
  .neon-input {
    background:rgba(0,0,0,0.25); border:1px solid var(--border-mid); border-radius:4px;
    color:var(--text-primary); font-family:var(--font-mono); font-size:12px;
    padding:9px 12px; width:100%; outline:none; transition:border-color 0.2s,box-shadow 0.2s;
    box-sizing:border-box;
  }
  [data-theme="light"] .neon-input { background:rgba(0,0,0,0.04); }
  .neon-input:focus { border-color:var(--ac); box-shadow:0 0 0 2px rgba(var(--ac-rgb),0.12); }
  .neon-input::placeholder { color:var(--text-muted); }

  /* ── tags ─── */
  .tag { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; font-size:10px; font-family:var(--font-mono); letter-spacing:0.04em; border:1px solid; white-space:nowrap; }
  .tag-cyan    { color:var(--tag-cyan-fg);    border-color:var(--tag-cyan-bd);    background:var(--tag-cyan-bg); }
  .tag-violet  { color:var(--tag-violet-fg);  border-color:var(--tag-violet-bd);  background:var(--tag-violet-bg); }
  .tag-emerald { color:var(--tag-emerald-fg); border-color:var(--tag-emerald-bd); background:var(--tag-emerald-bg); }
  .tag-rose    { color:var(--tag-rose-fg);    border-color:var(--tag-rose-bd);    background:var(--tag-rose-bg); }
  .tag-amber   { color:var(--tag-amber-fg);   border-color:var(--tag-amber-bd);   background:var(--tag-amber-bg); }
  .tag-orange  { color:var(--tag-orange-fg);  border-color:var(--tag-orange-bd);  background:var(--tag-orange-bg); }
  .tag-blue    { color:var(--tag-blue-fg);    border-color:var(--tag-blue-bd);    background:var(--tag-blue-bg); }

  /* ── metric card text helpers ─── */
  .metric-value {
    font-family:var(--font-display);
    font-size:clamp(14px, 2.2vw, 24px);
    font-weight:700;
    letter-spacing:-0.02em;
    line-height:1.1;
    word-break:break-word;
    overflow-wrap:anywhere;
  }
  .metric-label {
    font-size:9px; font-family:var(--font-mono);
    text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .metric-sub {
    font-size:9px; font-family:var(--font-mono); color:var(--text-muted);
    margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }

  /* ── section divider ─── */
  .section-divider { display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-size:9px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-muted); }
  .section-divider::after { content:''; flex:1; height:1px; background:var(--border-dim); }

  .scroll-y { overflow-y:auto; scrollbar-width:thin; }

  /* ── tabs ─── */
  .topo-tab { padding:5px 12px; border-radius:4px; font-family:var(--font-mono); font-size:10px; letter-spacing:0.04em; cursor:pointer; transition:all 0.2s; border:1px solid transparent; color:var(--text-muted); background:transparent; }
  .topo-tab:hover { color:var(--text-secondary); border-color:var(--border-dim); }
  .topo-tab.active { color:var(--ac); border-color:var(--border-hi); background:rgba(var(--ac-rgb),0.07); box-shadow:0 0 10px rgba(var(--ac-rgb),0.12); }

  /* ── nav items ─── */
  .nav-item { display:flex; align-items:center; gap:9px; padding:8px 12px; border-radius:5px; cursor:pointer; transition:all 0.2s; font-size:11px; font-family:var(--font-mono); color:var(--text-muted); border:1px solid transparent; width:100%; box-sizing:border-box; }
  .nav-item:hover { color:var(--text-secondary); background:var(--bg-hover); border-color:var(--border-dim); }
  .nav-item.active { color:var(--ac); background:rgba(var(--ac-rgb),0.06); border-color:var(--border-mid); }

  /* ── log ─── */
  .log-line { font-family:var(--font-mono); font-size:11px; padding:2px 0; word-break:break-word; }
  .log-success { color:var(--text-success); }
  .log-error   { color:var(--text-danger); }
  .log-info    { color:var(--ac); }
  .log-dim     { color:var(--text-muted); }

  /* ── legend ─── */
  .legend-shape { display:flex; align-items:center; gap:7px; font-size:10px; font-family:var(--font-mono); color:var(--text-secondary); }

  /* ── chat bubbles ─── */
  .chat-bubble-user { align-self:flex-end; max-width:85%; background:rgba(var(--ac-rgb),0.12); border:1px solid rgba(var(--ac-rgb),0.22); border-radius:12px 12px 2px 12px; padding:10px 14px; font-size:12px; }
  .chat-bubble-ai   { align-self:flex-start; max-width:90%; background:var(--bg-card); border:1px solid var(--border-dim); border-radius:2px 12px 12px 12px; padding:10px 14px; font-size:12px; }
  .chat-bubble-ai p { margin-bottom:4px; font-size:12px; line-height:1.6; }
  .chat-bubble-ai strong { color:var(--ac); }
  .chat-bubble-ai code  { background:rgba(0,0,0,0.3); padding:1px 4px; border-radius:3px; font-family:var(--font-mono); font-size:11px; }

  /* ── misc ─── */
  .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath fill='none' stroke='rgba(128,128,128,0.05)' stroke-width='0.5' d='M28 66L0 50V16L28 0l28 16v34L28 66zM0 50L28 34l28 16M28 0v34M0 16l28 18M56 16L28 34'/%3E%3C/svg%3E"); }
  .progress-bar  { height:3px; border-radius:2px; background:var(--border-dim); overflow:hidden; }
  .progress-fill { height:100%; border-radius:2px; transition:width 1.2s ease; }
  .graph-bg {
    background: radial-gradient(ellipse at 25% 40%,rgba(var(--ac-rgb),0.06) 0%,transparent 55%),
                radial-gradient(ellipse at 75% 70%,rgba(60,0,100,0.08) 0%,transparent 55%),
                var(--bg-void);
  }

  /* ── IDE panel ─── */
  .ide-panel { font-family:var(--font-mono); font-size:12px; }
  .ide-line-num { color:var(--text-muted); padding-right:18px; user-select:none; min-width:40px; text-align:right; flex-shrink:0; }
  .ide-line:hover { background:rgba(var(--ac-rgb),0.04); }

  @keyframes holo-spin { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-283} }
  .holo-ring { animation:holo-spin 3s linear infinite; }
`;
