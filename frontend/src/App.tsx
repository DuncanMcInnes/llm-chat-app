import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Documents } from './components/Documents';

type Tab = 'chat' | 'documents';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="app-root">
      <div className="app-tabs">
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents
        </button>
      </div>
      <div className="app-content">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'documents' && <Documents />}
      </div>
    </div>
  );
}

export default App


