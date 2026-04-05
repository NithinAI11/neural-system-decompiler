import React from 'react';
import { Icon, ICONS } from './Icon';

export default function MetricCard({ icon, label, value, sub, color='var(--ac)', anomaly=false, onClick }) {
  return (
    <div
      className={`glass-card corner-mark ${anomaly ? 'anomaly-card' : ''}`}
      onClick={onClick}
      style={{
        padding:'14px 16px',
        flex:'1 1 0',
        minWidth:0,           /* ← critical: allows flex children to shrink */
        cursor: onClick ? 'pointer' : 'default',
        borderColor: anomaly ? 'rgba(244,63,94,0.3)' : undefined,
        transition:'all 0.2s',
        overflow:'hidden',
        display:'flex',
        flexDirection:'column',
        gap:4,
      }}
    >
      {/* label + icon row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,minWidth:0}}>
        <span className="metric-label" style={{flex:1,minWidth:0}}>{label}</span>
        <Icon d={ICONS[icon]||ICONS.cpu} size={14} color={color} style={{flexShrink:0}}/>
      </div>

      {/* value — clamp font size via CSS class */}
      <div className="metric-value" style={{color}}>{value}</div>

      {/* sub */}
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}
