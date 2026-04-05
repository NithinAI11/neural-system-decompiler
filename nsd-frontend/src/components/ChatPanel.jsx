import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Icon, ICONS } from './Icon';

const QUICK = [
  'List all phantom/dead files.',
  'Which module has the highest risk?',
  'Explain the macro architecture.',
  'Find circular dependencies.',
];

export default function ChatPanel({ systemData, externalQuery, onExternalQueryUsed }) {
  const [query, setQuery]     = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    if (externalQuery) { handleQuery(externalQuery); onExternalQueryUsed?.(); }
  }, [externalQuery]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatLog]);

  const handleQuery = async (forced = null) => {
    const msg = forced || query;
    if (!msg) return;
    setChatLog(p => [...p, { role:'user', content:msg }]);
    setQuery(''); setIsQuerying(true);
    try {
      const res = await axios.post('http://localhost:8000/api/v1/query', { question:msg });
      const data = res.data.response;
      setChatLog(p => [...p, { role:'ai', content:data?.answer || data }]);
    } catch (err) {
      setChatLog(p => [...p, { role:'ai', content:`⚠ ${err.response?.data?.detail || err.message}` }]);
    }
    setIsQuerying(false);
  };

  return (
    <div style={{width:400,flexShrink:0,display:'flex',flexDirection:'column',background:'var(--bg-panel)',borderLeft:'1px solid var(--border-dim)',height:'100%'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border-dim)',flexShrink:0,display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'var(--accent-cyan)'}} className="pulse-dot"/>
        <span style={{fontFamily:'var(--font-display)',fontSize:11,letterSpacing:'0.15em',color:'var(--text-primary)'}}>AGENTIC CONSOLE</span>
        <div style={{flex:1}}/>
        <span className="tag tag-cyan" style={{fontSize:8}}>RAG + WEB + GRAPH</span>
      </div>

      <div className="scroll-y" style={{flex:1,padding:'16px 14px',display:'flex',flexDirection:'column',gap:12,overflowY:'auto'}}>
        {chatLog.length === 0 && systemData && (
          <div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',letterSpacing:'0.1em',marginBottom:12}}>QUICK PROMPTS</div>
            {QUICK.map(p => (
              <button key={p} onClick={() => handleQuery(p)} style={{
                display:'block',width:'100%',textAlign:'left',marginBottom:8,
                background:'rgba(0,200,255,0.03)',border:'1px solid var(--border-dim)',
                borderRadius:6,padding:'8px 12px',cursor:'pointer',
                fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)',transition:'all 0.2s',
              }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='var(--border-mid)';e.currentTarget.style.color='var(--text-primary)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border-dim)';e.currentTarget.style.color='var(--text-secondary)';}}>
                › {p}
              </button>
            ))}
          </div>
        )}
        {chatLog.map((msg, i) => (
          <div key={i} className={msg.role==='user'?'chat-bubble-user':'chat-bubble-ai'}>
            {msg.role === 'ai' ? (
              <div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--accent-cyan)',letterSpacing:'0.08em',marginBottom:6}}>NSD AGENT</div>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'rgba(0,200,255,0.6)',letterSpacing:'0.08em',marginBottom:4}}>YOU</div>
                <div style={{fontFamily:'var(--font-body)',fontSize:12}}>{msg.content}</div>
              </div>
            )}
          </div>
        ))}
        {isQuerying && (
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px'}}>
            {[0,1,2].map(d => (
              <div key={d} style={{width:5,height:5,borderRadius:'50%',background:'var(--accent-cyan)',animation:`pulse-dot 1.2s ease-in-out ${d*0.2}s infinite`}}/>
            ))}
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-muted)'}}>Agent reasoning...</span>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:'12px 14px',borderTop:'1px solid var(--border-dim)',flexShrink:0,display:'flex',gap:8}}>
        <input
          className="neon-input"
          placeholder={systemData ? 'Instruct the agent...' : 'Load a system first...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={e => e.key==='Enter' && !isQuerying && handleQuery()}
          disabled={!systemData || isQuerying}
        />
        <button className="btn-neon" style={{padding:'10px 14px',flexShrink:0}}
          onClick={() => handleQuery()} disabled={!systemData||isQuerying||!query}>
          <Icon d={ICONS.send} size={14}/>
        </button>
      </div>
    </div>
  );
}
