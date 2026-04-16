import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeDocument } from '../services/openai'; // Reusing this for reflection
import { MessageSquare, Sparkles, Send, Loader2, BookOpen } from 'lucide-react';

const InteractiveReflection = () => {
    const [thought, setThought] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!thought.trim()) return;

        setLoading(true);
        try {
            // We'll repurpose the analyzeDocument or create a new prompt for reflection feedback
            const feedback = await analyzeDocument(`Reflexión del usuario sobre Muerte y Resurrección: ${thought}. Proporciona consuelo, base bíblica y una pregunta para profundizar.`);
            setResponse(feedback);
        } catch (error) {
            console.error("Error in reflection", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
        >
            <div className="glass card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <MessageSquare size={24} className="text-primary" />
                    <h3>Tu Espacio de Reflexión</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Escribe lo que has aprendido hoy o tus inquietudes sobre la resurrección. La IA te acompañará con una perspectiva bíblica.
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="input-field"
                        placeholder="Comparte tus pensamientos aquí..."
                        style={{ minHeight: '150px', resize: 'vertical', marginBottom: '1rem' }}
                        value={thought}
                        onChange={(e) => setThought(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || !thought.trim()}>
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        {loading ? 'Buscando en las Escrituras...' : 'Recibir Guía Bíblica'}
                    </button>
                </form>

                <AnimatePresence>
                    {response && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="glass" style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                    <BookOpen size={20} />
                                    <strong>Respuesta de la IA</strong>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                    {response}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default InteractiveReflection;
