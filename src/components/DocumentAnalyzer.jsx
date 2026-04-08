import React, { useState } from 'react';
import { analyzeDocument } from '../services/openai';
import { Upload, FileText, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="glass card">
            <h2 className="gradient-text">Analizador de Documentos AI</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Pega el texto de tus notas o documentos de estudio para recibir un análisis profundo y preguntas de reflexión.
            </p>

            <div className="grid">
                <div>
                    <textarea
                        className="input-field"
                        style={{ height: '300px', resize: 'none', padding: '1rem' }}
                        placeholder="Pega aquí el contenido de tu documento..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button
                        onClick={handleAnalyze}
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                        disabled={loading || !text}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} Analizar con IA
                    </button>
                </div>

                <div className="glass" style={{ padding: '1.5rem', minHeight: '350px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <FileText size={20} />
                        <h4 style={{ margin: 0 }}>Resultado del Análisis</h4>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Loader2 className="animate-spin" size={32} />
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Procesando docuemento...</p>
                        </div>
                    ) : analysis ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}
                        >
                            {analysis}
                        </motion.div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                            <Upload size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>Todavía no hay análisis. Sube tu texto para comenzar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentAnalyzer;
