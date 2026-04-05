import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import * as THREE   from 'three';
import SpriteText   from 'three-spritetext';
import { FILE_TYPES, getTypeKey } from '../constants/fileTypes';

/* ─── 3-D node builder ────────────────────────────────────────────────────── */
function build3DObject(node) {
  const typeKey = getTypeKey(node.id, node.isBottleneck, node.isDead);
  const cfg     = FILE_TYPES[typeKey];
  const col     = new THREE.Color(cfg.color);
  const base    = Math.max((node.val || 3) * cfg.size, 2);
  const hi      = node.isHighlighted;
  const group   = new THREE.Group();

  /* material */
  const mat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: hi ? 2.2 : node.isBottleneck ? 1.2 : node.isDead ? 0.08 : 0.35,
    transparent: true,
    opacity: node.isDead ? 0.18 : 0.93,
    wireframe: node.isDead,
    roughness: 0.15,
    metalness: 0.75,
  });

  /* geometry per shape */
  let geo;
  switch (cfg.shape) {
    case 'octahedron':   geo = new THREE.OctahedronGeometry(base, 0); break;
    case 'box':          geo = new THREE.BoxGeometry(base*1.3, base*1.3, base*1.3); break;
    case 'tetrahedron':  geo = new THREE.TetrahedronGeometry(base*1.2, 0); break;
    case 'cone':         geo = new THREE.ConeGeometry(base*0.8, base*1.8, 6); break;
    case 'torus':        geo = new THREE.TorusGeometry(base*0.8, base*0.3, 8, 16); break;
    case 'icosahedron':  geo = new THREE.IcosahedronGeometry(base*0.9, 0); break;
    case 'dodecahedron': geo = new THREE.DodecahedronGeometry(base*0.9, 0); break;
    case 'wireframe':    geo = new THREE.SphereGeometry(base, 8, 8); mat.wireframe = true; break;
    default:             geo = new THREE.SphereGeometry(base, 16, 16); break;
  }
  group.add(new THREE.Mesh(geo, mat));

  /* orbital ring for bottlenecks / highlighted */
  if (node.isBottleneck || hi) {
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(base * 1.9, 0.35, 6, 32),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: hi ? 0.5 : 0.25 })
    );
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
  }

  /* label — always shown, scaled by importance */
  const shortName = node.id.split('/').pop().replace(/\.[^.]+$/, '');  /* strip extension */
  const sprite    = new SpriteText(shortName);
  sprite.color           = hi ? '#d8b4fe' : cfg.color;
  sprite.textHeight      = hi || node.isBottleneck ? 5 : node.val > 6 ? 4 : 3;
  sprite.fontWeight      = '600';
  sprite.position.y      = base + (hi || node.isBottleneck ? 10 : 7);
  sprite.backgroundColor = 'rgba(3,5,10,0.80)';
  sprite.padding         = [3, 1];
  sprite.borderRadius    = 3;
  sprite.borderColor     = hi ? '#a855f7' : cfg.color + '66';
  sprite.borderWidth     = 0.8;
  group.add(sprite);

  return group;
}

/* ─── 2-D flowchart canvas painter ───────────────────────────────────────── */
function paint2D(node, ctx, globalScale, highlightedNodes) {
  const typeKey = getTypeKey(node.id, node.isBottleneck, node.isDead);
  const cfg     = FILE_TYPES[typeKey];
  const r       = Math.max((node.val || 3) * cfg.size * 0.55, 3);
  const hi      = highlightedNodes.includes(node.id);
  const x = node.x, y = node.y;

  /* glow ring */
  if (hi || node.isBottleneck) {
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
    ctx.fillStyle = cfg.color + '28';
    ctx.fill();
  }

  /* shape */
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();

  switch (cfg.shape) {
    case 'octahedron':
    case 'tetrahedron': {
      const s = r * 1.4;
      ctx.moveTo(0, -s); ctx.lineTo(s*0.87, s*0.5); ctx.lineTo(-s*0.87, s*0.5); ctx.closePath(); break;
    }
    case 'box': {
      const s = r * 1.1;
      ctx.rect(-s, -s, s*2, s*2); break;
    }
    case 'cone': {
      const s = r * 1.2;
      ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); break;
    }
    case 'torus': {
      /* two concentric circles */
      ctx.arc(0, 0, r, 0, 2*Math.PI);
      ctx.restore();
      ctx.save(); ctx.translate(x, y);
      ctx.moveTo(r*0.4, 0); ctx.arc(0, 0, r*0.4, 0, 2*Math.PI); break;
    }
    default: ctx.arc(0, 0, r, 0, 2*Math.PI); break;
  }

  ctx.fillStyle   = cfg.color + (node.isDead ? '22' : 'cc');
  ctx.strokeStyle = hi ? '#a855f7' : cfg.color;
  ctx.lineWidth   = hi ? 2.5 : 1.2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  /* label */
  const shortName = node.id.split('/').pop().replace(/\.[^.]+$/, '');
  const fs = Math.max(10 / globalScale, 2);
  ctx.font        = `${fs}px "JetBrains Mono", monospace`;
  ctx.textAlign   = 'center';
  ctx.textBaseline= 'top';

  /* text bg */
  const tw = ctx.measureText(shortName).width;
  const pad = 2 / globalScale;
  ctx.fillStyle = 'rgba(3,5,10,0.75)';
  ctx.fillRect(x - tw/2 - pad, y + r + 2/globalScale - pad, tw + pad*2, fs + pad*2);

  ctx.fillStyle = hi ? '#d8b4fe' : cfg.color;
  ctx.fillText(shortName, x, y + r + 2/globalScale);
}

/* ─── Legend ─────────────────────────────────────────────────────────────── */
const LEGEND_ITEMS = [
  { s:'●', c:'#38bdf8', l:'Python'     },
  { s:'◆', c:'#facc15', l:'JS/JSX'     },
  { s:'■', c:'#3b82f6', l:'TS/TSX'     },
  { s:'▲', c:'#2dd4bf', l:'Go'         },
  { s:'▶', c:'#f97316', l:'HTML'       },
  { s:'⬡', c:'#a855f7', l:'CSS/SCSS'   },
  { s:'◉', c:'#f43f5e', l:'Critical'   },
  { s:'○', c:'#444',    l:'Dead Code'  },
];

const GraphLegend = () => (
  <div style={{
    position:'absolute', bottom:16, left:16, zIndex:10,
    background:'rgba(3,5,10,0.88)', border:'1px solid rgba(0,200,255,0.18)',
    borderRadius:6, padding:'10px 14px',
    display:'flex', flexDirection:'column', gap:5,
    pointerEvents:'none',
  }}>
    <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',letterSpacing:'0.1em',marginBottom:4}}>NODE TYPES</div>
    {LEGEND_ITEMS.map(({s,c,l}) => (
      <div key={l} style={{display:'flex',alignItems:'center',gap:8,fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>
        <span style={{color:c,fontSize:12,width:14,lineHeight:1}}>{s}</span>
        <span>{l}</span>
      </div>
    ))}
  </div>
);

/* ─── Controls hint ──────────────────────────────────────────────────────── */
const ControlsHint = ({ is2D }) => (
  <div style={{
    position:'absolute', top:12, right:12, zIndex:10,
    background:'rgba(3,5,10,0.75)', border:'1px solid rgba(0,200,255,0.12)',
    borderRadius:5, padding:'7px 12px',
    fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-muted)',
    lineHeight:1.8, pointerEvents:'none',
  }}>
    {is2D ? (
      <>Scroll — zoom &nbsp;·&nbsp; Drag — pan &nbsp;·&nbsp; Click — inspect</>
    ) : (
      <>Scroll — zoom &nbsp;·&nbsp; Left-drag — orbit &nbsp;·&nbsp; Right-drag — pan &nbsp;·&nbsp; Click — inspect</>
    )}
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function SystemGraph({ graphData, onNodeClick, highlightedNodes = [], layoutMode = 'force' }) {
  const fg3Ref      = useRef();
  const fg2Ref      = useRef();
  const containerRef= useRef();
  const [dims, setDims] = useState({ w:0, h:0 });

  /* responsive resize */
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) setDims({ w: r.width, h: r.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* auto-center 3D on data load */
  useEffect(() => {
    if (!fg3Ref.current || layoutMode === 'flowchart') return;
    const id = setTimeout(() => {
      fg3Ref.current?.zoomToFit(1200, 60);
    }, 2500);
    return () => clearTimeout(id);
  }, [graphData, layoutMode]);

  /* auto-center 2D */
  useEffect(() => {
    if (!fg2Ref.current || layoutMode !== 'flowchart') return;
    const id = setTimeout(() => {
      fg2Ref.current?.zoomToFit(800, 60);
    }, 1500);
    return () => clearTimeout(id);
  }, [graphData, layoutMode]);

  /* build node + link arrays */
  const { nodes, links } = useMemo(() => {
    if (!graphData?.nodes) return { nodes:[], links:[] };

    const formattedNodes = Object.values(graphData.nodes).map(n => {
      const isDead        = n.semantic_role?.includes('DEAD CODE');
      const isBottleneck  = (n.centrality_score || 0) > 0.4;
      const typeKey       = getTypeKey(n.id, isBottleneck, isDead);
      return {
        id:           n.id,
        name:         n.id.split('/').pop(),
        val:          Math.max((n.centrality_score || 0) * 20 + 3, 3),
        typeKey,
        color:        FILE_TYPES[typeKey].color,
        isBottleneck,
        isDead,
        isHighlighted: highlightedNodes.includes(n.id),
        fullData:      n,
      };
    });

    const formattedLinks = (graphData.edges || []).map(e => ({
      source:   e.source,
      target:   e.target,
      relation: e.relation,
    }));

    /* roots for DAG layouts */
    const targetSet = new Set(formattedLinks.map(l => l.target));
    const rootIds   = new Set(formattedNodes.map(n => n.id).filter(id => !targetSet.has(id)));
    formattedNodes.forEach(n => { n.rootIds = rootIds; });

    return { nodes: formattedNodes, links: formattedLinks };
  }, [graphData, highlightedNodes]);

  /* helpers */
  const isHLLink = useCallback(link => {
    const s = typeof link.source === 'object' ? link.source.id : link.source;
    const t = typeof link.target === 'object' ? link.target.id : link.target;
    return highlightedNodes.includes(s) || highlightedNodes.includes(t);
  }, [highlightedNodes]);

  const handleClick3D = useCallback(node => {
    onNodeClick?.(node.fullData);
    const dist      = 80;
    const distRatio = 1 + dist / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    fg3Ref.current?.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node, 1200
    );
  }, [onNodeClick]);

  const handleClick2D = useCallback(node => {
    onNodeClick?.(node.fullData);
    fg2Ref.current?.centerAt(node.x, node.y, 600);
    fg2Ref.current?.zoom(3, 600);
  }, [onNodeClick]);

  /* tooltip */
  const nodeLabel = useCallback(node => {
    const cfg = FILE_TYPES[node.typeKey] || FILE_TYPES.default;
    return `<div style="background:rgba(3,5,10,0.95);border:1px solid ${cfg.color}44;padding:8px 12px;border-radius:6px;font-family:monospace;font-size:12px;max-width:300px;line-height:1.6">
      <div style="color:${cfg.color};font-size:10px;letter-spacing:0.1em;margin-bottom:4px">${cfg.label.toUpperCase()}</div>
      <div style="color:#e8f4fd;word-break:break-all">${node.id}</div>
      ${node.isBottleneck ? '<div style="color:#f43f5e;font-size:10px;margin-top:4px">⚠ CRITICAL BOTTLENECK</div>' : ''}
      ${node.isDead       ? '<div style="color:#666;font-size:10px;margin-top:4px">◌ PHANTOM / DEAD CODE</div>' : ''}
    </div>`;
  }, []);

  const dagMode = layoutMode === 'waterfall' ? 'td'
                : layoutMode === 'radial'    ? 'radialout'
                : null;

  const is2D = layoutMode === 'flowchart';

  /* common link style helpers */
  const linkColor = link =>
    isHLLink(link)              ? '#a855f7'
    : link.relation==='api_route' ? '#3b82f6'
    : link.relation==='imports'   ? 'rgba(0,200,255,0.35)'
    : 'rgba(56,189,248,0.18)';

  const linkWidth = link => isHLLink(link) ? 3 : link.relation==='api_route' ? 2 : 1;

  if (!dims.w || !dims.h) {
    return (
      <div ref={containerRef} style={{width:'100%',height:'100%',position:'relative'}} className="graph-bg">
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.3,fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)'}}>
          Initialising renderer…
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{width:'100%',height:'100%',position:'relative'}} className="graph-bg">

      {/* scan sweep */}
      <div style={{position:'absolute',left:0,right:0,height:2,zIndex:5,pointerEvents:'none',background:'linear-gradient(90deg,transparent,rgba(0,200,255,0.3),transparent)'}} className="scan-anim"/>

      {/* ── 2-D Flowchart ─────────────────────────────────────────────── */}
      {is2D && (
        <ForceGraph2D
          ref={fg2Ref}
          width={dims.w} height={dims.h}
          graphData={{ nodes, links }}
          backgroundColor="rgba(0,0,0,0)"
          nodeLabel={nodeLabel}
          nodeCanvasObject={(node, ctx, scale) => paint2D(node, ctx, scale, highlightedNodes)}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={link => linkColor(link)}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={link => isHLLink(link) ? 3 : 1.5}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={link => link.relation==='api_route' ? '#3b82f6' : '#00c8ff'}
          onNodeClick={handleClick2D}
          cooldownTime={2000}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.35}
          enableNodeDrag
          enablePanInteraction
          enableZoomInteraction
        />
      )}

      {/* ── 3-D modes (force / waterfall / radial) ────────────────────── */}
      {!is2D && (
        <ForceGraph3D
          ref={fg3Ref}
          width={dims.w} height={dims.h}
          graphData={{ nodes, links }}
          dagMode={dagMode}
          dagLevelDistance={dagMode==='radialout' ? 130 : 55}
          dagNodeFilter={node => dagMode ? node.rootIds?.has(node.id) : true}
          backgroundColor="rgba(0,0,0,0)"
          nodeLabel={nodeLabel}
          nodeThreeObject={build3DObject}
          nodeThreeObjectExtend={false}
          /* edges */
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={0.7}
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={link => isHLLink(link) ? 4 : link.relation==='api_route' ? 2.5 : 1.2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={link => link.relation==='api_route' ? '#3b82f6' : '#00c8ff'}
          /* interaction */
          onNodeClick={handleClick3D}
          enableNodeDrag
          /* physics */
          cooldownTime={3000}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.25}
          /* lighting */
          onEngineStop={() => fg3Ref.current?.zoomToFit(800, 60)}
        />
      )}

      <GraphLegend/>
      <ControlsHint is2D={is2D}/>
    </div>
  );
}
