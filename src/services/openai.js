import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export const generateQuiz = async (topic, content) => {
  if (!openai) throw new Error("API Key no configurada.");

  const prompt = `Genera un cuestionario didáctico y profundo de 5 preguntas de opción múltiple sobre el tema: ${topic}. 
  Contenido de referencia: ${content}
  
  Para cada pregunta, proporciona una explicación teológica de por qué la respuesta es correcta.
  
  Devuelve el resultado en formato JSON con la siguiente estructura:
  {
    "questions": [
      {
        "id": 1,
        "question": "¿...?",
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "explanation": "Explicación teológica profunda basada en la Biblia..."
      }
    ]
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // Upgrading to 4o for better theological depth
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

export const analyzeDocument = async (text) => {
  if (!openai) throw new Error("API Key no configurada.");

  const prompt = `Analiza el siguiente texto sobre "Muerte y Resurrección" y proporciona un resumen estructurado, puntos clave y 3 preguntas de reflexión.
  Texto: ${text}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });

  return response.choices[0].message.content;
};

export const generateStudyRoutine = async (content) => {
  if (!openai) throw new Error("API Key no configurada.");

  const prompt = `Crea una rutina de estudio bíblico paso a paso basada en el siguiente contenido:
  Contenido: ${content}
  
  Devuelve el resultado en formato JSON con la siguiente estructura:
  {
    "routineName": "Título de la Rutina",
    "steps": [
      {
        "step": 1,
        "title": "Nombre del paso",
        "description": "Qué hacer en este paso",
        "durationMinutes": 15
      }
    ],
    "summary": "Resumen general del propósito de esta rutina."
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateExamFromDocument = async (content, questionCount = 5) => {
  if (!openai) throw new Error("API Key no configurada.");

  const prompt = `Genera un cuestionario profundo de ${questionCount} preguntas de opción múltiple estrictamente basado en el siguiente documento.
  Documento: ${content}
  
  Devuelve el resultado en formato JSON con la siguiente estructura:
  {
    "questions": [
      {
        "id": 1,
        "question": "¿...?",
        "options": ["Texto de la opción 1", "Texto de la opción 2", "Texto de la opción 3", "Texto de la opción 4"],
        "explanation": "Explicación basada en el documento..."
      }
    ],
    "answers": {
      "1": "Texto de la opción correcta (Debe ser EXACTAMENTE igual al string de la opción)",
      "2": "Texto de la opción correcta"
    }
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateInversoLesson = async (topic) => {
  if (!openai) throw new Error("API Key no configurada.");

  const prompt = `Genera una guía de estudio de Escuela Sabática estilo "Inverso" (para jóvenes adultos adventistas) sobre el tema: "${topic}".
  
  CRÍTICO: El contenido debe ser EXTREMADAMENTE EXTENSO, profundo y de nivel universitario teológico. 
  Cada sección debe contener al menos 3 a 5 párrafos bien desarrollados. Usa saltos de línea dobles (\\n\\n) para separar los párrafos.
  
  La guía debe estructurarse estrictamente en las siguientes 6 secciones:
  1. "Introduce" (Introducción exhaustiva a la historia o tema central, contexto y trasfondo)
  2. "Explora" (Exploración profunda y exegética del texto bíblico principal)
  3. "Investiga" (Investigación teológica avanzada, citas de Elena G. de White si aplica, o contexto histórico profundo)
  4. "Evalúa" (Múltiples preguntas críticas de evaluación y profunda reflexión personal)
  5. "Aplica" (Aplicación práctica detallada a la vida diaria moderna del joven adulto)
  6. "Crea" (Un llamado a la acción creativa, detallado y desafiante)

  IMPORTANTE: Para CADA sección, formula una "reflectionQuestion" que invite al usuario a orar, meditar y escribir una respuesta en su diario espiritual.

  Además, es OBLIGATORIO recomendar 3 videos de YouTube que profundicen en este tema (ej. sermones, documentales, estudios de canales adventistas reconocidos). ¡NO OMITAS LA SECCIÓN DE VIDEOS!

  Devuelve el resultado en formato JSON EXACTAMENTE con la siguiente estructura (todas las propiedades son obligatorias):
  {
    "title": "Título atractivo y teológico de la lección",
    "sections": [
      {
        "name": "Introduce",
        "content": "Párrafo 1... \\n\\n Párrafo 2... \\n\\n Párrafo 3...",
        "reflectionQuestion": "¿Qué impresiones vienen a tu mente al leer esta historia? Escribe lo que Dios te está diciendo hoy..."
      }
    ],
    "recommendedVideos": [
      {
        "title": "Título sugerido del video",
        "channel": "Canal o autor sugerido (ej. Pr. Alejandro Bullón, Hope Channel)",
        "searchQuery": "Término de búsqueda ideal para YouTube"
      }
    ]
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "inverso_lesson_schema",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  content: { type: "string" },
                  reflectionQuestion: { type: "string" }
                },
                required: ["name", "content", "reflectionQuestion"],
                additionalProperties: false
              }
            },
            recommendedVideos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  channel: { type: "string" },
                  searchQuery: { type: "string" }
                },
                required: ["title", "channel", "searchQuery"],
                additionalProperties: false
              }
            }
          },
          required: ["title", "sections", "recommendedVideos"],
          additionalProperties: false
        },
        strict: true
      }
    }
  });

  return JSON.parse(response.choices[0].message.content);
};

export default openai;
