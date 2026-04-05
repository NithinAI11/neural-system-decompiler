import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import MetricCard from '../components/MetricCard';
import { NSDLogo } from '../components/NSDLogo';
import { Icon, ICONS } from '../components/Icon';

/* Derive tech stack breakdown from fused_graph nodes if backend doesn't provide it */
function deriveTechStack(systemData) {
  /* prefer backend-provided data if it exists and has entries */
  const provided = systemData?.intelligence?.tech_stack;
  if (provided && provided.length > 0) return provided;

  /* fallback: count extensions from fused_graph.nodes */
  const nodes = systemData?.fused_graph?.nodes
    ? Object.values(systemData.fused_graph.nodes)
    : [];

  const EXT_LABEL = {
    '.py':'Python', '.js':'JavaScript', '.jsx':'JSX', '.ts':'TypeScript',
    '.tsx':'TSX', '.go':'Go', '.java':'Java', '.rb':'Ruby', '.rs':'Rust',
    '.cpp':'C++', '.c':'C', '.cs':'C#', '.php':'PHP', '.swift':'Swift',
    '.html':'HTML', '.css':'CSS', '.scss':'SCSS', '.json':'JSON',
    '.yml':'YAML', '.yaml':'YAML', '.md':'Markdown', '.sh':'Shell',
    '.sql':'SQL', '.graphql':'GraphQL',
  };

  const counts = {};
  nodes.forEach(n => {
    const id = n.id || '';
    const dotIdx = id.lastIndexOf('.');
    if (dotIdx === -1) return;
    const ext = id.slice(dotIdx).toLowerCase();
    const label = EXT_LABEL[ext];
    if (label) counts[label] = (counts[label] || 0) + 1;
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));
}

const STACK_COLORS = [
  'var(--ac)', '#8b5cf6', '#10b981', '#f59e0b',
  '#f43f5e',  '#3b82f6', '#f97316', '#2dd4bf',
];

export default function DashboardPage({ systemData }) {
  const techStack = useMemo(() => deriveTechStack(systemData), [systemData]);

  if (!systemData) return (
    <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:20,opacity:0.35}} className="hex-bg">
      <NSDLogo size={72}/>
      <div style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--text-muted)',letterSpacing:'0.15em'}}>NO SYSTEM DATA LOADED</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-muted)'}}>Initiate a scan from the sidebar to begin</div>
    </div>
  );

  const intel     = systemData.intelligence;
  const deadCount = intel.dead_code?.length || 0;
  const botCount  = intel.bottlenecks?.length || 0;
  const clusters  = intel.logical_components?.length || 0;
  const pattern   = intel.macro_architecture?.pattern || 'Modular';
  const conf      = intel.macro_architecture?.confidence;

  return (
    <div className="page-enter" style={{height:'100%',overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16,boxSizing:'border-box'}}>

      {/* ── Row 1: metric cards ────────────────────────────────────────── */}
      <div style={{display:'flex',gap:12,minWidth:0}}>
        <MetricCard
          icon="cpu"
          label="Macro Pattern"
          value={pattern}
          sub={conf ? `${conf} confidence` : 'detected'}
          color="var(--ac)"
        />
        <MetricCard
          icon="layers"
          label="Micro Clusters"
          value={clusters}
          sub="logical groups"
          color="#8b5cf6"
        />
        <MetricCard
          icon="alert"
          label="Bottlenecks"
          value={botCount}
          sub="high-centrality nodes"
          color="#f59e0b"
          anomaly={botCount > 0}
        />
        <MetricCard
          icon="ghost"
          label="Phantom Code"
          value={deadCount}
          sub="orphaned files"
          color={deadCount > 0 ? '#f43f5e' : '#10b981'}
          anomaly={deadCount > 0}
        />
      </div>

      {/* ── Row 2: AI report + tech stack ─────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16,minWidth:0}}>

        {/* AI report */}
        <div className="glass-card" style={{padding:18,minWidth:0,overflow:'hidden'}}>
          <div className="section-divider" style={{marginBottom:14}}>
            <Icon d={ICONS.activity} size={11} color="var(--ac)"/>
            AI Executive Report
          </div>
          <div className="scroll-y" style={{
            fontFamily:'var(--font-body)',fontSize:12,lineHeight:1.75,
            color:'var(--text-secondary)',maxHeight:200,overflowY:'auto',
          }}>
            <ReactMarkdown>{intel.ai_executive_report || 'No report generated.'}</ReactMarkdown>
          </div>
        </div>

        {/* Tech stack */}
        <div className="glass-card" style={{padding:18,minWidth:0,overflow:'hidden'}}>
          <div className="section-divider" style={{marginBottom:14}}>
            <Icon d={ICONS.file} size={11} color="#8b5cf6"/>
            Tech Stack
          </div>
          {techStack.length === 0 ? (
            <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-muted)'}}>
              No file data available
            </div>
          ) : techStack.map(({ name, count, pct }, i) => (
            <div key={name} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,gap:8}}>
                <span style={{
                  fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)',
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,
                }}>
                  {name}
                </span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-muted)',flexShrink:0}}>
                  {count}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width:`${pct}%`,
                  background: STACK_COLORS[i % STACK_COLORS.length],
                  opacity:0.85,
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: placeholder feature cards ─────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,minWidth:0}}>
        {[
          {icon:'impact', label:'Change Impact Predictor', desc:'Analyze blast radius of any code modification',   badge:'PLACEHOLDER', color:'#f59e0b'},
          {icon:'radar',  label:'Anomaly Detector',        desc:'ML-powered detection of anti-patterns and smells',badge:'COMING SOON',  color:'#8b5cf6'},
          {icon:'git',    label:'Temporal Diff',           desc:'Compare architecture across Git commits',         badge:'PLACEHOLDER', color:'#10b981'},
        ].map(({ icon, label, desc, badge, color }) => (
          <div key={label} className="glass-card" style={{padding:18,opacity:0.65,cursor:'not-allowed',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8}}>
              <Icon d={ICONS[icon]||ICONS.cpu} size={18} color={color}/>
              <span style={{
                padding:'2px 7px',borderRadius:20,border:`1px solid ${color}44`,
                fontSize:8,fontFamily:'var(--font-mono)',letterSpacing:'0.08em',
                color,flexShrink:0,
              }}>{badge}</span>
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:10,color:'var(--text-secondary)',marginBottom:6,letterSpacing:'0.05em',lineHeight:1.4}}>
              {label}
            </div>
            <div style={{fontFamily:'var(--font-body)',fontSize:11,color:'var(--text-muted)',lineHeight:1.55}}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
