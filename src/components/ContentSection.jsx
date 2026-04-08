import React from 'react';
import { motion } from 'framer-motion';

const ContentSection = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass card"
        >
            <h2 className="gradient-text">26. La muerte y la resurrección</h2>

            <section style={{ marginBottom: '2rem' }}>
                <h3>Visión General</h3>
                <p>
                    La muerte no es el final del camino para el creyente, sino una transición. La doctrina cristiana
                    nos enseña que, aunque el cuerpo físico descansa, la promesa de la resurrección es el pilar de nuestra fe.
                </p>
            </section>

            <div className="grid">
                <div className="glass card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h4 style={{ color: 'var(--accent)' }}>El Estado Intermedio</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Qué sucede con el alma entre la muerte y la resurrección final. Un tiempo de descanso y comunión
                        con el Creador.
                    </p>
                </div>
                <div className="glass card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h4 style={{ color: 'var(--accent)' }}>La Resurrección de los Muertos</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        El evento glorioso donde los cuerpos serán transformados. Corintios 15:52 nos recuerda:
                        "en un abrir y cerrar de ojos... seremos transformados".
                    </p>
                </div>
            </div >

            <section style={{ marginTop: '2rem' }}>
                <h3>Puntos Clave para el Estudio</h3>
                <ul>
                    <li>La victoria de Cristo sobre la muerte como primicia.</li>
                    <li>La naturaleza del cuerpo resucitado (glorificado).</li>
                    <li>El juicio final y la vida eterna en la Nueva Jerusalén.</li>
                </ul>
            </section>
        </motion.div >
    );
};

export default ContentSection;
