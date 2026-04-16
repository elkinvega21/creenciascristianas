import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Target, Lightbulb, CheckCircle } from 'lucide-react';

const PracticalApplication = () => {
    const apps = [
        {
            title: "Consuelo en el Duelo",
            icon: <Heart className="text-primary" />,
            steps: [
                "Entender que la separación es temporal para los redimidos.",
                "Consolar a otros con la esperanza de la resurrección corporal.",
                "Enfocar el luto no en la pérdida, sino en el reencuentro futuro."
            ]
        },
        {
            title: "Vivir con Propósito Eterno",
            icon: <Target className="text-gold" />,
            steps: [
                "Invertir en tesoros que trascienden la muerte.",
                "Valorar el cuerpo como templo que será glorificado.",
                "Redimir el tiempo sabiendo que nuestras obras nos siguen."
            ]
        },
        {
            title: "Testimonio y Servicio",
            icon: <Users className="text-accent" />,
            steps: [
                "Compartir la esperanza con quienes temen a la muerte.",
                "Servir al prójimo sabiendo que el dolor tiene un fin definitivo.",
                "Vivir con valentía ante la persecución o la enfermedad."
            ]
        }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
            <div className="glass card" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <Lightbulb size={40} className="text-gold" style={{ marginBottom: '1rem' }} />
                <h2 className="gradient-text" style={{ fontSize: '2.5rem' }}>Aplicación Práctica</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                    ¿Cómo transforma esta doctrina nuestra vida cotidiana? De la teoría al corazón.
                </p>
            </div>

            <div className="grid">
                {apps.map((item, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="glass card"
                        style={{ padding: '2.5rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)' }}>
                                {item.icon}
                            </div>
                            <h3 style={{ margin: 0 }}>{item.title}</h3>
                        </div>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            {item.steps.map((step, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                    <CheckCircle size={18} className="text-primary" style={{ marginTop: '4px', flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '1rem', opacity: 0.85 }}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass card" style={{ marginTop: '3rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Compromiso Personal</h3>
                <p style={{ textAlign: 'center', fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.8 }}>
                    "Por tanto, amados hermanos míos, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano." - 1 Cor 15:58
                </p>
            </div>
        </motion.div>
    );
};

export default PracticalApplication;
