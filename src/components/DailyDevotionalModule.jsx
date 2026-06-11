import React, { useState } from 'react';
import { Calendar, Sun, Heart, BookOpen, PenTool, CheckSquare, CloudRain, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyDevotionalModule = () => {
  const [reflections, setReflections] = useState({
    examen: '',
    intercesion: '',
    oracion: ''
  });

  const [tasks, setTasks] = useState({
    task1: false,
    task2: false,
    task3: false
  });

  const handleReflectionChange = (key, value) => {
    setReflections(prev => ({ ...prev, [key]: value }));
  };

  const handleTaskToggle = (key) => {
    setTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
      {/* HEADER PRINCIPAL */}
      <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '4rem 2rem' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', opacity: 0.05, color: 'var(--primary)' }}>
          <CloudRain size={300} />
        </div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          <Calendar size={16} /> Devocional Profundo: Día 11
        </div>
        
        <h2 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
          La Lluvia Tardía y el Sellamiento
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Un estudio inmersivo sobre nuestra preparación para los eventos finales. No es momento de ser espectadores; es el momento de ser vasijas listas para ser llenadas por el Espíritu Santo.
        </p>
      </div>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* SECCIÓN 1: FUNDAMENTO BÍBLICO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="glass card" 
          style={{ marginBottom: '2rem', padding: '3rem' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.6rem' }}>
            <BookOpen size={28} /> 1. El Fundamento Profético
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem', color: 'var(--text)' }}>
            Para comprender nuestro papel en el tiempo del fin, debemos ir a las promesas del Antiguo y Nuevo Testamento. Dios no enviará a su pueblo a la prueba final sin antes equiparlo con un poder celestial sin precedentes.
          </p>
          <blockquote style={{ 
            borderLeft: '4px solid var(--primary)', 
            paddingLeft: '1.5rem', 
            fontStyle: 'italic', 
            fontSize: '1.3rem', 
            color: 'var(--text)',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.6',
            background: 'rgba(255,255,255,0.03)',
            padding: '2rem'
          }}>
            "Vosotros también, hijos de Sion, alegraos y gozaos en Jehová vuestro Dios; porque os ha dado la primera lluvia a su tiempo, y hará descender sobre vosotros lluvia temprana y tardía como al principio."
            <footer style={{ fontSize: '1rem', color: 'var(--primary)', marginTop: '1rem', fontWeight: 'bold', fontStyle: 'normal' }}>— Joel 2:23</footer>
          </blockquote>
        </motion.div>

        {/* SECCIÓN 2: ESPÍRITU DE PROFECÍA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass card" 
          style={{ marginBottom: '2rem', padding: '3rem' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.6rem' }}>
            <Flame size={28} /> 2. La Voz de la Inspiración
          </h3>
          <div style={{ color: 'var(--text)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              En la experiencia agrícola de Israel, la <strong>lluvia temprana</strong> hacía germinar la semilla, mientras que la <strong>lluvia tardía</strong> maduraba el fruto para la cosecha. Espiritualmente, la lluvia temprana representa la obra de conversión diaria, mientras que la lluvia tardía es el derramamiento final del Espíritu para dar el fuerte clamor.
            </p>
            <p style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <em>"Vi que muchos descuidaban la preparación tan necesaria y esperaban el tiempo del 'refrigerio' y la 'lluvia tardía' para que los preparara para estar en pie en el día del Señor y vivir en su presencia. ¡Oh, cuántos vi en el tiempo de angustia sin refugio! Habían descuidado la preparación necesaria..."</em> 
              <br /><strong style={{ color: 'var(--primary)', display: 'block', marginTop: '0.5rem' }}>(Elena G. de White, Primeros Escritos, p. 71).</strong>
            </p>
            <p>
              El error más grande del adventista moderno es esperar pasivamente. El Espíritu Santo no caerá sobre recipientes sucios o llenos del mundo. Debe haber un vaciamiento del yo HOY.
            </p>
          </div>
        </motion.div>

        {/* SECCIÓN 3: INTERACCIÓN - EXAMEN DE CONCIENCIA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="glass card" 
          style={{ marginBottom: '2rem', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.6rem' }}>
            <Heart size={28} /> 3. Examen de Conciencia
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Para recibir la lluvia tardía, primero debemos estar sellados. El sello de Dios solo se coloca en aquellos que suspiran y claman por las abominaciones. Piensa honestamente: ¿Qué ídolo en tu vida te impide vaciarte del "yo" para que el Espíritu Santo entre? Escríbelo y confiésalo aquí.
          </p>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'var(--primary)' }}>
              <PenTool size={20} />
            </div>
            <textarea
              className="input-field glass"
              placeholder="Sé honesto contigo mismo y con Dios. Escribe aquí tus pensamientos..."
              value={reflections.examen}
              onChange={(e) => handleReflectionChange('examen', e.target.value)}
              style={{ width: '100%', minHeight: '120px', padding: '1rem 1rem 1rem 3rem', borderRadius: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}
            />
          </div>
        </motion.div>

        {/* SECCIÓN 4: DESAFÍOS PRÁCTICOS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="glass card" 
          style={{ marginBottom: '2rem', padding: '3rem', background: 'rgba(255, 255, 255, 0.02)' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.6rem' }}>
            <ShieldCheck size={28} /> 4. Tu Misión Práctica de Hoy
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            La preparación no es solo mental; es acción. Te desafiamos a cumplir estas 3 misiones el día de hoy. Marca las casillas a medida que las vayas cumpliendo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 'task1', text: 'Pedir perdón a alguien con quien tuve un conflicto recientemente, limpiando así el templo de mi corazón.' },
              { id: 'task2', text: 'Dedicar 15 minutos exactos y sin distracciones (cronometrados) para orar exclusivamente pidiendo el Espíritu Santo.' },
              { id: 'task3', text: 'Compartir un versículo de esperanza (como Apocalipsis 21:4) por WhatsApp a un amigo que no conoce la verdad.' }
            ].map(task => (
              <div 
                key={task.id}
                onClick={() => handleTaskToggle(task.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1.5rem', 
                  background: tasks[task.id] ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(0,0,0,0.2)', 
                  border: `1px solid ${tasks[task.id] ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ color: tasks[task.id] ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {tasks[task.id] ? <CheckSquare size={24} /> : <div style={{ width: 24, height: 24, border: '2px solid var(--text-muted)', borderRadius: '4px' }} />}
                </div>
                <span style={{ fontSize: '1.1rem', color: tasks[task.id] ? 'var(--text)' : 'var(--text-muted)', textDecoration: tasks[task.id] ? 'line-through' : 'none' }}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SECCIÓN 5: ORACIÓN FINAL DE SELLAMIENTO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="glass card" 
          style={{ padding: '3rem', border: '1px dashed var(--primary)' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.6rem' }}>
            <Sun size={28} /> 5. Tu Oración de Sellamiento
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Escribe una oración solemne pidiendo que la Lluvia Temprana haga su obra en ti hoy, para que estés listo para recibir la Lluvia Tardía mañana. Escribirlo te ayudará a materializar tu compromiso.
          </p>
          
          <textarea
            className="input-field glass"
            placeholder="Padre Celestial, reconozco mi necesidad de tu Espíritu..."
            value={reflections.oracion}
            onChange={(e) => handleReflectionChange('oracion', e.target.value)}
            style={{ width: '100%', minHeight: '180px', padding: '1.5rem', borderRadius: '1rem', fontSize: '1.1rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.3)' }}
          />

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
              Completar y Sellar Devocional de Hoy <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default DailyDevotionalModule;
