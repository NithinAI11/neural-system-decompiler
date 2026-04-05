import React from 'react';
import { Icon, ICONS } from './Icon';
import { FILE_TYPES, getTypeKey } from '../constants/fileTypes';

export default function IDEPanel({ node, onClose, onQuery }) {
  if (!node) return null;

  const isDead       = node.semantic_role?.includes('DEAD CODE');
  const isBottleneck = (node.centrality_score || 0) > 0.4;
  const typeKey      = getTypeKey(node.id, isBottleneck, isDead);
  const cfg          = FILE_TYPES[typeKey] || FILE_TYPES.default;

  /* build displayable content */
  const rawContent = node.content || node.source_code || node.summary || null;
  const lines = rawContent
    ? rawContent.split('\n')
    : ['// No source mapped for this node.', '//', `// Node ID : ${node.id}`, `// Role    : ${node.semantic_role || '—'}`, `// Centrality: ${(node.centrality_score || 0).toFixed(3)}`];

  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, height:'42%',
      background:'rgba(3,5,10,0.97)',
      border:'1px solid var(--border-mid)',
      borderBottom:'none', borderRadius:'8px 8px 0 0',
      display:'flex', flexDirection:'column', zIndex:20,
      boxShadow:'0 -20px 60px rgba(0,200,255,0.12)',
    }}>
      {/* ── header ─────────────────────────────────────────────────────── */}
      <div style={{
        padding:'9px 14px',
        borderBottom:'1px solid var(--border-dim)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(0,0,0,0.45)', borderRadius:'8px 8px 0 0', flexShrink:0,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0,flex:1}}>
          {/* macOS-style dots */}
          <div style={{display:'flex',gap:5,flexShrink:0}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:'#f43f5e',opacity:0.85}}/>
            <div style={{width:10,height:10,borderRadius:'50%',background:'#f59e0b',opacity:0.85}}/>
            <div style={{width:10,height:10,borderRadius:'50%',background:'#10b981',opacity:0.85}}/>
          </div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:cfg.color,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {node.id}
          </span>
          <span className={`tag ${cfg.tagClass}`} style={{fontSize:9,flexShrink:0}}>{cfg.label}</span>
          {isBottleneck && <span className="tag tag-rose" style={{fontSize:9,flexShrink:0}}>CRITICAL</span>}
          {isDead       && <span className="tag tag-rose" style={{fontSize:9,flexShrink:0}}>PHANTOM</span>}
        </div>

        <div style={{display:'flex',gap:7,flexShrink:0,marginLeft:10}}>
          <button className="btn-neon" style={{fontSize:9,padding:'5px 10px'}}
            onClick={() => onQuery?.(`What downstream files break if I modify ${node.id}?`)}>
            Impact ↗
          </button>
          <button className="btn-neon" style={{fontSize:9,padding:'5px 10px'}}
            onClick={() => onQuery?.(`Explain the role of ${node.id} in this system.`)}>
            Explain ↗
          </button>
          <button onClick={onClose}
            style={{background:'transparent',border:'1px solid var(--border-dim)',borderRadius:4,cursor:'pointer',color:'var(--text-muted)',display:'flex',padding:5}}>
            <Icon d={ICONS.x} size={14}/>
          </button>
        </div>
      </div>

      {/* ── code body ──────────────────────────────────────────────────── */}
      <div className="ide-panel scroll-y" style={{flexGrow:1,padding:'10px 0',overflowY:'auto'}}>
        {lines.map((line, i) => (
          <div key={i} className="ide-line" style={{display:'flex',paddingLeft:8}}>
            <span className="ide-line-num">{String(i+1).padStart(4,' ')}</span>
            <span style={{color:'#c9d5e0',whiteSpace:'pre-wrap',wordBreak:'break-all',flex:1}}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
