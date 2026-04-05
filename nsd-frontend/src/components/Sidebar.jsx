import React, { useState } from 'react';
import axios from 'axios';
import { NSDLogo } from './NSDLogo';
import { Icon, ICONS } from './Icon';

const NAV = [
  { key:'dashboard', icon:'graph',    label:'Dashboard'      },
  { key:'topology',  icon:'neural',   label:'Topology Graph' },
  { key:'phantom',   icon:'ghost',    label:'Phantom Audit'  },
  { key:'settings',  icon:'settings', label:'Configuration'  },
];

const ACCENTS = [
  { key:'cyan',    hex:'#00c8ff', label:'Cyan'    },
  { key:'violet',  hex:'#8b5cf6', label:'Violet'  },
  { key:'emerald', hex:'#10b981', label:'Emerald' },
  { key:'rose',    hex:'#f43f5e', label:'Rose'    },
  { key:'amber',   hex:'#f59e0b', label:'Amber'   },
  { key:'indigo',  hex:'#6366f1', label:'Indigo'  },
];

export default function Sidebar({ activePage, setActivePage, systemData, themeMode, setThemeMode, accent, setAccent }) {
  const [targetPath,     setTargetPath]     = useState('');
  const [forceReprocess, setForceReprocess] = useState(false);
  const [isCompiling,    setIsCompiling]    = useState(false);
  const [logs,           setLogs]           = useState([]);

  const handleCompile = async () => {
    if (!targetPath.trim()) return;
    setIsCompiling(true);
    setLogs(['[SYS] Initiating deep neural scan...']);
    const seq = [
      'Cloning repository...','Parsing ASTs...','Building dependency graph...',
      'Running graph intelligence...','Executing semantic AI layer...','Fusing graph + semantics...',
    ];
    let i = 0;
    const iv = setInterval(() => { if (i < seq.length) { setLogs(p => [...p, `[SYS] ${seq[i]}`]); i++; } }, 1200);
    const payload = targetPath.startsWith('http')
      ? { repo_url:targetPath, force_reprocess:forceReprocess }
      : { directory_path:targetPath, force_reprocess:forceReprocess };
    try {
      const res = await axios.post('http://localhost:8000/api/v1/compile', payload);
      clearInterval(iv);
      setLogs(p => [...p, '[SUCCESS] Architecture decompiled.']);
      window.__nsdSetData?.(res.data.data);
    } catch (err) {
      clearInterval(iv);
      setLogs(p => [...p, `[ERROR] ${err.response?.data?.detail || err.message}`]);
    }
    setIsCompiling(false);
  };

  const isDark = themeMode === 'dark';

  return (
    <div style={{
      width:256, minWidth:256, maxWidth:256, flexShrink:0,
      display:'flex', flexDirection:'column',
      background:'var(--bg-panel)', borderRight:'1px solid var(--border-dim)',
      height:'100%', overflow:'hidden', boxSizing:'border-box',
    }}>

      {/* ── logo + theme toggle ──────────────────────────────────── */}
      <div style={{padding:'13px 14px',borderBottom:'1px solid var(--border-dim)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
          <div style={{flexShrink:0}}><NSDLogo size={28}/></div>
          <div style={{minWidth:0}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:10,fontWeight:700,letterSpacing:'0.12em',color:'var(--ac)',whiteSpace:'nowrap'}}>NSD ENGINE</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:'var(--text-muted)'}}>v2.0</div>
          </div>
        </div>
        {/* theme toggle */}
        <button
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
          style={{
            background:'transparent', border:'1px solid var(--border-dim)',
            borderRadius:4, cursor:'pointer', color:'var(--text-secondary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:5, flexShrink:0, transition:'all 0.2s',
          }}>
          <Icon d={isDark ? ICONS.sun : ICONS.moon} size={13}/>
        </button>
      </div>

      {/* ── accent picker ────────────────────────────────────────── */}
      <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border-dim)',flexShrink:0}}>
        <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:'var(--text-muted)',letterSpacing:'0.1em',marginBottom:8,textTransform:'uppercase'}}>
          Accent Colour
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          {ACCENTS.map(({ key, hex, label }) => (
            <button
              key={key}
              title={label}
              onClick={() => setAccent(key)}
              style={{
                width:22, height:22, borderRadius:'50%', border:'none',
                background: hex, cursor:'pointer', flexShrink:0,
                outline: accent===key ? `2px solid ${hex}` : '2px solid transparent',
                outlineOffset:2,
                boxShadow: accent===key ? `0 0 8px ${hex}88` : 'none',
                transition:'all 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── nav ─────────────────────────────────────────────────── */}
      <div style={{padding:'10px 10px',borderBottom:'1px solid var(--border-dim)',flexShrink:0}}>
        {NAV.map(({ key, icon, label }) => (
          <div key={key} className={`nav-item ${activePage===key?'active':''}`} onClick={() => setActivePage(key)}>
            <Icon d={ICONS[icon]||ICONS.cpu} size={13} color={activePage===key?'var(--ac)':'var(--text-muted)'}/>
            <span style={{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</span>
            {key==='phantom' && (systemData?.intelligence?.dead_code?.length||0) > 0 && (
              <span style={{flexShrink:0,background:'#f43f5e',color:'white',fontSize:8,fontFamily:'var(--font-mono)',padding:'1px 5px',borderRadius:10}}>
                {systemData.intelligence.dead_code.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── scan input ──────────────────────────────────────────── */}
      <div style={{padding:'13px 12px',borderBottom:'1px solid var(--border-dim)',flexShrink:0,boxSizing:'border-box'}}>
        <div className="section-divider" style={{marginBottom:11}}>
          <Icon d={ICONS.scan} size={10} color="var(--ac)"/>
          Target Source
        </div>
        <input
          className="neon-input"
          placeholder="https://github.com/… or /path"
          value={targetPath}
          onChange={e => setTargetPath(e.target.value)}
          onKeyPress={e => e.key==='Enter' && handleCompile()}
          style={{marginBottom:9}}
        />
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}>
          <div
            style={{
              width:30,height:16,borderRadius:8,flexShrink:0,position:'relative',
              transition:'background 0.2s',cursor:'pointer',
              background:forceReprocess?'#f43f5e':'var(--border-dim)',
            }}
            onClick={() => setForceReprocess(v => !v)}
          >
            <div style={{position:'absolute',top:2,width:12,height:12,left:forceReprocess?16:2,borderRadius:'50%',background:'white',transition:'left 0.2s'}}/>
          </div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',letterSpacing:'0.06em',lineHeight:1.2}}>
            FORCE RE-ANALYSIS
          </span>
        </div>
        <button className="btn-neon" style={{width:'100%',boxSizing:'border-box'}}
          onClick={handleCompile} disabled={isCompiling||!targetPath.trim()}>
          {isCompiling ? '⟳  PROCESSING...' : '▶  DECOMPILE SYSTEM'}
        </button>
      </div>

      {/* ── log ─────────────────────────────────────────────────── */}
      <div className="scroll-y" style={{flex:1,padding:'12px 12px',overflowY:'auto',boxSizing:'border-box'}}>
        {logs.length > 0 && (
          <>
            <div className="section-divider" style={{marginBottom:8}}>
              <Icon d={ICONS.terminal} size={10} color="var(--ac)"/>
              Pipeline Log
            </div>
            {logs.map((log,i) => (
              <div key={i} className={`log-line ${log.includes('SUCCESS')?'log-success':log.includes('ERROR')?'log-error':'log-info'}`} style={{marginBottom:3}}>{log}</div>
            ))}
          </>
        )}
        {!systemData && logs.length===0 && (
          <div style={{textAlign:'center',marginTop:20,opacity:0.3}}>
            <Icon d={ICONS.neural} size={26} color="var(--ac)"/>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',marginTop:8,letterSpacing:'0.08em'}}>AWAITING INJECTION</div>
          </div>
        )}
      </div>

      {/* ── status ──────────────────────────────────────────────── */}
      {systemData && (
        <div style={{padding:'10px 12px',borderTop:'1px solid var(--border-dim)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981',flexShrink:0}} className="pulse-dot"/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#10b981',letterSpacing:'0.06em'}}>SYSTEM LOADED</span>
          </div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',marginTop:3}}>
            {Object.keys(systemData.fused_graph?.nodes||{}).length} nodes · {systemData.fused_graph?.edges?.length||0} edges
          </div>
        </div>
      )}
    </div>
  );
}
