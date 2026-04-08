import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export const generateQuiz = async (topic, content) => {
  if (!openai) throw new Error("API Key no configurada. Por favor, añade VITE_OPENAI_API_KEY en los ajustes de Vercel.");

  const prompt = `Genera un cuestionario didáctico de 5 preguntas de opción múltiple sobre el tema: ${topic}. 
  Contenido de referencia: ${content}
  Devuelve el resultado en formato JSON con la siguiente estructura:
  {
    "questions": [
      {
        "id": 1,
        "question": "¿...?",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
      }
    ]
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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

export default openai;
