import React, { useState } from 'react';

const FIELDS = [
  { label:'API Endpoint',                   value:'http://localhost:8000', type:'input'  },
  { label:'LLM Provider',                   value:'Groq (llama-3.3-70b)', type:'input'  },
  { label:'Max Graph Nodes',                value:'5000',                  type:'input'  },
  { label:'Force Re-analysis by Default',   value:false,                   type:'toggle' },
  { label:'Auto-update Graph on Commit',    value:false,                   type:'toggle', badge:'COMING SOON' },
  { label:'Enable Temporal Diff Mode',      value:false,                   type:'toggle', badge:'COMING SOON' },
];

export default function SettingsPage() {
  const [vals, setVals] = useState(() => Object.fromEntries(FIELDS.map(f => [f.label, f.value])));

  return (
    <div className="page-enter" style={{height:'100%',overflowY:'auto',padding:24}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:13,letterSpacing:'0.1em',color:'var(--text-secondary)',marginBottom:24}}>SYSTEM CONFIGURATION</div>
      {FIELDS.map(({label, type, badge}) => (
        <div key={label} className="glass-card" style={{padding:'16px 20px',marginBottom:10,display:'flex',alignItems:'center',gap:16}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)',marginBottom:4}}>{label}</div>
            {badge && <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',border:'1px solid var(--border-dim)',padding:'1px 6px',borderRadius:10}}>{badge}</span>}
          </div>
          {type === 'input' && (
            <input className="neon-input" value={vals[label]} onChange={e => setVals(v => ({...v,[label]:e.target.value}))}
              style={{width:240,opacity:badge?0.4:1}} disabled={!!badge}/>
          )}
          {type === 'toggle' && (
            <div style={{width:40,height:22,borderRadius:11,background:vals[label]?'var(--accent-cyan)':'var(--border-dim)',cursor:badge?'not-allowed':'pointer',position:'relative',opacity:badge?0.4:1,transition:'background 0.2s'}}
              onClick={() => !badge && setVals(v => ({...v,[label]:!v[label]}))}>
              <div style={{position:'absolute',top:3,left:vals[label]?18:3,width:16,height:16,borderRadius:'50%',background:'white',transition:'left 0.2s'}}/>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
