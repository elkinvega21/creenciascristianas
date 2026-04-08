import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Essential for this web app demo
});

export const generateQuiz = async (topic, content) => {
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
  const prompt = `Analiza el siguiente texto sobre "Muerte y Resurrección" y proporciona un resumen estructurado, puntos clave y 3 preguntas de reflexión.
  Texto: ${text}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });

  return response.choices[0].message.content;
};

export default openai;
