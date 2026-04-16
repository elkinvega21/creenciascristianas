import React from 'react';
import { motion } from 'framer-motion';
import { Quote, BookOpen, Anchor, Sun, ArrowRight, ShieldCheck, Crown } from 'lucide-react';

const ContentSection = () => {
    const sections = [
        {
            title: "El Fundamento de la Fe",
            icon: <Anchor className="text-primary" size={24} />,
            content: "La victoria de Cristo sobre la muerte no es solo un evento histórico, sino la primicia de nuestra propia transformación. En el cristianismo, la muerte se redefine no como un final, sino como un 'sueño' transitorio para aquellos que están en Cristo.",
            scripture: "1 Corintios 15:20 - 'Mas ahora Cristo ha resucitado de los muertos; primicias de los que durmieron es hecho.'"
        },
        {
            title: "El Cuerpo Glorificado",
            icon: <Sun className="text-gold" size={24} />,
            content: "La resurrección implica una continuidad de la identidad pero una transformación de la sustancia. Pasamos de lo corruptible a lo incorruptible, de la debilidad al poder. No seremos espíritus incorpóreos, sino seres con cuerpos renovados.",
            scripture: "1 Corintios 15:42-44 - 'Se siembra en corrupción, resucitará en incorrupción... se siembra cuerpo animal, resucitará cuerpo espiritual.'"
        },
        {
            title: "Venciendo el Temor",
            icon: <ShieldCheck className="text-accent" size={24} />,
            content: "La doctrina de la resurrección quita el aguijón a la muerte. Ya no es una sombra de terror, sino el umbral a la gloria. El creyente puede enfrentar el fin de la vida terrenal con la misma paz que Cristo mostró al Padre.",
            scripture: "Hebreos 2:14-15 - '...para destruir por medio de la muerte al que tenía el imperio de la muerte... y librar a todos los que por el temor de la muerte estaban durante toda la vida sujetos a servidumbre.'"
        },
        {
            title: "La Esperanza del Reino",
            icon: <Crown className="text-gold" size={24} />,
            content: "Nuestra resurrección es el preámbulo a la restauración de todas las cosas. No es solo una salvación individual, sino cósmica. Seremos parte de un cielo nuevo y una tierra nueva donde la justicia mora.",
            scripture: "Apocalipsis 21:4 - 'Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor.'"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
        >
            <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <Quote size={40} className="gradient-text" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h2 className="gradient-text" style={{ fontSize: '2.5rem' }}>Profundidad Doctrinal: Esperanza Eterna</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
                    Un análisis exhaustivo sobre la victoria final de la vida sobre la muerte, cimentado en las promesas inmutables de las Escrituras.
                </p>
            </div>

            <div className="grid">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="glass card"
                        style={{ padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            {section.icon}
                            <h3 style={{ margin: 0 }}>{section.title}</h3>
                        </div>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.05rem', color: 'var(--text-main)', opacity: 0.9 }}>
                            {section.content}
                        </p>
                        <div className="glass" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderLeft: '4px solid var(--gold)', borderRadius: '0.75rem' }}>
                            <p className="scripture-font" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--gold)' }}>
                                {section.scripture}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass card" style={{ marginTop: '2rem', borderTop: '2px solid var(--primary-glow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <BookOpen size={24} className="text-primary" />
                    <h3>Pilares Doctrinales para el Creyente</h3>
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[
                        "Cristo como Primicia: La garantía legal de nuestra propia resurrección.",
                        "Identidad Continua: El yo resucitado es el mismo yo terrenal, pero glorificado.",
                        "Victoria Total: La muerte es el último enemigo, y su derrota es definitiva.",
                        "Transformación Radical: Del cuerpo de humillación al cuerpo de la gloria de Su poder."
                    ].map((point, i) => (
                        <div key={i} className="glass" style={{ display: 'flex', alignItems: 'start', gap: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.03)' }}>
                            <ArrowRight size={20} className="text-primary" style={{ marginTop: '4px', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.95rem' }}>{point}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ContentSection;
