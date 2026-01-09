import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  // In a real scenario, handle missing key gracefully. 
  // For this prototype, we assume it's injected.
  return new GoogleGenAI({ apiKey });
};

export const generatePropertyDescription = async (
  title: string,
  features: string[],
  location: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Actúa como un agente inmobiliario experto. Escribe una descripción atractiva, 
      persuasiva y profesional para una propiedad en alquiler.
      
      Detalles:
      - Título: ${title}
      - Ubicación: ${location}
      - Características: ${features.join(', ')}
      
      La descripción debe ser de aproximadamente 80-100 palabras, en español, 
      destacando los beneficios de vivir allí. No uses markdown, solo texto plano.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No se pudo generar la descripción.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error al generar la descripción con IA. Por favor ingrese una manualmente.";
  }
};
