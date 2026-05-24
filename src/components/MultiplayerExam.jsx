import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { generateExamFromDocument } from '../services/openai';
import { parseInput } from '../services/fileParser';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, Trophy, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MultiplayerExam = () => {
  const [mode, setMode] = useState('menu'); // menu, host, player
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [examData, setExamData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roomStatus, setRoomStatus] = useState('waiting'); // waiting, playing, finished
  const [loading, setLoading] = useState(false);
  
  // Host state
  const [hostText, setHostText] = useState('');
  const [hostFile, setHostFile] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(5);

  // Player state
  const [playerId, setPlayerId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);

  // Generar código aleatorio
  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // Escuchar cambios en la sala (para ambos)
  useEffect(() => {
    if (!roomId) return;

    const roomSubscription = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'exam_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoomStatus(payload.new.status);
        if (payload.new.status === 'playing' && mode === 'player') {
          // Iniciar temporizador
          const durationSecs = payload.new.duration_minutes * 60;
          setTimeRemaining(durationSecs);
        }
      })
      .subscribe();

    const playersSubscription = supabase
      .channel(`players_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_players', filter: `room_id=eq.${roomId}` }, () => {
        fetchPlayers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playersSubscription);
    };
  }, [roomId, mode]);

  // Temporizador del jugador
  useEffect(() => {
    if (roomStatus === 'playing' && mode === 'player' && timeRemaining > 0 && !hasFinished) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && roomStatus === 'playing' && mode === 'player' && !hasFinished) {
      finishPlayerExam();
    }
  }, [timeRemaining, roomStatus, mode, hasFinished]);

  const fetchPlayers = async () => {
    if (!roomId) return;
    const { data } = await supabase.from('exam_players').select('*').eq('room_id', roomId).order('score', { ascending: false }).order('time_taken_seconds', { ascending: true });
    if (data) setPlayers(data);
  };

  // --- HOST ACTIONS ---
  const handleCreateRoom = async () => {
    if (!hostText.trim() && !hostFile) return;
    setLoading(true);
    try {
      // 1. Parsear texto
      const parsedText = await parseInput(hostText, hostFile);
      // 2. Generar el examen con IA
      const result = await generateExamFromDocument(parsedText, 5);
      const newCode = generateCode();
      
      // 2. Crear la sala en Supabase
      const { data, error } = await supabase.from('exam_rooms').insert([
        { room_code: newCode, exam_data: result.questions, duration_minutes: durationMinutes }
      ]).select().single();

      if (error) throw error;

      setRoomId(data.id);
      setRoomCode(newCode);
      setExamData(result.questions);
      setMode('host');
      fetchPlayers();
    } catch (error) {
      console.error("Error al crear sala:", error);
      alert("Error al crear la sala. ¿Ejecutaste el script SQL en Supabase?");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    await supabase.from('exam_rooms').update({ status: 'playing', started_at: new Date().toISOString() }).eq('id', roomId);
    setRoomStatus('playing');
  };

  const handleEndExamHost = async () => {
    await supabase.from('exam_rooms').update({ status: 'finished' }).eq('id', roomId);
    setRoomStatus('finished');
  };

  // --- PLAYER ACTIONS ---
  const handleJoinRoom = async () => {
    if (!joinCode || !playerName) return;
    setLoading(true);
    try {
      // 1. Buscar la sala
      const { data: room, error: roomError } = await supabase.from('exam_rooms').select('*').eq('room_code', joinCode.toUpperCase()).single();
      if (roomError || !room) throw new Error("Sala no encontrada");

      // 2. Unirse
      const { data: player, error: playerError } = await supabase.from('exam_players').insert([
        { room_id: room.id, player_name: playerName }
      ]).select().single();

      if (playerError) throw playerError;

      setRoomId(room.id);
      setExamData(room.exam_data);
      setPlayerId(player.id);
      setRoomStatus(room.status);
      setMode('player');
    } catch (error) {
      console.error("Error al unirse:", error);
      alert("Código de sala inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (hasFinished) return;
    const isCorrect = option === examData[currentQuestion].answer;
    if (isCorrect) setScore(prev => prev + 1);

    if (currentQuestion + 1 < examData.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishPlayerExam(isCorrect ? score + 1 : score);
    }
  };

  const finishPlayerExam = async (finalScore = score) => {
    setHasFinished(true);
    const timeTaken = (examData.length * 60) - timeRemaining; // Estimación simple
    await supabase.from('exam_players').update({
      score: finalScore * 100 - timeTaken, // Fórmula simple de puntaje
      correct_answers: finalScore,
      time_taken_seconds: timeTaken > 0 ? timeTaken : 0,
      finished: true
    }).eq('id', playerId);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
      <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 className="gradient-text">Examen Multijugador (En Vivo)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Crea una sala competitiva, comparte el código e inicia el examen en tiempo real.</p>
      </div>

      {/* MENU PRINCIPAL */}
      {mode === 'menu' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Unirse */}
          <div className="glass card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users /> Unirse a una Sala
            </h3>
            <input
              className="input-field glass"
              placeholder="Tu Nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <input
              className="input-field glass"
              placeholder="Código de la Sala (Ej. A1B2C3)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{ width: '100%', marginBottom: '1.5rem', textTransform: 'uppercase' }}
            />
            <button onClick={handleJoinRoom} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || !playerName || !joinCode}>
              {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />} Unirse Ahora
            </button>
          </div>

          {/* Crear (Host) */}
          <div className="glass card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy /> Crear Nueva Sala
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Pega texto o un enlace de YouTube</label>
                <textarea
                  className="input-field glass"
                  style={{ height: '80px', resize: 'none', padding: '1rem', border: 'none', width: '100%' }}
                  placeholder="Texto o URL de YouTube..."
                  value={hostText}
                  onChange={(e) => setHostText(e.target.value)}
                />
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>— O —</div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Sube un archivo PDF</label>
                <div style={{ background: 'var(--bg-color)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => setHostFile(e.target.files[0])}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Duración (minutos)</label>
              <input
                type="number"
                min="1"
                max="60"
                className="input-field glass"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <button onClick={handleCreateRoom} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || (!hostText && !hostFile)}>
              {loading ? <Loader2 className="animate-spin" /> : 'Generar Sala y Examen'}
            </button>
          </div>
        </div>
      )}

      {/* VISTA DEL HOST */}
      {mode === 'host' && (
        <div className="glass card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>Código de Sala: <span style={{ fontSize: '2rem', letterSpacing: '0.1em' }}>{roomCode}</span></h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Los jugadores deben ingresar este código para unirse.</p>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '1rem' }}>
               <QRCodeSVG value={`${window.location.origin}/?room=${roomCode}`} size={120} />
            </div>
          </div>

          {roomStatus === 'waiting' && (
            <>
              <h4 style={{ marginBottom: '1rem' }}>Jugadores Conectados ({players.length}):</h4>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {players.map(p => (
                  <div key={p.id} className="glass" style={{ padding: '1rem', textAlign: 'center', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                    {p.player_name}
                  </div>
                ))}
              </div>
              <button onClick={handleStartExam} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={players.length === 0}>
                <Play /> Iniciar Examen para Todos
              </button>
            </>
          )}

          {roomStatus === 'playing' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Loader2 className="animate-spin text-primary" size={60} style={{ margin: '0 auto 1.5rem' }} />
              <h2>Examen en Curso...</h2>
              <p>Los jugadores están respondiendo.</p>
              <button onClick={handleEndExamHost} className="btn-primary" style={{ marginTop: '2rem', background: 'var(--accent)' }}>
                Finalizar Examen Forzosamente
              </button>
            </div>
          )}

          {roomStatus === 'finished' && (
            <div>
              <h3 className="gradient-text" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>🏆 Tabla de Posiciones 🏆</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {players.map((p, index) => (
                  <div key={p.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '1rem', background: index === 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>#{index + 1}</span>
                      <span style={{ fontSize: '1.25rem' }}>{p.player_name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.correct_answers} / {examData.length} correctas</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.score} puntos</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setMode('menu')} className="btn-primary" style={{ marginTop: '2rem', width: '100%', justifyContent: 'center' }}>Volver al Menú</button>
            </div>
          )}
        </div>
      )}

      {/* VISTA DEL JUGADOR */}
      {mode === 'player' && (
        <div className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {roomStatus === 'waiting' && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Loader2 className="animate-spin text-primary" size={60} style={{ margin: '0 auto 1.5rem' }} />
              <h2>Esperando al Anfitrión...</h2>
              <p>El examen comenzará pronto.</p>
            </div>
          )}

          {roomStatus === 'playing' && !hasFinished && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                <span>Pregunta {currentQuestion + 1} de {examData.length}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: timeRemaining < 60 ? 'var(--accent)' : 'inherit' }}>
                  <Clock /> {formatTime(timeRemaining)}
                </span>
              </div>
              
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', lineHeight: '1.4' }}>
                {examData[currentQuestion].question}
              </h3>

              <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
                {examData[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(opt)}
                    className="btn-nav"
                    style={{ padding: '1.5rem', textAlign: 'left', width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.05)' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}

          {(hasFinished || roomStatus === 'finished') && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
               <CheckCircle size={80} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
               <h2 className="gradient-text">¡Examen Terminado!</h2>
               <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Espera a que el anfitrión muestre los resultados finales en la pantalla principal.</p>
               <button onClick={() => setMode('menu')} className="btn-primary" style={{ margin: '0 auto' }}>
                 Salir
               </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MultiplayerExam;
