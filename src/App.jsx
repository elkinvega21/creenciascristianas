import React, { useState } from 'react';
import { Book, GraduationCap, FileText, Zap, MessageSquare, ExternalLink, Library, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudyRoutineModule from './components/StudyRoutineModule';
import DocumentExamModule from './components/DocumentExamModule';
import MultiplayerExam from './components/MultiplayerExam';

function App() {
  const [activeTab, setActiveTab] = useState('study_routine');

  const tabs = [
    { id: 'study_routine', label: 'Rutina IA', icon: <Book size={18} /> },
    { id: 'document_exam', label: 'Examen Doc', icon: <FileText size={18} /> },
    { id: 'multiplayer', label: 'Sala en Vivo', icon: <Users size={18} /> }
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
          {activeTab === 'study_routine' && (
            <motion.div key="study_routine" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StudyRoutineModule />
            </motion.div>
          )}
          {activeTab === 'document_exam' && (
            <motion.div key="document_exam" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DocumentExamModule />
            </motion.div>
          )}
          {activeTab === 'multiplayer' && (
            <motion.div key="multiplayer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MultiplayerExam />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
