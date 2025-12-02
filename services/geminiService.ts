import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRepairJob = async (machine: string, description: string, availableParts: string[]): Promise<string> => {
  try {
    const prompt = `
      Jesteś ekspertem serwisowym sprzętu fitness.
      Maszyna: ${machine}
      Problem zgłoszony przez klienta: ${description}
      
      Dostępne części w magazynie (nazwy): ${availableParts.join(', ')}.

      Twoje zadanie:
      1. Podaj 3 prawdopodobne przyczyny usterki.
      2. Zasugeruj, które z dostępnych części mogą być potrzebne do naprawy.
      3. Jeśli brakuje części w magazynie, zasugeruj co należy domówić.
      
      Odpowiedź sformatuj jako zwięzłą listę punktowaną w języku Polskim. Nie używaj Markdown (tylko czysty tekst z myślnikami).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować analizy.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Błąd połączenia z asystentem AI.";
  }
};
