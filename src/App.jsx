import React, { useState } from 'react';
import { Book, GraduationCap, FileText, Zap, MessageSquare, ExternalLink, Library, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentSection from './components/ContentSection';
import AIChatQuiz from './components/AIChatQuiz';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import InteractiveReflection from './components/InteractiveReflection';
import PracticalApplication from './components/PracticalApplication';

function App() {
  const [activeTab, setActiveTab] = useState('study');

  const tabs = [
    { id: 'study', label: 'Estudio', icon: <Book size={18} /> },
    { id: 'quiz', label: 'Desafío IA', icon: <Zap size={18} /> },
    { id: 'reflection', label: 'Reflexión', icon: <MessageSquare size={18} /> },
    { id: 'application', label: 'Aplicación', icon: <Target size={18} /> },
    { id: 'docs', label: 'Analizar', icon: <FileText size={18} /> },
    { id: 'resources', label: 'Recursos', icon: <Library size={18} /> },
  ];

  return (
    <div className="container" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <header style={{ textAlign: 'center', padding: '5rem 0 3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'inline-block' }}>
            INGENIERÍA BÍBLICA
          </span>
          <h1 className="gradient-text" style={{ fontSize: '4.5rem', marginBottom: '0.5rem', lineHeight: '1.1' }}>
            Fe y Esperanza
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '1rem auto' }}>
            Explorando la doctrina de la Muerte y la Resurrección a través de la lente de la eternidad.
          </p>
        </motion.div>
      </header>

      <nav className="glass" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        marginBottom: '3rem',
        position: 'sticky',
        top: '1rem',
        zIndex: 100,
        maxWidth: 'fit-content',
        margin: '0 auto 3rem'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-nav ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'study' && (
            <motion.div key="study" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ContentSection />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <AIChatQuiz />
            </motion.div>
          )}
          {activeTab === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <InteractiveReflection />
            </motion.div>
          )}
          {activeTab === 'application' && (
            <motion.div key="application" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <PracticalApplication />
            </motion.div>
          )}
          {activeTab === 'docs' && (
            <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DocumentAnalyzer />
            </motion.div>
          )}
          {activeTab === 'resources' && (
            <motion.div key="resources" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass card">
                <h3>Recursos para Profundizar</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Bibliotecas y herramientas externas recomendadas para tu crecimiento espiritual.</p>
                <div className="grid">
                  {[
                    { name: 'BibleGateway', desc: 'Múltiples versiones y herramientas de estudio.', url: 'https://www.biblegateway.com' },
                    { name: 'Blue Letter Bible', desc: 'Léxico hebreo/griego y comentarios.', url: 'https://www.blueletterbible.org' },
                    { name: 'BibleProject', desc: 'Recursos visuales sobre temas bíblicos.', url: 'https://bibleproject.com' }
                  ].map((res, i) => (
                    <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="glass card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>{res.name}</h4>
                        <ExternalLink size={16} />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{res.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
