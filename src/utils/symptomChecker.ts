import { SymptomResult } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const checkSymptoms = async (symptoms: string): Promise<SymptomResult> => {
  try {
    const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide a response in JSON format only, without any markdown formatting or code blocks.

Symptoms: "${symptoms}"

Provide your analysis in this exact JSON structure:
{
  "condition": "brief medical condition name",
  "severity": "low, medium, or high",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "doctorSpecialty": "medical specialty"
}

Guidelines:
- condition: Should be a concise medical term or condition name
- severity: "low" for minor issues, "medium" for moderate concerns, "high" for urgent situations requiring immediate medical attention
- recommendations: Array of 3-5 specific, actionable recommendations. Use these categories when appropriate: "rest", "fluids", "medication", "consultation", or provide specific advice
- doctorSpecialty: The appropriate medical specialty the patient should consult (e.g., "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Gastroenterologist", "Pulmonologist", "Orthopedic", "ENT Specialist", "Pediatrician", "Psychiatrist", "Emergency Medicine", etc.)

Important:
- If symptoms suggest a serious condition (chest pain, difficulty breathing, severe bleeding, etc.), always mark as "high" severity and recommend "Emergency Medicine" or "Cardiologist" as appropriate
- Be cautious and err on the side of recommending professional medical consultation when in doubt
- Provide clear, actionable advice
- Choose the most appropriate medical specialty based on the symptoms presented`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    let jsonText = text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(jsonText);

    return {
      condition: result.condition || 'general',
      severity: result.severity || 'low',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : ['rest', 'fluids', 'consultation'],
      doctorSpecialty: result.doctorSpecialty || 'General Physician'
    };

  } catch (error) {
    console.error('Error checking symptoms with Gemini:', error);

    return getFallbackResult(symptoms);
  }
};

const getFallbackResult = (symptoms: string): SymptomResult => {
  const symptomsLower = symptoms.toLowerCase();

  if (symptomsLower.includes('chest pain') || symptomsLower.includes('heart') || symptomsLower.includes('palpitation')) {
    return {
      condition: 'Possible cardiac concern',
      severity: 'high',
      recommendations: ['Seek immediate medical attention', 'Avoid physical exertion', 'Monitor vital signs'],
      doctorSpecialty: 'Cardiologist'
    };
  }

  if (symptomsLower.includes('breath') || symptomsLower.includes('asthma') || symptomsLower.includes('wheezing')) {
    return {
      condition: 'Respiratory issue',
      severity: 'high',
      recommendations: ['Monitor oxygen levels', 'Avoid triggers', 'Seek medical consultation'],
      doctorSpecialty: 'Pulmonologist'
    };
  }

  if (symptomsLower.includes('skin') || symptomsLower.includes('rash') || symptomsLower.includes('itch') || symptomsLower.includes('acne')) {
    return {
      condition: 'Dermatological condition',
      severity: 'low',
      recommendations: ['Avoid scratching', 'Keep area clean', 'Apply moisturizer', 'Consult dermatologist'],
      doctorSpecialty: 'Dermatologist'
    };
  }

  if (symptomsLower.includes('stomach') || symptomsLower.includes('abdomen') || symptomsLower.includes('nausea') || symptomsLower.includes('vomit') || symptomsLower.includes('diarrhea')) {
    return {
      condition: 'Gastrointestinal issue',
      severity: 'medium',
      recommendations: ['Stay hydrated', 'Eat light meals', 'Avoid spicy foods', 'Consult if symptoms persist'],
      doctorSpecialty: 'Gastroenterologist'
    };
  }

  if (symptomsLower.includes('joint') || symptomsLower.includes('bone') || symptomsLower.includes('fracture') || symptomsLower.includes('sprain')) {
    return {
      condition: 'Musculoskeletal issue',
      severity: 'medium',
      recommendations: ['Rest affected area', 'Apply ice', 'Avoid weight bearing', 'Seek orthopedic consultation'],
      doctorSpecialty: 'Orthopedic'
    };
  }

  if (symptomsLower.includes('ear') || symptomsLower.includes('nose') || symptomsLower.includes('throat') || symptomsLower.includes('sinus')) {
    return {
      condition: 'ENT condition',
      severity: 'low',
      recommendations: ['Gargle with warm salt water', 'Stay hydrated', 'Avoid irritants', 'Consult ENT specialist'],
      doctorSpecialty: 'ENT Specialist'
    };
  }

  if (symptomsLower.includes('headache') || symptomsLower.includes('migraine') || symptomsLower.includes('dizzy') || symptomsLower.includes('vertigo')) {
    return {
      condition: 'Neurological symptom',
      severity: 'medium',
      recommendations: ['Rest in a quiet, dark room', 'Stay hydrated', 'Avoid triggers', 'Monitor symptoms'],
      doctorSpecialty: 'Neurologist'
    };
  }

  if (symptomsLower.includes('anxiety') || symptomsLower.includes('stress') || symptomsLower.includes('depression') || symptomsLower.includes('mental')) {
    return {
      condition: 'Mental health concern',
      severity: 'medium',
      recommendations: ['Practice relaxation techniques', 'Maintain sleep schedule', 'Seek counseling', 'Talk to loved ones'],
      doctorSpecialty: 'Psychiatrist'
    };
  }

  if (symptomsLower.includes('fever') && symptomsLower.includes('cough')) {
    return {
      condition: 'Possible flu or infection',
      severity: 'medium',
      recommendations: ['Rest adequately', 'Stay hydrated', 'Monitor temperature', 'Seek medical advice if fever persists'],
      doctorSpecialty: 'General Physician'
    };
  }

  if (symptomsLower.includes('runny nose') || symptomsLower.includes('sneezing') || symptomsLower.includes('cold')) {
    return {
      condition: 'Common cold',
      severity: 'low',
      recommendations: ['Rest well', 'Drink plenty of fluids', 'Use steam inhalation', 'Over-the-counter medication if needed'],
      doctorSpecialty: 'General Physician'
    };
  }

  return {
    condition: 'General health concern',
    severity: 'low',
    recommendations: ['Monitor symptoms', 'Stay hydrated', 'Get adequate rest', 'Consult a doctor if symptoms worsen'],
    doctorSpecialty: 'General Physician'
  };
};