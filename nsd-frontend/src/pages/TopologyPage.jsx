import React, { useState, useRef } from 'react';
import SystemGraph from '../components/SystemGraph';
import IDEPanel    from '../components/IDEPanel';
import { NSDLogo } from '../components/NSDLogo';
import { Icon, ICONS } from '../components/Icon';

const LAYOUTS = [
  { key:'force',     label:'3D Neural Cloud'   },
  { key:'waterfall', label:'4D Execution Flow' },
  { key:'radial',    label:'8D Radial Core'    },
  { key:'flowchart', label:'2D Flowchart'      },
];

export default function TopologyPage({ systemData, highlightedNodes = [], onQuery }) {
  const [layout,       setLayout]       = useState('force');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef();

  const toggleFS = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!systemData) return (
    <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.3}}>
      <div style={{textAlign:'center'}}>
        <NSDLogo size={60}/>
        <div style={{marginTop:16,fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)'}}>
          Load a system to render topology
        </div>
      </div>
    </div>
  );

  return (
    <div ref={wrapperRef} className="page-enter" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>

      {/* Controls bar */}
      <div style={{
        padding:'8px 14px',
        display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
        borderBottom:'1px solid var(--border-dim)',
        background:'rgba(6,12,24,0.88)',
        flexShrink:0, backdropFilter:'blur(10px)', zIndex:10,
      }}>
        <Icon d={ICONS.layers} size={13} color="var(--accent-cyan)"/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',letterSpacing:'0.1em',marginRight:4}}>
          RENDER MODE
        </span>
        {LAYOUTS.map(({ key, label }) => (
          <button
            key={key}
            className={`topo-tab ${layout===key ? 'active' : ''}`}
            onClick={() => { setLayout(key); setSelectedNode(null); }}
          >
            {label}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button className="topo-tab" style={{padding:'5px 10px'}} onClick={toggleFS}>
          <Icon d={isFullscreen ? ICONS.minimize : ICONS.maximize} size={12}/>
        </button>
      </div>

      {/* Graph area */}
      <div style={{flex:1,position:'relative',overflow:'hidden'}}>
        <SystemGraph
          graphData={systemData.fused_graph}
          onNodeClick={setSelectedNode}
          highlightedNodes={highlightedNodes}
          layoutMode={layout}
        />
        <IDEPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onQuery={q => { onQuery?.(q); setSelectedNode(null); }}
        />
      </div>
    </div>
  );
}
