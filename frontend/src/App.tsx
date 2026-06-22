import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { CodeView } from './components/CodeView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Toolbar } from './components/Toolbar';
import { Console } from './components/Console';
import { CheemsMascot } from './components/CheemsMascot';
import './index.css';

// Vista activa de la aplicacion
type AppView = 'welcome' | 'editor';

import { ASTProvider } from './context/ASTContext';

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [view, setView] = useState<AppView>(() => {
    return window.location.hash === '#editor' ? 'editor' : 'welcome';
  });
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [codePanelWidth, setCodePanelWidth] = useState(380);
  const [rightPanelTab, setRightPanelTab] = useState<'stage' | 'code'>('stage');

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === '#editor' ? 'editor' : 'welcome');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let interval: number;
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/health`);
        if (res.ok) {
          setIsBackendReady(true);
          clearInterval(interval);
        }
      } catch (e) {
        // Silently retry
      }
    };

    checkHealth();
    interval = window.setInterval(checkHealth, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    window.location.hash = 'editor';
    setView('editor');
  };

  if (!isBackendReady) {
    return (
      <div className="global-loader-container">
        <div className="global-loader-content">
          <div className="loader-spinner"></div>
          <h2>Despertando al servidor Cheems...</h2>
          <p>Preparando servicios. Esto puede tardar unos segundos si el backend estaba en reposo.</p>
        </div>
      </div>
    );
  }

  if (view === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <ASTProvider>
      <div className="layout-container">
        <Sidebar />

        <main className="main-content">
          <Toolbar 
            isCodeVisible={isCodeVisible} 
            setIsCodeVisible={setIsCodeVisible} 
            setCodePanelWidth={setCodePanelWidth}
            setRightPanelTab={setRightPanelTab}
          />

          <div className="workspace">
            <Canvas />

            {isCodeVisible && (
              <aside className="code-panel" style={{ width: `${codePanelWidth}px`, minWidth: `${codePanelWidth}px`, display: 'flex', flexDirection: 'column' }}>
                <div className="code-panel-tabs">
                  <button 
                    className={`code-panel-tab ${rightPanelTab === 'stage' ? 'active' : ''}`}
                    onClick={() => setRightPanelTab('stage')}
                  >
                    Escenario
                  </button>
                  <button 
                    className={`code-panel-tab ${rightPanelTab === 'code' ? 'active' : ''}`}
                    onClick={() => setRightPanelTab('code')}
                  >
                    Código C++
                  </button>
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  {rightPanelTab === 'stage' ? (
                    <CheemsMascot />
                  ) : (
                    <CodeView />
                  )}
                </div>
              </aside>
            )}
          </div>

          <Console />
        </main>
      </div>
    </ASTProvider>
  );
}

export default App;
