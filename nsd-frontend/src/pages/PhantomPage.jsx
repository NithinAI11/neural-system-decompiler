import React from 'react';
import { Icon, ICONS } from '../components/Icon';

export default function PhantomPage({ systemData }) {
  const dead = systemData?.intelligence?.dead_code || [];

  if (!systemData) return (
    <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.3}}>
      <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)'}}>No data loaded</span>
    </div>
  );

  return (
    <div className="page-enter" style={{height:'100%',overflowY:'auto',padding:24}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <Icon d={ICONS.ghost} size={20} color="var(--accent-rose)"/>
        <div>
          <div style={{fontFamily:'var(--font-display)',fontSize:13,letterSpacing:'0.1em',color:'var(--accent-rose)'}}>PHANTOM CODE AUDIT</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-muted)',marginTop:2}}>{dead.length} orphaned files — unreferenced across entire dependency graph</div>
        </div>
        <div style={{flex:1}}/>
        <span className="tag tag-rose">{dead.length} FILES AT RISK</span>
      </div>

      {dead.length === 0 ? (
        <div className="glass-card" style={{padding:40,textAlign:'center'}}>
          <Icon d={ICONS.activity} size={40} color="var(--accent-emerald)"/>
          <div style={{fontFamily:'var(--font-display)',fontSize:14,color:'var(--accent-emerald)',marginTop:16,letterSpacing:'0.1em'}}>CLEAN CODEBASE</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-muted)',marginTop:8}}>No phantom code detected</div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {dead.map((file, i) => (
            <div key={i} className="glass-card" style={{padding:'14px 16px',borderColor:'rgba(244,63,94,0.1)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'var(--accent-rose)',opacity:0.5}}/>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--accent-rose)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {typeof file==='string' ? file : file.id || file}
                </span>
              </div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)'}}>Orphaned — no inbound references found</div>
              <div style={{marginTop:10,display:'flex',gap:6}}>
                <span className="tag tag-rose"  style={{fontSize:8}}>PHANTOM</span>
                <span className="tag tag-amber" style={{fontSize:8}}>REVIEW NEEDED</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
