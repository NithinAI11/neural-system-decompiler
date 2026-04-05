import React, { useState, useEffect } from 'react';
import { GLOBAL_CSS }     from './styles/globalCss';
import Sidebar            from './components/Sidebar';
import ChatPanel          from './components/ChatPanel';
import LoadingTerminal    from './components/LoadingTerminal';
import DashboardPage      from './pages/DashboardPage';
import TopologyPage       from './pages/TopologyPage';
import PhantomPage        from './pages/PhantomPage';
import SettingsPage       from './pages/SettingsPage';
import { Icon, ICONS }   from './components/Icon';

export default function App() {
  const [activePage,       setActivePage]       = useState('dashboard');
  const [systemData,       setSystemData]       = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [externalQuery,    setExternalQuery]    = useState(null);

  /* persisted theme + accent ------------------------------------------------ */
  const [themeMode, setThemeModeRaw] = useState(
    () => localStorage.getItem('nsd-theme') || 'dark'
  );
  const [accent, setAccentRaw] = useState(
    () => localStorage.getItem('nsd-accent') || 'cyan'
  );

  const setThemeMode = (v) => {
    setThemeModeRaw(v);
    localStorage.setItem('nsd-theme', v);
  };
  const setAccent = (v) => {
    setAccentRaw(v);
    localStorage.setItem('nsd-accent', v);
  };

  /* apply to <html> so CSS variable selectors work everywhere --------------- */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme',  themeMode);
    document.documentElement.setAttribute('data-accent', accent);
  }, [themeMode, accent]);

  /* global data bridge ------------------------------------------------------ */
  useEffect(() => {
    window.__nsdSetData = (data) => { setSystemData(data); setActivePage('dashboard'); };
    return () => { delete window.__nsdSetData; };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage systemData={systemData}/>;
      case 'topology':  return (
        <TopologyPage
          systemData={systemData}
          highlightedNodes={highlightedNodes}
          onQuery={q => setExternalQuery(q)}
        />
      );
      case 'phantom':   return <PhantomPage  systemData={systemData}/>;
      case 'settings':  return <SettingsPage/>;
      default:          return <DashboardPage systemData={systemData}/>;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div
        className="scanlines"
        style={{display:'flex',height:'100vh',width:'100vw',overflow:'hidden',position:'relative',background:'var(--bg-void)',color:'var(--text-primary)',transition:'background 0.3s,color 0.3s'}}
      >
        <Sidebar
          activePage={activePage}    setActivePage={setActivePage}
          systemData={systemData}
          themeMode={themeMode}      setThemeMode={setThemeMode}
          accent={accent}            setAccent={setAccent}
        />

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

          {/* breadcrumb bar */}
          <div style={{
            height:42, flexShrink:0, display:'flex', alignItems:'center', paddingInline:18,
            borderBottom:'1px solid var(--border-dim)',
            background:'var(--bg-panel)', backdropFilter:'blur(10px)', gap:14, zIndex:10,
          }}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-muted)',letterSpacing:'0.06em'}}>NSD://</span>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--ac)',letterSpacing:'0.06em'}}>{activePage.toUpperCase()}</span>
            {systemData && (
              <>
                <span style={{color:'var(--border-mid)',fontSize:10}}>·</span>
                <span className="tag tag-emerald" style={{fontSize:8}}>{systemData.intelligence.macro_architecture?.pattern||'ANALYZED'}</span>
                <span className="tag tag-cyan"    style={{fontSize:8}}>{Object.keys(systemData.fused_graph?.nodes||{}).length} NODES</span>
                {(systemData.intelligence.dead_code?.length||0) > 0 && (
                  <span className="tag tag-rose" style={{fontSize:8}}>{systemData.intelligence.dead_code.length} PHANTOM</span>
                )}
              </>
            )}
            <div style={{flex:1}}/>
            <div style={{display:'flex',gap:5}}>
              {['dashboard','topology','phantom'].map(page => (
                <button key={page}
                  className={`topo-tab ${activePage===page?'active':''}`}
                  style={{padding:'4px 9px',fontSize:9}}
                  onClick={() => setActivePage(page)}>
                  {page}
                </button>
              ))}
            </div>
          </div>

          {/* page + chat */}
          <div style={{flex:1,display:'flex',overflow:'hidden'}}>
            <div style={{flex:1,overflow:'hidden',position:'relative'}}>{renderPage()}</div>
            <ChatPanel
              systemData={systemData}
              externalQuery={externalQuery}
              onExternalQueryUsed={() => setExternalQuery(null)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
