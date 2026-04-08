import React, { useState } from 'react';
import { Book, GraduationCap, FileText, Zap } from 'lucide-react';
import ContentSection from './components/ContentSection';
import AIChatQuiz from './components/AIChatQuiz';
import DocumentAnalyzer from './components/DocumentAnalyzer';

function App() {
  const [activeTab, setActiveTab] = useState('study');

  return (
    <div className="container">
      <header style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
          Módulo Didáctico: Fe y Esperanza
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Estudio Profundo: 26. La Muerte y la Resurrección
        </p>
      </header>

      <nav className="glass" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('study')}
          className={`btn-nav ${activeTab === 'study' ? 'active' : ''}`}
        >
          <Book size={20} /> Estudio
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`btn-nav ${activeTab === 'quiz' ? 'active' : ''}`}
        >
          <Zap size={20} /> Cuestionario IA
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`btn-nav ${activeTab === 'docs' ? 'active' : ''}`}
        >
          <FileText size={20} /> Analizar Documento
        </button>
      </nav>

      <main>
        {activeTab === 'study' && <ContentSection />}
        {activeTab === 'quiz' && <AIChatQuiz />}
        {activeTab === 'docs' && <DocumentAnalyzer />}
      </main>

      <style>{`
        .btn-nav {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.3s;
        }
        .btn-nav:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        .btn-nav.active {
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}

export default App;
