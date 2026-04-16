import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuiz } from '../services/openai';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Info, Trophy } from 'lucide-react';

const AIChatQuiz = () => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const startQuiz = async () => {
        setLoading(true);
        try {
            const data = await generateQuiz("La Muerte y la Resurrección", "Victoria sobre la muerte, cuerpo glorificado, 1 Corintios 15, esperanza cristiana, estado intermedio.");
            setQuiz(data.questions);
            setCurrentQuestion(0);
            setScore(0);
            setShowResult(false);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } catch (error) {
            console.error("Error generating quiz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option) => {
        setSelectedAnswer(option);
        setShowExplanation(true);
        if (option === quiz[currentQuestion].answer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion + 1 < quiz.length) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setShowResult(true);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="glass card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1.5rem 2.5rem' }}>
                <h2 className="gradient-text" style={{ margin: 0 }}>Desafío Teológico</h2>
                <button onClick={startQuiz} className="btn-primary" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                    {quiz ? 'Reiniciar' : 'Empezar Estudio'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {!quiz && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="glass card" style={{ textAlign: 'center', padding: '4rem' }}
                    >
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Pon a prueba tus conocimientos sobre la Muerte y la Resurrección con un cuestionario generado por IA.</p>
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="glass card" style={{ textAlign: 'center', padding: '4rem' }}
                    >
                        <Loader2 className="animate-spin" size={48} className="text-primary" style={{ margin: '0 auto 1.5rem' }} />
                        <h3>Preparando Cuestionario</h3>
                        <p style={{ color: 'var(--text-muted)' }}>La IA está redactando preguntas profundas basándose en las Escrituras...</p>
                    </motion.div>
                )}

                {quiz && !showResult && !loading && (
                    <motion.div
                        key={currentQuestion}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="glass card"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Pregunta {currentQuestion + 1} / {quiz.length}
                            </span>
                            <div className="glass" style={{ padding: '0.2rem 1rem', borderRadius: '1rem', fontSize: '0.9rem' }}>
                                Aciertos: {score}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', lineHeight: '1.4', marginBottom: '2rem' }}>{quiz[currentQuestion].question}</h3>

                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {quiz[currentQuestion].options.map((opt, i) => {
                                const isCorrect = opt === quiz[currentQuestion].answer;
                                const isSelected = selectedAnswer === opt;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        disabled={selectedAnswer !== null}
                                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                                        style={{
                                            borderLeft: isSelected ? `4px solid ${isCorrect ? 'var(--accent)' : '#ef4444'}` : '1px solid var(--glass-border)'
                                        }}
                                    >
                                        <span>{opt}</span>
                                        {isSelected && (
                                            isCorrect ? <CheckCircle2 size={20} color="var(--accent)" /> : <XCircle size={20} color="#ef4444" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {showExplanation && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                                            <Info size={18} />
                                            <strong style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Explicación Bíblica</strong>
                                        </div>
                                        <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>{quiz[currentQuestion].explanation}</p>

                                        <button
                                            onClick={nextQuestion}
                                            className="btn-primary"
                                            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
                                        >
                                            {currentQuestion + 1 === quiz.length ? 'Ver Resultados' : 'Siguiente Pregunta'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {showResult && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass card"
                        style={{ textAlign: 'center', padding: '4rem' }}
                    >
                        <Trophy size={64} className="gradient-text" style={{ marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>¡Estudio Completado!</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Has demostrado un gran interés en profundizar en las promesas del Señor.
                        </p>

                        <div className="glass" style={{ padding: '2rem', display: 'inline-block', minWidth: '200px', marginBottom: '2.5rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>PUNTUACIÓN FINAL</div>
                            <div style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>{score}<span style={{ opacity: 0.3, fontSize: '1.5rem' }}>/{quiz.length}</span></div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={startQuiz} className="btn-primary">
                                <RefreshCw size={20} /> Intentar de Nuevo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChatQuiz;
