import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuiz } from '../services/openai';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

const AIChatQuiz = () => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const startQuiz = async () => {
        setLoading(true);
        try {
            const data = await generateQuiz("La Muerte y la Resurrección", "Puntos clave: Victoria sobre la muerte, cuerpo glorificado, 1 Cor 15, esperanza cristiana.");
            setQuiz(data.questions);
            setCurrentQuestion(0);
            setScore(0);
            setShowResult(false);
        } catch (error) {
            console.error("Error generating quiz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option) => {
        setSelectedAnswer(option);
        if (option === quiz[currentQuestion].answer) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestion + 1 < quiz.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    return (
        <div className="glass card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="gradient-text">Cuestionario con IA</h2>
                <button onClick={startQuiz} className="btn-primary" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />} Generar Nuevo
                </button>
            </div>

            {!quiz && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Haz clic para generar un cuestionario personalizado sobre el tema.</p>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
                    <p style={{ marginTop: '1rem' }}>La IA está preparando tus preguntas...</p>
                </div>
            )}

            {quiz && !showResult && !loading && (
                <motion.div
                    key={currentQuestion}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="question-card"
                >
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Pregunta {currentQuestion + 1} de {quiz.length}
                    </p>
                    <h3>{quiz[currentQuestion].question}</h3>

                    <div style={{ marginTop: '1.5rem' }}>
                        {quiz[currentQuestion].options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                disabled={selectedAnswer !== null}
                                className={`option-btn ${selectedAnswer === opt ? 'selected' : ''}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderColor: selectedAnswer === opt ? (opt === quiz[currentQuestion].answer ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                {opt}
                                {selectedAnswer === opt && (
                                    opt === quiz[currentQuestion].answer ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {showResult && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', padding: '2rem' }}
                >
                    <GraduationCap size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <h2>¡Completado!</h2>
                    <p style={{ fontSize: '1.5rem' }}>Tu puntuación: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{score} / {quiz.length}</span></p>
                    <button onClick={startQuiz} className="btn-primary" style={{ marginTop: '2rem' }}>Intentar de nuevo</button>
                </motion.div>
            )}
        </div>
    );
};

export default AIChatQuiz;
