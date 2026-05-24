import React, { useState } from 'react';
import { generateExamFromDocument } from '../services/openai';
import { parseInput } from '../services/fileParser';
import { Upload, CheckCircle, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentExamModule = () => {
  const [text, setText] = useState('');
  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [file, setFile] = useState(null);

  const handleStartExam = async () => {
    if (!text.trim() && !file) return;
    setLoadingExam(true);
    try {
      const parsedText = await parseInput(text, file);
      const result = await generateExamFromDocument(parsedText, 5);
      setExam(result.questions);
      setCurrentQuestion(0);
      setScore(0);
      setShowResults(false);
      setShowExplanation(false);
      setSelectedOption(null);
    } catch (error) {
      console.error("Error generating exam", error);
      alert(error.message);
    } finally {
      setLoadingExam(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showExplanation) return; // Prevent clicking again
    setSelectedOption(option);
    setShowExplanation(true);
    
    if (option === exam[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < exam.length) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
      <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 className="gradient-text">Examen desde Documento</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sube un documento y la IA generará un examen evaluativo basándose estrictamente en el contenido proporcionado.</p>
      </div>

      {!exam && !loadingExam && (
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
            onClick={handleStartExam}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!text && !file}
          >
            <Play size={20} /> Generar Examen
          </button>
        </div>
      )}

      {loadingExam && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 className="animate-spin text-primary" size={60} style={{ margin: '0 auto 2rem' }} />
          <h3>Analizando documento y creando preguntas...</h3>
        </div>
      )}

      {exam && !showResults && (
         <div className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-muted)' }}>
             <span>Pregunta {currentQuestion + 1} de {exam.length}</span>
             <span>Puntaje: {score}</span>
           </div>
           
           <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', lineHeight: '1.4' }}>
             {exam[currentQuestion].question}
           </h3>

           <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
             {exam[currentQuestion].options.map((opt, i) => {
               let bgColor = 'rgba(255,255,255,0.05)';
               if (showExplanation) {
                 if (opt === exam[currentQuestion].answer) bgColor = 'rgba(34, 197, 94, 0.2)'; // Green
                 else if (opt === selectedOption) bgColor = 'rgba(239, 68, 68, 0.2)'; // Red
               }

               return (
                 <button
                   key={i}
                   onClick={() => handleAnswerSelect(opt)}
                   className="btn-nav"
                   style={{ padding: '1.5rem', textAlign: 'left', width: '100%', justifyContent: 'flex-start', background: bgColor }}
                 >
                   {opt}
                 </button>
               );
             })}
           </div>

           <AnimatePresence>
             {showExplanation && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                 <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                   <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Explicación:</h4>
                   <p style={{ color: 'var(--text-muted)', margin: 0 }}>{exam[currentQuestion].explanation}</p>
                 </div>
                 <button onClick={handleNextQuestion} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                   {currentQuestion + 1 < exam.length ? 'Siguiente Pregunta' : 'Ver Resultados'}
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
      )}

      {showResults && (
        <div className="glass card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <CheckCircle size={80} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
          <h2 className="gradient-text">¡Examen Completado!</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Acertaste {score} de {exam.length} preguntas basándote en el documento.</p>
          <button onClick={() => { setExam(null); setText(''); }} className="btn-primary" style={{ margin: '0 auto' }}>
            Analizar Otro Documento
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DocumentExamModule;
