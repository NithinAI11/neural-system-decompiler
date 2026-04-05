import React from 'react';

export default function LoadingTerminal({ logs }) {
  return (
    <div style={{
      position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
      width:500,background:'rgba(3,5,10,0.96)',border:'1px solid var(--border-hi)',
      borderRadius:8,padding:24,zIndex:50,
      boxShadow:'0 0 60px rgba(0,200,255,0.2),0 0 120px rgba(0,200,255,0.05)',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <div style={{display:'flex',gap:6}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--accent-rose)'}}/>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--accent-amber)'}}/>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--accent-emerald)'}}/>
        </div>
        <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-muted)',letterSpacing:'0.08em'}}>
          nsd://agentic-pipeline.exe
        </span>
      </div>
      <div style={{height:220,overflowY:'auto'}} className="scroll-y">
        {logs.map((log, i) => (
          <div key={i} className={`log-line ${log.includes('SUCCESS')?'log-success':log.includes('ERROR')?'log-error':'log-info'}`}>
            <span style={{color:'var(--text-muted)',marginRight:8}}>{String(i+1).padStart(2,'0')} ›</span>
            {log}
          </div>
        ))}
        <div className="log-line log-info cursor-blink" style={{marginTop:4}}>PROCESSING</div>
      </div>
      <div style={{marginTop:20,height:2,background:'var(--border-dim)',borderRadius:1,overflow:'hidden'}}>
        <div style={{
          height:'100%',width:'60%',borderRadius:1,
          background:'linear-gradient(90deg,var(--accent-cyan),var(--accent-violet))',
          animation:'scan-line 2s ease-in-out infinite',
        }}/>
      </div>
    </div>
  );
}
