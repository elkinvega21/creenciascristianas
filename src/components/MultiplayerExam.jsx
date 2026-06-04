import React, { useState, useEffect, useRef } from 'react';
import supabase from '../services/supabase';
import { generateExamFromDocument } from '../services/openai';
import { parseInput } from '../services/fileParser';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, Trophy, Clock, CheckCircle, Loader2, Award, ArrowRight, Sparkles, User, AlertCircle, XCircle } from 'lucide-react';
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
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [questionCount, setQuestionCount] = useState(5);
  
  // Host Kahoot states
  const [hostPhase, setHostPhase] = useState('waiting'); // waiting, question, leaderboard, finished
  const [answeredPlayers, setAnsweredPlayers] = useState([]);
  const [hostTimeRemaining, setHostTimeRemaining] = useState(20);

  // Player state
  const [playerId, setPlayerId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);

  // Player Kahoot states
  const [playerPhase, setPlayerPhase] = useState('waiting'); // waiting, question, feedback, leaderboard, finished
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(20);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  // Ref para mantener los estados actualizados en los callbacks del canal de broadcast
  const stateRef = useRef({
    mode,
    roomStatus,
    currentQuestion,
    hostPhase,
    answeredPlayers,
    roomId,
    playerId,
    playerName,
    examData,
    score,
    correctAnswers,
    totalTimeTaken
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      roomStatus,
      currentQuestion,
      hostPhase,
      answeredPlayers,
      roomId,
      playerId,
      playerName,
      examData,
      score,
      correctAnswers,
      totalTimeTaken
    };
  }, [mode, roomStatus, currentQuestion, hostPhase, answeredPlayers, roomId, playerId, playerName, examData, score, correctAnswers, totalTimeTaken]);

  // Generar código aleatorio
  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // Restaurar sesión de sessionStorage al montar
  useEffect(() => {
    const savedRoomId = sessionStorage.getItem('mp_room_id');
    const savedRoomCode = sessionStorage.getItem('mp_room_code');
    const savedPlayerId = sessionStorage.getItem('mp_player_id');
    const savedPlayerName = sessionStorage.getItem('mp_player_name');
    const savedMode = sessionStorage.getItem('mp_mode');
    const savedExamData = sessionStorage.getItem('mp_exam_data');
    const savedRoomStatus = sessionStorage.getItem('mp_room_status');
    const savedScore = sessionStorage.getItem('mp_player_score');
    const savedCorrectAnswers = sessionStorage.getItem('mp_player_correct');

    if (savedRoomId && savedMode) {
      setRoomId(savedRoomId);
      setMode(savedMode);
      if (savedRoomCode) setRoomCode(savedRoomCode);
      if (savedPlayerId) setPlayerId(savedPlayerId);
      if (savedPlayerName) setPlayerName(savedPlayerName);
      if (savedRoomStatus) {
        setRoomStatus(savedRoomStatus);
        if (savedMode === 'host') {
          if (savedRoomStatus === 'playing') setHostPhase('question');
          if (savedRoomStatus === 'finished') setHostPhase('finished');
        } else if (savedMode === 'player') {
          if (savedRoomStatus === 'playing') setPlayerPhase('question');
          if (savedRoomStatus === 'finished') setPlayerPhase('finished');
        }
      }
      if (savedScore) setScore(parseInt(savedScore));
      if (savedCorrectAnswers) setCorrectAnswers(parseInt(savedCorrectAnswers));
      if (savedExamData) {
        try {
          const parsed = JSON.parse(savedExamData);
          setExamData(parsed);
        } catch (e) {
          console.error("Error cargando examData:", e);
        }
      }
      fetchPlayersDirect(savedRoomId);
    }
  }, []);

  // Guardar sesión helper
  const saveSession = (data) => {
    if (data.roomId) sessionStorage.setItem('mp_room_id', data.roomId);
    if (data.roomCode) sessionStorage.setItem('mp_room_code', data.roomCode);
    if (data.playerId) sessionStorage.setItem('mp_player_id', data.playerId);
    if (data.playerName) sessionStorage.setItem('mp_player_name', data.playerName);
    if (data.mode) sessionStorage.setItem('mp_mode', data.mode);
    if (data.examData) sessionStorage.setItem('mp_exam_data', JSON.stringify(data.examData));
    if (data.roomStatus) sessionStorage.setItem('mp_room_status', data.roomStatus);
  };

  // Limpiar sesión helper
  const clearSession = () => {
    sessionStorage.clear();
    setMode('menu');
    setRoomId(null);
    setRoomCode('');
    setJoinCode('');
    setPlayerName('');
    setPlayerId(null);
    setExamData(null);
    setPlayers([]);
    setRoomStatus('waiting');
    setHostPhase('waiting');
    setPlayerPhase('waiting');
    setAnsweredPlayers([]);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentQuestion(0);
    setHasFinished(false);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setPointsEarned(0);
    setTotalTimeTaken(0);
  };

  // Traer lista de jugadores directamente
  const fetchPlayersDirect = async (rId) => {
    if (!rId) return;
    const { data } = await supabase
      .from('exam_players')
      .select('*')
      .eq('room_id', rId)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true });
    if (data) setPlayers(data);
  };

  const fetchPlayers = async () => {
    if (!roomId) return;
    fetchPlayersDirect(roomId);
  };

  // Canal Realtime para mensajería instantánea y cambios en base de datos
  useEffect(() => {
    if (!roomId) return;

    // 1. Inicializar canal de Supabase Realtime
    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        broadcast: { ack: true }
      }
    });

    // 2. Escuchar cambios de la sala (Base de Datos)
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'exam_rooms', filter: `id=eq.${roomId}` }, (payload) => {
      const nextStatus = payload.new.status;
      setRoomStatus(nextStatus);
      sessionStorage.setItem('mp_room_status', nextStatus);
      
      if (nextStatus === 'finished') {
        if (stateRef.current.mode === 'player') {
          setPlayerPhase('finished');
        } else if (stateRef.current.mode === 'host') {
          setHostPhase('finished');
        }
      }
    });

    // 3. Escuchar cambios en jugadores (Base de Datos)
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'exam_players', filter: `room_id=eq.${roomId}` }, () => {
      fetchPlayers();
    });

    // 4. ESCUCHAR EVENTOS DE BROADCAST (TIEMPO REAL)
    
    // Iniciar juego para los jugadores
    channel.on('broadcast', { event: 'start_game' }, () => {
      if (stateRef.current.mode === 'player') {
        setCurrentQuestion(0);
        setSelectedOption(null);
        setIsAnswerCorrect(null);
        setPointsEarned(0);
        setPlayerPhase('question');
        setQuestionStartTime(Date.now());
        setQuestionTimeRemaining(20);
      }
    });

    // Host avanza a la siguiente pregunta
    channel.on('broadcast', { event: 'next_question' }, ({ payload }) => {
      if (stateRef.current.mode === 'player') {
        setCurrentQuestion(payload.index);
        setSelectedOption(null);
        setIsAnswerCorrect(null);
        setPointsEarned(0);
        setPlayerPhase('question');
        setQuestionStartTime(Date.now());
        setQuestionTimeRemaining(20);
      }
    });

    // Host muestra el leaderboard de la pregunta
    channel.on('broadcast', { event: 'show_leaderboard' }, () => {
      if (stateRef.current.mode === 'player') {
        // Si no ha respondido a tiempo, bloquear
        setPlayerPhase('leaderboard');
      }
    });

    // Host finaliza la sala
    channel.on('broadcast', { event: 'game_over' }, () => {
      if (stateRef.current.mode === 'player') {
        setPlayerPhase('finished');
      }
    });

    // Host recibe cuando un jugador responde en tiempo real
    channel.on('broadcast', { event: 'player_answered' }, ({ payload }) => {
      if (stateRef.current.mode === 'host') {
        setAnsweredPlayers(prev => {
          if (prev.some(p => p.playerId === payload.playerId)) return prev;
          return [...prev, payload];
        });
      }
    });

    // Sincronización para jugadores que se unen tarde o recargan la página
    channel.on('broadcast', { event: 'request_sync' }, () => {
      if (stateRef.current.mode === 'host') {
        channel.send({
          type: 'broadcast',
          event: 'sync_state',
          payload: {
            currentQuestion: stateRef.current.currentQuestion,
            hostPhase: stateRef.current.hostPhase,
            answeredCount: stateRef.current.answeredPlayers.length
          }
        });
      }
    });

    channel.on('broadcast', { event: 'sync_state' }, ({ payload }) => {
      if (stateRef.current.mode === 'player' && stateRef.current.roomStatus === 'playing') {
        setCurrentQuestion(payload.currentQuestion);
        if (payload.hostPhase === 'question') {
          setPlayerPhase(prev => {
            if (prev === 'feedback' || prev === 'leaderboard') return prev;
            return 'question';
          });
        } else if (payload.hostPhase === 'leaderboard') {
          setPlayerPhase('leaderboard');
        }
      }
    });

    // Suscribirse al canal
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("Supabase Realtime: Suscripción activa para sala", roomId);
        if (stateRef.current.mode === 'player' && stateRef.current.roomStatus === 'playing') {
          // Solicitar estado actual al host
          channel.send({
            type: 'broadcast',
            event: 'request_sync',
            payload: {}
          });
        }
      }
    });

    window.supabaseChannel = channel;

    return () => {
      supabase.removeChannel(channel);
      window.supabaseChannel = null;
    };
  }, [roomId, mode]);

  // --- TEMPORIZADOR DEL JUGADOR ---
  useEffect(() => {
    if (playerPhase === 'question' && questionTimeRemaining > 0 && !hasFinished) {
      const timer = setTimeout(() => setQuestionTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (questionTimeRemaining === 0 && playerPhase === 'question' && !hasFinished) {
      // El tiempo se acabó, enviar respuesta vacía / incorrecta automáticamente
      handleAnswerSelect(null);
    }
  }, [questionTimeRemaining, playerPhase, hasFinished]);

  // --- TEMPORIZADOR DEL HOST ---
  useEffect(() => {
    if (hostPhase === 'question' && hostTimeRemaining > 0 && roomStatus === 'playing') {
      const timer = setTimeout(() => setHostTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (hostTimeRemaining === 0 && hostPhase === 'question' && roomStatus === 'playing') {
      // Mostrar respuestas cuando se acaba el tiempo
      handleShowLeaderboard();
    }
  }, [hostTimeRemaining, hostPhase, roomStatus]);

  // --- ACCIONES DEL ANFITRIÓN (HOST) ---
  const handleCreateRoom = async () => {
    if (!hostText.trim() && !hostFile) return;
    setLoading(true);
    try {
      const parsedText = await parseInput(hostText, hostFile);
      const result = await generateExamFromDocument(parsedText, questionCount);
      const newCode = generateCode();
      
      const { data, error } = await supabase.from('exam_rooms').insert([
        { room_code: newCode, exam_data: result, duration_minutes: durationMinutes }
      ]).select().single();

      if (error) throw error;

      setRoomId(data.id);
      setRoomCode(newCode);
      setExamData(result);
      setMode('host');
      setHostPhase('waiting');
      setPlayers([]);

      saveSession({
        roomId: data.id,
        roomCode: newCode,
        mode: 'host',
        examData: result,
        roomStatus: 'waiting'
      });

      fetchPlayersDirect(data.id);
    } catch (error) {
      console.error("Error al crear sala:", error);
      alert("Error al crear la sala. Verifica la conexión a Internet o tu configuración SQL de Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (players.length === 0) return;
    setLoading(true);
    try {
      await supabase.from('exam_rooms').update({ status: 'playing', started_at: new Date().toISOString() }).eq('id', roomId);
      setRoomStatus('playing');
      setHostPhase('question');
      setAnsweredPlayers([]);
      setHostTimeRemaining(20);
      setCurrentQuestion(0);

      saveSession({ roomStatus: 'playing' });

      if (window.supabaseChannel) {
        window.supabaseChannel.send({
          type: 'broadcast',
          event: 'start_game',
          payload: {}
        });
      }
    } catch (e) {
      console.error("Error al iniciar el examen:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShowLeaderboard = () => {
    setHostPhase('leaderboard');
    if (window.supabaseChannel) {
      window.supabaseChannel.send({
        type: 'broadcast',
        event: 'show_leaderboard',
        payload: {}
      });
    }
    fetchPlayers();
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestion + 1;
    if (nextIndex < examData.questions.length) {
      setCurrentQuestion(nextIndex);
      setHostPhase('question');
      setAnsweredPlayers([]);
      setHostTimeRemaining(20);
      
      if (window.supabaseChannel) {
        window.supabaseChannel.send({
          type: 'broadcast',
          event: 'next_question',
          payload: { index: nextIndex }
        });
      }
    } else {
      handleEndExamHost();
    }
  };

  const handleEndExamHost = async () => {
    setLoading(true);
    try {
      await supabase.from('exam_rooms').update({ status: 'finished' }).eq('id', roomId);
      setRoomStatus('finished');
      setHostPhase('finished');
      saveSession({ roomStatus: 'finished' });

      if (window.supabaseChannel) {
        window.supabaseChannel.send({
          type: 'broadcast',
          event: 'game_over',
          payload: {}
        });
      }
      fetchPlayers();
    } catch (e) {
      console.error("Error al terminar examen:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES DEL JUGADOR (PLAYER) ---
  const handleJoinRoom = async () => {
    if (!joinCode || !playerName) return;
    setLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('exam_rooms')
        .select('*')
        .eq('room_code', joinCode.toUpperCase())
        .single();
        
      if (roomError || !room) throw new Error("Sala no encontrada");

      // Validar si el juego ya terminó
      if (room.status === 'finished') {
        alert("Esta sala ya ha finalizado.");
        setLoading(false);
        return;
      }

      // Crear registro de jugador en la base de datos
      const { data: player, error: playerError } = await supabase.from('exam_players').insert([
        { room_id: room.id, player_name: playerName, score: 0, correct_answers: 0, finished: false }
      ]).select().single();

      if (playerError) throw playerError;

      setRoomId(room.id);
      setRoomCode(room.room_code);
      setExamData(room.exam_data);
      setPlayerId(player.id);
      setRoomStatus(room.status);
      setMode('player');
      setPlayerPhase(room.status === 'playing' ? 'question' : 'waiting');

      saveSession({
        roomId: room.id,
        roomCode: room.room_code,
        playerId: player.id,
        playerName: playerName,
        mode: 'player',
        examData: room.exam_data,
        roomStatus: room.status
      });

      fetchPlayersDirect(room.id);
    } catch (error) {
      console.error("Error al unirse:", error);
      alert("Código de sala inválido o error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (option) => {
    if (playerPhase !== 'question') return;

    setSelectedOption(option);
    const questionObj = examData.questions[currentQuestion];
    const isCorrect = option === examData.answers[questionObj.id];
    setIsAnswerCorrect(isCorrect);

    // Calcular velocidad y puntos estilo Kahoot (Base 1000 + hasta 500 de velocidad)
    const elapsedSeconds = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 5;
    const roundedElapsed = parseFloat(elapsedSeconds.toFixed(2));
    let earned = 0;
    if (isCorrect && option !== null) {
      earned = Math.round(1000 + Math.max(0, 500 * (1 - roundedElapsed / 20)));
    }

    setPointsEarned(earned);
    const newScore = score + earned;
    const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    const newTime = totalTimeTaken + roundedElapsed;

    setScore(newScore);
    setCorrectAnswers(newCorrectAnswers);
    setTotalTimeTaken(newTime);

    // Guardar puntuación en sessionStorage para tolerar recargas
    sessionStorage.setItem('mp_player_score', newScore);
    sessionStorage.setItem('mp_player_correct', newCorrectAnswers);

    setPlayerPhase('feedback');

    // 1. Guardar en base de datos incrementalmente
    try {
      const isLastQuestion = currentQuestion + 1 === examData.questions.length;
      await supabase.from('exam_players').update({
        score: newScore,
        correct_answers: newCorrectAnswers,
        time_taken_seconds: Math.round(newTime),
        finished: isLastQuestion
      }).eq('id', playerId);
    } catch (e) {
      console.error("Error actualizando base de datos:", e);
    }

    // 2. Enviar Broadcast en tiempo real al Host
    if (window.supabaseChannel) {
      window.supabaseChannel.send({
        type: 'broadcast',
        event: 'player_answered',
        payload: {
          playerId,
          playerName,
          isCorrect,
          score: newScore,
          currentQuestion,
          selectedOption: option
        }
      });
    }
  };

  // Obtener posición del jugador en tiempo real
  const getPlayerRank = () => {
    if (!playerId || players.length === 0) return 1;
    const index = players.findIndex(p => p.id === playerId);
    return index !== -1 ? index + 1 : 1;
  };

  const getOptionLetter = (index) => {
    return ['A', 'B', 'C', 'D', 'E'][index] || '';
  };

  // --- VISTAS ESPECÍFICAS DE RENDER ---

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Botón de salir / reiniciar sesión (Siempre disponible si estás en una sala) */}
      {mode !== 'menu' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button 
            onClick={() => {
              if (window.confirm("¿Seguro que quieres salir de la sala en vivo? Perderás el progreso.")) {
                clearSession();
              }
            }} 
            className="btn-nav" 
            style={{ fontSize: '0.9rem', color: 'var(--danger)', background: 'rgba(255, 59, 48, 0.08)' }}
          >
            Salir de la Sala
          </button>
        </div>
      )}

      {/* HEADER GENERAL */}
      {mode === 'menu' && (
        <div className="glass card" style={{ marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Examen Multijugador en Vivo</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Sincronízate en tiempo real con otros estudiantes. El anfitrión controla las preguntas estilo Kahoot.</p>
        </div>
      )}

      {/* 1. MENU PRINCIPAL */}
      {mode === 'menu' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Unirse a Sala */}
          <div className="glass card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
                <Users size={24} /> Unirse a una Sala
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Ingresa tu nombre y el código de 6 caracteres que comparte el anfitrión en su pantalla principal.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Nombre del Jugador</label>
                  <input
                    className="input-field glass"
                    placeholder="Ej. Juan Pérez"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    style={{ width: '100%', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Código de la Sala</label>
                  <input
                    className="input-field glass"
                    placeholder="Código (Ej. A1B2C3)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleJoinRoom} 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '14px' }} 
              disabled={loading || !playerName || !joinCode}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />} Unirse y Jugar
            </button>
          </div>

          {/* Crear Sala (Host) */}
          <div className="glass card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
              <Trophy size={24} /> Crear Nueva Sala
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Texto de Estudio o Enlace de YouTube</label>
                <textarea
                  className="input-field glass"
                  style={{ height: '70px', resize: 'none', padding: '0.75rem', fontSize: '0.95rem', border: '1px solid var(--border-color)' }}
                  placeholder="Escribe el texto doctrinal, pasajes bíblicos o pega un enlace de YouTube..."
                  value={hostText}
                  onChange={(e) => setHostText(e.target.value)}
                />
              </div>
              
              <div style={{ position: 'relative', textAlign: 'center', margin: '0.2rem 0' }}>
                <span style={{ background: 'var(--card-bg)', padding: '0 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, position: 'relative', zIndex: 1 }}>Ó TAMBIÉN</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-color)', zIndex: 0 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sube un Archivo de Apoyo (PDF)</label>
                <div style={{ background: 'var(--bg-color)', border: '1.5px dashed var(--border-color)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => setHostFile(e.target.files[0])}
                    style={{ width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Segundos por Pregunta</label>
                  <select 
                    className="input-field glass" 
                    value={durationMinutes} 
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', border: '1px solid var(--border-color)', width: '100%' }}
                  >
                    <option value={10}>10 segundos (Rápido)</option>
                    <option value={20}>20 segundos (Estándar)</option>
                    <option value={30}>30 segundos (Medio)</option>
                    <option value={60}>60 segundos (Relajado)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Cantidad de Preguntas</label>
                  <select 
                    className="input-field glass" 
                    value={questionCount} 
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', border: '1px solid var(--border-color)', width: '100%' }}
                  >
                    <option value={3}>3 preguntas</option>
                    <option value={5}>5 preguntas</option>
                    <option value={10}>10 preguntas</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreateRoom} 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '14px' }} 
              disabled={loading || (!hostText && !hostFile)}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Crear Sala con Inteligencia Artificial
            </button>
          </div>

        </div>
      )}

      {/* 2. VISTA DEL HOST (ANFITRIÓN) */}
      {mode === 'host' && (
        <div className="glass card" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
          
          {/* A. Sala de Espera */}
          {hostPhase === 'waiting' && (
            <div style={{ textAlign: 'center' }}>
              <span className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-block', marginBottom: '1rem' }}>
                SALA DE ESPERA
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--primary)' }}>
                  {roomCode}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: 0 }}>
                  Escanea el código QR o entra a la app e ingresa el código anterior para unirte al juego en vivo.
                </p>
                
                <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <QRCodeSVG value={`${window.location.origin}/?room=${roomCode}`} size={160} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                  <Users size={20} /> Jugadores Conectados ({players.length})
                </h3>
                
                {players.length === 0 ? (
                  <div style={{ padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.01)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                    Esperando a que entren jugadores... ¡Comparte el código!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                    {players.map((p, idx) => (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        key={p.id} 
                        className="glass" 
                        style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <User size={16} style={{ color: 'var(--primary)' }} />
                        {p.player_name}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleStartExam} 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 600 }} 
                disabled={players.length === 0 || loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Play size={20} /> Empezar el Examen para Todos</>}
              </button>
            </div>
          )}

          {/* B. Pregunta en Curso */}
          {hostPhase === 'question' && examData && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>PREGUNTA MULTIJUGADOR</span>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Pregunta {currentQuestion + 1} de {examData.questions.length}</h3>
                </div>
                
                {/* Visualizador del Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIEMPO LÍMITE</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: hostTimeRemaining <= 5 ? 'var(--danger)' : 'var(--primary)' }}>
                      {hostTimeRemaining}s
                    </div>
                  </div>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: `3px solid ${hostTimeRemaining <= 5 ? 'var(--danger)' : 'var(--primary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: hostTimeRemaining <= 5 ? 'var(--danger)' : 'var(--primary)' }}>
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              {/* Texto de la pregunta */}
              <h2 style={{ fontSize: '2.25rem', textAlign: 'center', lineHeight: 1.3, marginBottom: '3rem', fontWeight: 700 }}>
                {examData.questions[currentQuestion].question}
              </h2>

              {/* Opciones (Bloqueadas para el Host) */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                {examData.questions[currentQuestion].options.map((opt, i) => (
                  <div 
                    key={i} 
                    className="glass" 
                    style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '1rem', opacity: 0.9 }}
                  >
                    <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                      {getOptionLetter(i)}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)' }}>{opt}</span>
                  </div>
                ))}
              </div>

              {/* Progreso de Respuestas */}
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1.05rem' }}>
                  <span>Respuestas Recibidas</span>
                  <span style={{ color: 'var(--primary)' }}>{answeredPlayers.length} de {players.length} jugadores</span>
                </div>
                
                {/* Barra de progreso */}
                <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(answeredPlayers.length / Math.max(1, players.length)) * 100}%` }}
                    style={{ height: '100%', background: 'var(--primary)' }}
                  />
                </div>

                {/* Lista de Jugadores e Indicadores */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {players.map(p => {
                    const hasAnswered = answeredPlayers.some(a => a.playerId === p.id);
                    return (
                      <div 
                        key={p.id} 
                        className="glass" 
                        style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: hasAnswered ? 'rgba(52, 199, 89, 0.08)' : 'rgba(0,0,0,0.02)', border: `1px solid ${hasAnswered ? 'var(--accent)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: hasAnswered ? 'var(--accent)' : 'var(--text-muted)' }}
                      >
                        <span>{hasAnswered ? '✅' : '💭'}</span>
                        <span>{p.player_name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleShowLeaderboard} 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem' }}
                >
                  Revelar Respuesta Correcta y Podio <ArrowRight size={20} />
                </button>
                
                <button 
                  onClick={handleEndExamHost} 
                  className="btn-primary" 
                  style={{ background: 'var(--danger)', justifyContent: 'center', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem' }}
                >
                  Terminar Examen
                </button>
              </div>

            </div>
          )}

          {/* C. Leaderboard Intermedio de la Pregunta */}
          {hostPhase === 'leaderboard' && examData && (
            <div>
              <span className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-block', marginBottom: '1rem' }}>
                RESULTADOS DE PREGUNTA {currentQuestion + 1}
              </span>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>
                {examData.questions[currentQuestion].question}
              </h2>

              {/* Opciones con Resultados del Gráfico */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                {examData.questions[currentQuestion].options.map((opt, i) => {
                  const isCorrectOpt = opt === examData.answers[examData.questions[currentQuestion].id];
                  // Contar cuántos jugadores eligieron esta opción
                  const voteCount = answeredPlayers.filter(a => a.selectedOption === opt).length;
                  const votePercent = answeredPlayers.length > 0 ? (voteCount / answeredPlayers.length) * 100 : 0;
                  
                  return (
                    <div 
                      key={i} 
                      className="glass" 
                      style={{ 
                        position: 'relative', 
                        padding: '1.25rem 1.5rem', 
                        borderRadius: '16px', 
                        border: `2px solid ${isCorrectOpt ? 'var(--accent)' : 'var(--border-color)'}`,
                        background: isCorrectOpt ? 'rgba(52, 199, 89, 0.04)' : 'var(--card-bg)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Relleno de porcentaje de votos */}
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${votePercent}%`, background: isCorrectOpt ? 'rgba(52, 199, 89, 0.12)' : 'rgba(0, 0, 0, 0.03)', zIndex: 0 }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ 
                            background: isCorrectOpt ? 'var(--accent)' : 'var(--text-muted)', 
                            color: 'white', 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold', 
                            fontSize: '0.9rem' 
                          }}>
                            {getOptionLetter(i)}
                          </span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: isCorrectOpt ? 'var(--accent)' : 'var(--text-main)' }}>
                            {opt}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold' }}>
                          {isCorrectOpt && <CheckCircle size={20} style={{ color: 'var(--accent)' }} />}
                          <span style={{ fontSize: '1.1rem', color: isCorrectOpt ? 'var(--accent)' : 'var(--text-muted)' }}>
                            {voteCount} ({Math.round(votePercent)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabla de Puntuaciones Acumuladas */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  <Award style={{ color: 'var(--primary)' }} /> Clasificación en Vivo
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {players.slice(0, 5).map((p, idx) => {
                    const isTopThree = idx < 3;
                    const medals = ['🥇', '🥈', '🥉'];
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={p.id} 
                        className="glass" 
                        style={{ 
                          padding: '1.25rem', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          borderRadius: '16px', 
                          background: isTopThree ? 'rgba(0, 113, 227, 0.03)' : 'var(--card-bg)',
                          border: isTopThree ? '1px solid rgba(0, 113, 227, 0.12)' : '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, width: '32px', textAlign: 'center', color: 'var(--primary)' }}>
                            {isTopThree ? medals[idx] : `#${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.player_name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.score} pts</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.correct_answers} correctas</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Siguiente Pregunta y Terminar Examen */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleNextQuestion} 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 600 }}
                >
                  {currentQuestion + 1 < examData.questions.length ? (
                    <>Siguiente Pregunta <ArrowRight size={20} /></>
                  ) : (
                    <>Ver Resultados Finales 🏆</>
                  )}
                </button>
                <button 
                  onClick={handleEndExamHost} 
                  className="btn-primary" 
                  style={{ background: 'var(--danger)', justifyContent: 'center', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 600 }}
                >
                  Terminar Examen
                </button>
              </div>
            </div>
          )}

          {/* D. Final de la Sala / Podio Definitivo */}
          {hostPhase === 'finished' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span className="glass" style={{ padding: '0.4rem 1.25rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-block', marginBottom: '1.5rem' }}>
                  RESULTADOS FINALES
                </span>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
                  🏆 Podio de Campeones 🏆
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                  ¡Increíble desempeño! Felicitaciones a los ganadores del examen de doctrina.
                </p>
              </div>

              {/* Podio Visual Premium */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', margin: '4rem 0 3rem', minHeight: '260px' }}>
                
                {/* 2do Lugar */}
                {players[1] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '200px', opacity: 1 }}
                    transition={{ type: 'spring', duration: 1.2, delay: 0.3 }}
                    style={{ width: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>🥈</span>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{players[1].player_name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{players[1].score} pts</div>
                    </div>
                    <div style={{ background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)', height: '120px', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#64748b' }}>2º</span>
                    </div>
                  </motion.div>
                )}

                {/* 1er Lugar */}
                {players[0] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '250px', opacity: 1 }}
                    transition={{ type: 'spring', duration: 1.2 }}
                    style={{ width: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '3rem' }}>👑</span>
                      <div style={{ fontWeight: 800, fontSize: '1.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{players[0].player_name}</div>
                      <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{players[0].score} pts</div>
                    </div>
                    <div style={{ background: 'linear-gradient(180deg, #fef08a 0%, #facc15 100%)', height: '160px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', border: '2px solid #eab308' }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#a16207' }}>1º</span>
                    </div>
                  </motion.div>
                )}

                {/* 3er Lugar */}
                {players[2] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '170px', opacity: 1 }}
                    transition={{ type: 'spring', duration: 1.2, delay: 0.6 }}
                    style={{ width: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2.25rem' }}>🥉</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{players[2].player_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{players[2].score} pts</div>
                    </div>
                    <div style={{ background: 'linear-gradient(180deg, #fed7aa 0%, #fdba74 100%)', height: '90px', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#c2410c' }}>3º</span>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Lista Completa de Jugadores */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.35rem', fontWeight: 700 }}>Clasificación General</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {players.map((p, index) => (
                    <div key={p.id} className="glass" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', background: index === 0 ? 'rgba(250, 204, 21, 0.05)' : 'var(--card-bg)', border: index === 0 ? '1px solid rgba(250, 204, 21, 0.2)' : '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', width: '25px' }}>#{index + 1}</span>
                        <span style={{ fontWeight: 600 }}>{p.player_name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.05rem' }}>{p.score} puntos</span>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.correct_answers} correctas en {p.time_taken_seconds}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={clearSession} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem' }}>
                Volver al Menú Principal
              </button>
            </div>
          )}

        </div>
      )}

      {/* 3. VISTA DEL JUGADOR */}
      {mode === 'player' && (
        <div className="glass card" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
          
          {/* A. Esperando al Anfitrión en la Sala */}
          {playerPhase === 'waiting' && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Loader2 className="animate-spin text-primary" size={60} style={{ margin: '0 auto 2rem' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Hola, {playerName}!</h2>
              <span style={{ background: 'rgba(0,113,227,0.08)', color: 'var(--primary)', padding: '0.35rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '1.5rem' }}>
                Te has unido a la sala
              </span>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                Mantén esta pestaña abierta. El examen comenzará en la pantalla principal tan pronto como el anfitrión lo decida.
              </p>
            </div>
          )}

          {/* B. Pregunta Activa */}
          {playerPhase === 'question' && examData && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUESTIONARIO EN VIVO</span>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Pregunta {currentQuestion + 1} de {examData.questions.length}</h4>
                </div>
                
                {/* Timer para Jugador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: questionTimeRemaining <= 5 ? 'rgba(255, 59, 48, 0.08)' : 'rgba(0,0,0,0.02)', padding: '0.5rem 1rem', borderRadius: '10px', border: `1px solid ${questionTimeRemaining <= 5 ? 'var(--danger)' : 'var(--border-color)'}` }}>
                  <Clock size={16} style={{ color: questionTimeRemaining <= 5 ? 'var(--danger)' : 'var(--primary)' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: questionTimeRemaining <= 5 ? 'var(--danger)' : 'var(--primary)' }}>
                    {questionTimeRemaining}s
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.65rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '2.5rem', color: 'var(--text-main)' }}>
                {examData.questions[currentQuestion].question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {examData.questions[currentQuestion].options.map((opt, i) => (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={i}
                    onClick={() => handleAnswerSelect(opt)}
                    className="btn-nav glass"
                    style={{ 
                      padding: '1.25rem 1.5rem', 
                      textAlign: 'left', 
                      width: '100%', 
                      justifyContent: 'flex-start', 
                      background: 'var(--bg-color)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <span style={{ background: 'var(--primary)', color: 'white', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                      {getOptionLetter(i)}
                    </span>
                    <span>{opt}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* C. Retroalimentación Visual Inmediata */}
          {playerPhase === 'feedback' && examData && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', padding: '1.5rem 0' }}
            >
              {isAnswerCorrect ? (
                <div style={{ background: 'rgba(52, 199, 89, 0.06)', border: '2px solid var(--accent)', borderRadius: '24px', padding: '2.5rem 1.5rem', marginBottom: '2rem' }}>
                  <CheckCircle size={72} style={{ color: 'var(--accent)', margin: '0 auto 1.5rem' }} />
                  <h2 style={{ color: 'var(--accent)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>¡Respuesta Correcta!</h2>
                  <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '0.5rem', fontWeight: 600 }}>
                    +{pointsEarned} Puntos Kahoot
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255, 59, 48, 0.06)', border: '2px solid var(--danger)', borderRadius: '24px', padding: '2.5rem 1.5rem', marginBottom: '2rem' }}>
                  <XCircle size={72} style={{ color: 'var(--danger)', margin: '0 auto 1.5rem' }} />
                  <h2 style={{ color: 'var(--danger)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>Respuesta Incorrecta</h2>
                  <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    La respuesta correcta era:
                  </p>
                  <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, background: 'white', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'inline-block', marginTop: '0.5rem' }}>
                    {examData.answers[examData.questions[currentQuestion].id]}
                  </p>
                </div>
              )}

              {/* Estadísticas del jugador en vivo */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <div className="glass" style={{ padding: '1rem', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PUESTO TEMPORAL</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    #{getPlayerRank()} de {players.length}
                  </div>
                </div>
                <div className="glass" style={{ padding: '1rem', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PUNTAJE ACUMULADO</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {score} pts
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 className="animate-spin text-primary" size={24} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, fontWeight: 500 }}>
                  Esperando a que el anfitrión pase a la siguiente pregunta...
                </p>
              </div>
            </motion.div>
          )}

          {/* D. Pantalla Intermedia de Leaderboard para Jugador */}
          {playerPhase === 'leaderboard' && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Trophy size={72} style={{ color: '#eab308', margin: '0 auto 2rem' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>¡Mira la Pantalla Principal!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                El anfitrión está mostrando las estadísticas y la tabla de posiciones en vivo.
              </p>

              <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(0,113,227,0.03)', border: '1px solid rgba(0,113,227,0.08)', maxWidth: '380px', margin: '0 auto 2.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TU POSICIÓN EN ESTE MOMENTO</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                  Puesto #{getPlayerRank()}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  {score} puntos totales
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {correctAnswers} de {currentQuestion + 1} respuestas correctas
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 className="animate-spin text-primary" size={24} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                  Prepárate para la siguiente ronda...
                </p>
              </div>
            </div>
          )}

          {/* E. Jugador Terminó Todo el Examen */}
          {playerPhase === 'finished' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Award size={80} style={{ color: '#eab308', margin: '0 auto 1.5rem' }} />
              <h2 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>¡Examen Completado!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2rem' }}>
                ¡Gran esfuerzo! Has terminado todas las preguntas. Mira el podio final en la pantalla principal.
              </p>

              <div className="glass" style={{ padding: '2rem 1.5rem', borderRadius: '24px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Posición Final</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>Puesto #{getPlayerRank()} de {players.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Puntuación Final</span>
                  <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.2rem' }}>{score} pts</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Respuestas Correctas</span>
                  <span style={{ fontWeight: '800', color: 'var(--accent)', fontSize: '1.2rem' }}>{correctAnswers} / {examData?.questions ? examData.questions.length : 0}</span>
                </div>
              </div>

              <button onClick={clearSession} className="btn-primary" style={{ margin: '0 auto', padding: '1rem 2rem', borderRadius: '14px' }}>
                Salir al Menú Principal
              </button>
            </div>
          )}

        </div>
      )}

    </motion.div>
  );
};

export default MultiplayerExam;
