import React, { useState } from 'react';
import { analyzeDocument } from '../services/openai';
import { Upload, FileText, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentAnalyzer = () => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const result = await analyzeDocument(text);
            setAnalysis(result);
        } catch (error) {
            console.error("Error analyzing document", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
            <div className="glass card" style={{ marginBottom: '2rem' }}>
                <h2 className="gradient-text">Analizador de Documentos</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Pega el texto de tus notas o documentos de estudio para recibir un análisis profundo y preguntas de reflexión.
                </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <section>
                    <textarea
                        className="input-field glass"
                        style={{ height: '400px', resize: 'none', padding: '1.5rem', marginBottom: '1.5rem', border: 'none' }}
                        placeholder="Pega aquí el contenido de tu documento..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button
                        onClick={handleAnalyze}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading || !text}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        {loading ? 'Generando Análisis...' : 'Analizar con IA'}
                    </button>
                </section>

                <section className="glass" style={{ padding: '2rem', minHeight: '400px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <FileText size={20} />
                        <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resultado del Análisis</h4>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}
                            >
                                <Loader2 className="animate-spin text-primary" size={40} />
                                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>La IA está procesando el contenido bíblico...</p>
                            </motion.div>
                        ) : analysis ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: '1.8' }}
                            >
                                {analysis}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '6rem' }}
                            >
                                <Upload size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                <p style={{ fontSize: '1.1rem' }}>Sube tu texto para comenzar el análisis.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </motion.div>
    );
};

export default DocumentAnalyzer;
