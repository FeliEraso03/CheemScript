import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { CodeView } from './components/CodeView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Toolbar } from './components/Toolbar';
import { Console } from './components/Console';
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
          <Toolbar 
            isCodeVisible={isCodeVisible} 
            setIsCodeVisible={setIsCodeVisible} 
            setCodePanelWidth={setCodePanelWidth} 
          />

          <div className="workspace">
            <Canvas />

            {isCodeVisible && (
              <aside className="code-panel" style={{ width: `${codePanelWidth}px`, minWidth: `${codePanelWidth}px` }}>
                <div className="code-header">Codigo C++</div>
                <CodeView />
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
