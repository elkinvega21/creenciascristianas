import React, { useState } from 'react';
import { generateInversoLesson } from '../services/openai';
import { BookOpen, Sparkles, Loader2, ArrowRight, PlayCircle, ExternalLink, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

const InversoLessonModule = () => {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState({});

  const handleJournalChange = (sectionIndex, text) => {
    setJournalEntries(prev => ({
      ...prev,
      [sectionIndex]: text
    }));
  };

  const handleGenerateLesson = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const result = await generateInversoLesson(topic);
      setLesson(result);
    } catch (error) {
      console.error("Error generating lesson", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSectionIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'introduce': return '📖';
      case 'explora': return '🔍';
      case 'investiga': return '📚';
      case 'evalúa': return '⚖️';
      case 'aplica': return '🌱';
      case 'crea': return '🎨';
      default: return '✨';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
      <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 className="gradient-text">Lección Inverso</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Explora un tema desde la perspectiva de la Escuela Sabática Inverso para jóvenes adultos.
          Ingresa un tema bíblico y la IA generará una guía completa.
        </p>
      </div>

      {!lesson && (
        <div className="glass card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tema de Estudio Bíblico</label>
            <input
              type="text"
              className="input-field glass"
              style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem' }}
              placeholder="Ej. El Santuario, El Sábado, La Gracia..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateLesson()}
            />
          </div>
          
          <button
            onClick={handleGenerateLesson}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
            disabled={loading || !topic.trim()}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Generando Lección...' : 'Generar Guía de Estudio'}
          </button>
        </div>
      )}

      {loading && !lesson && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 className="animate-spin text-primary" size={60} style={{ margin: '0 auto 2rem' }} />
          <h3>Sintetizando conocimientos teológicos...</h3>
        </div>
      )}

      {lesson && !loading && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{lesson.title}</h2>
            <button 
              onClick={() => setLesson(null)} 
              className="btn-nav" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
            >
              <ArrowRight style={{ transform: 'rotate(180deg)' }} size={16} /> Estudiar otro tema
            </button>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {lesson.sections && lesson.sections.map((section, index) => (
              <motion.div 
                key={index} 
                className="glass card" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }}
                style={{ padding: '2rem' }}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getSectionIcon(section.name)}</span>
                  {section.name}
                </h3>
                <div style={{ color: 'var(--text)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '2rem' }}>
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} style={{ marginBottom: '1.25rem' }}>{paragraph}</p>
                  ))}
                </div>

                {section.reflectionQuestion && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                      <PenTool size={18} /> Diario de Reflexión
                    </h4>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {section.reflectionQuestion}
                    </p>
                    <textarea
                      className="input-field glass"
                      placeholder="Escribe aquí tu respuesta, oración o pensamiento..."
                      style={{ 
                        width: '100%', 
                        minHeight: '120px', 
                        padding: '1rem', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '0.5rem',
                        resize: 'vertical',
                        fontSize: '1rem',
                        lineHeight: '1.5'
                      }}
                      value={journalEntries[index] || ''}
                      onChange={(e) => handleJournalChange(index, e.target.value)}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {lesson.recommendedVideos && lesson.recommendedVideos.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.8 }}
              className="glass card" 
              style={{ marginTop: '2rem', padding: '2rem', border: '1px solid var(--primary)' }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.5rem' }}>
                <PlayCircle size={28} color="#FF0000" /> Material Complementario Recomendado
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Profundiza aún más en este tema buscando estos videos en YouTube:
              </p>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {lesson.recommendedVideos.map((video, index) => (
                  <a 
                    key={index} 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass"
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '1rem', 
                      display: 'block', 
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      background: 'rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <h4 style={{ color: 'var(--text)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ lineHeight: '1.3' }}>{video.title}</span> 
                      <ExternalLink size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                      Sugerencia: <strong style={{ color: 'var(--primary)' }}>{video.channel}</strong>
                    </p>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default InversoLessonModule;
