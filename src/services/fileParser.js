import * as pdfjsLib from 'pdfjs-dist';
import { YoutubeTranscript } from 'youtube-transcript';

// Utilizar la sintaxis nativa de Vite/ESM para resolver workers
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();


export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error("Error al extraer PDF:", error);
    throw new Error("No se pudo leer el archivo PDF. Asegúrate de que no esté encriptado.");
  }
};

export const extractYoutubeTranscript = async (url) => {
  try {
    // Intentar extraer la transcripción directamente (puede fallar por CORS en navegadores)
    const transcriptArray = await YoutubeTranscript.fetchTranscript(url);
    const fullText = transcriptArray.map(t => t.text).join(' ');
    
    if (!fullText.trim()) throw new Error("Transcripción vacía");
    return fullText;
  } catch (error) {
    console.error("Error al extraer YouTube:", error);
    throw new Error("No se pudieron extraer los subtítulos del video. (Recuerda que el video debe tener subtítulos disponibles y puede haber bloqueos de seguridad del navegador).");
  }
};

export const parseInput = async (input, file) => {
  if (file && file.type === 'application/pdf') {
    return await extractTextFromPDF(file);
  }
  
  if (input && (input.includes('youtube.com') || input.includes('youtu.be'))) {
    return await extractYoutubeTranscript(input);
  }
  
  return input; // Devolver texto plano si no es PDF ni Video
};
