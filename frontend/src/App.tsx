import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { CodeView } from './components/CodeView';
import { WelcomeScreen } from './components/WelcomeScreen';
import './index.css';

// Vista activa de la aplicacion
type AppView = 'welcome' | 'editor';

import { ASTProvider } from './context/ASTContext';

function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [codePanelWidth, setCodePanelWidth] = useState(380);

  if (view === 'welcome') {
    return <WelcomeScreen onStart={() => setView('editor')} />;
  }

  return (
    <ASTProvider>
      <div className="layout-container">
        <Sidebar />

        <main className="main-content">
          <header className="toolbar">
            <span className="toolbar-title">CheemScript Editor</span>
            <button 
              className="toolbar-btn"
              onClick={() => setIsCodeVisible(prev => !prev)}
            >
              {isCodeVisible ? 'Ocultar Código C++' : 'Mostrar Código C++'}
            </button>
            {isCodeVisible && (
              <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                <button 
                  className="toolbar-btn"
                  onClick={() => setCodePanelWidth(w => Math.max(280, w - 50))}
                  title="Reducir panel"
                >
                  - Ancho
                </button>
                <button 
                  className="toolbar-btn"
                  onClick={() => setCodePanelWidth(w => Math.min(800, w + 50))}
                  title="Aumentar panel"
                >
                  + Ancho
                </button>
              </div>
            )}
          </header>

          <div className="workspace">
            <Canvas />

            {isCodeVisible && (
              <aside className="code-panel" style={{ width: `${codePanelWidth}px`, minWidth: `${codePanelWidth}px` }}>
                <div className="code-header">Codigo C++</div>
                <CodeView />
              </aside>
            )}
          </div>

          <div className="console-panel">
            <span className="console-prompt">&gt;</span>
            Listo para compilar...
          </div>
        </main>
      </div>
    </ASTProvider>
  );
}

export default App;
