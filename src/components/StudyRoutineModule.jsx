import React, { useState } from 'react';
import { generateStudyRoutine, generateExamFromDocument } from '../services/openai';
import { parseInput } from '../services/fileParser';
import { Upload, BookOpen, CheckCircle, Clock, Sparkles, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudyRoutineModule = () => {
  const [text, setText] = useState('');
  const [routine, setRoutine] = useState(null);
  const [exam, setExam] = useState(null);
  const [loadingRoutine, setLoadingRoutine] = useState(false);
  const [loadingExam, setLoadingExam] = useState(false);
  const [currentExamQuestion, setCurrentExamQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [file, setFile] = useState(null);

  const handleGenerateRoutine = async () => {
    if (!text.trim() && !file) return;
    setLoadingRoutine(true);
    try {
      const parsedText = await parseInput(text, file);
      const result = await generateStudyRoutine(parsedText);
      setRoutine(result);
    } catch (error) {
      console.error("Error generating routine", error);
      alert(error.message);
    } finally {
      setLoadingRoutine(false);
    }
  };

  const handleStartExam = async () => {
    setLoadingExam(true);
    try {
      const result = await generateExamFromDocument(text, 5);
      setExam(result.questions);
      setCurrentExamQuestion(0);
      setScore(0);
      setShowResults(false);
    } catch (error) {
      console.error("Error generating exam", error);
    } finally {
      setLoadingExam(false);
    }
  };

  const handleAnswerSelect = (option) => {
    const isCorrect = option === exam[currentExamQuestion].answer;
    if (isCorrect) setScore(score + 1);
    
    if (currentExamQuestion + 1 < exam.length) {
      setCurrentExamQuestion(currentExamQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
      <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 className="gradient-text">Rutina de Estudio Inteligente</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sube tu estudio bíblico. La IA te creará un plan de estudio estructurado y un examen al final.</p>
      </div>

      {!routine && !exam && (
        <div className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Pega texto o un enlace de YouTube</label>
              <textarea
                className="input-field glass"
                style={{ height: '200px', resize: 'none', padding: '1.5rem', border: 'none', width: '100%' }}
                placeholder="Texto o URL de YouTube..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>O sube un archivo PDF</label>
              <div style={{ background: 'var(--bg-color)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '2rem', textAlign: 'center', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Upload size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerateRoutine}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loadingRoutine || (!text && !file)}
          >
            {loadingRoutine ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loadingRoutine ? 'Generando Rutina Mágica...' : 'Generar Rutina de Estudio'}
          </button>
        </div>
      )}

      {routine && !exam && !loadingExam && (
        <div className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '0.5rem' }}>{routine.routineName}</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>{routine.summary}</p>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
            {routine.steps.map((step, index) => (
              <div key={index} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  {step.step}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{step.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>{step.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                    <Clock size={16} /> {step.durationMinutes} min
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleStartExam} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Play size={20} /> Empezar Examen Final
          </button>
        </div>
      )}

      {loadingExam && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 className="animate-spin text-primary" size={60} style={{ margin: '0 auto 2rem' }} />
          <h3>Preparando tu examen final...</h3>
        </div>
      )}

      {exam && !showResults && (
         <div className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-muted)' }}>
             <span>Pregunta {currentExamQuestion + 1} de {exam.length}</span>
             <span>Puntaje: {score}</span>
           </div>
           
           <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', lineHeight: '1.4' }}>
             {exam[currentExamQuestion].question}
           </h3>

           <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
             {exam[currentExamQuestion].options.map((opt, i) => (
               <button
                 key={i}
                 onClick={() => handleAnswerSelect(opt)}
                 className="btn-nav"
                 style={{ padding: '1.5rem', textAlign: 'left', width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.05)' }}
               >
                 {opt}
               </button>
             ))}
           </div>
         </div>
      )}

      {showResults && (
        <div className="glass card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <CheckCircle size={80} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
          <h2 className="gradient-text">¡Examen Finalizado!</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Acertaste {score} de {exam.length} preguntas.</p>
          <button onClick={() => { setRoutine(null); setExam(null); setText(''); }} className="btn-primary" style={{ margin: '0 auto' }}>
            Estudiar Otro Tema
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default StudyRoutineModule;
