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

export default openai;
