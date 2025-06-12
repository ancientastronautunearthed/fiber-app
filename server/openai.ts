import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MonsterData {
  name: string;
  imageUrl: string;
}

export interface NutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  aiAnalysis?: string;
  healthImpact?: number; // -10 to +10 scale for monster health impact
}

export async function generateMonster(descriptiveWords: string[]): Promise<MonsterData> {
  try {
    // Generate monster name and concept
    const nameResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative monster naming expert. Generate unique, friendly monster names and create detailed image descriptions for DALL-E based on descriptive words. Respond with JSON format."
        },
        {
          role: "user",
          content: `Create a friendly monster companion based on these 5 descriptive words: ${descriptiveWords.join(", ")}. Generate a unique name and a detailed image description for DALL-E that captures the essence of these words. The monster should be cute, friendly, and suitable as a health companion. Return JSON with 'name' and 'imageDescription' fields.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const monsterConcept = JSON.parse(nameResponse.choices[0].message.content || '{}');
    
    // Generate monster image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A cute, friendly, cartoon-style monster companion for a health app. ${monsterConcept.imageDescription || 'A gentle creature with healing powers'}. The monster should be colorful, approachable, and have a magical/mystical appearance. Digital art style, suitable for a mobile app avatar.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return {
      name: monsterConcept.name || `${descriptiveWords[0]} Guardian`,
      imageUrl: imageResponse.data[0].url || '',
    };
  } catch (error) {
    console.error("Error generating monster:", error);
    // Return fallback data
    return {
      name: `${descriptiveWords[0]} Guardian`,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150", // Fallback image
    };
  }
}

export async function analyzeNutrition(foodItems: string): Promise<NutritionData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition analysis expert. Analyze food items and provide nutritional data and health impact assessment. For health impact, rate from -10 (very healthy/anti-inflammatory) to +10 (very unhealthy/inflammatory) based on how this food would affect someone with Morgellons disease. The rating represents how much this food would 'feed' or strengthen the disease. Focus on inflammatory properties, processed ingredients, and potential triggers. Respond with JSON format."
        },
        {
          role: "user",
          content: `Analyze these food items for nutritional content: "${foodItems}". Provide estimated calories, protein (g), carbs (g), fat (g), sugar (g), a brief analysis of the nutritional quality, and a health impact score (-10 to +10) specifically for someone managing Morgellons disease. Score represents how much this food feeds the disease: -10 = very anti-inflammatory/healing, +10 = very inflammatory/disease-feeding. Consider processed ingredients, sugar content, and inflammatory properties. Return JSON with fields: calories, protein, carbs, fat, sugar, aiAnalysis, healthImpact.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      calories: Number(analysis.calories) || 0,
      protein: Number(analysis.protein) || 0,
      carbs: Number(analysis.carbs) || 0,
      fat: Number(analysis.fat) || 0,
      sugar: Number(analysis.sugar) || 0,
      aiAnalysis: analysis.aiAnalysis || "Nutritional analysis completed.",
      healthImpact: Number(analysis.healthImpact) || 0,
    };
  } catch (error) {
    console.error("Error analyzing nutrition:", error);
    // Return fallback data
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      aiAnalysis: "Unable to analyze nutrition at this time. Please try again later.",
      healthImpact: 0,
    };
  }
}

export async function generateInsightFromSymptoms(symptoms: any[], overallFeeling: number, notes?: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a supportive health companion providing gentle insights about symptom patterns. Provide encouraging, educational insights about Morgellons symptom management. Always recommend consulting healthcare providers for medical advice. Keep responses supportive and under 150 words."
        },
        {
          role: "user",
          content: `User logged these symptoms: ${JSON.stringify(symptoms)}, overall feeling: ${overallFeeling}/10${notes ? `, notes: ${notes}` : ''}. Provide a supportive insight about their symptoms and gentle suggestions for self-care. Mention the importance of consulting healthcare providers.`
        }
      ],
    });

    return response.choices[0].message.content || "Thank you for logging your symptoms. Remember to consult with your healthcare provider about any concerns.";
  } catch (error) {
    console.error("Error generating symptom insight:", error);
    return "Thank you for tracking your symptoms today. Consistent monitoring helps identify patterns. Please consult your healthcare provider for personalized advice.";
  }
}

export async function generateDailyRiddle(): Promise<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational health quiz creator. Generate health and nutrition riddles appropriate for people managing chronic conditions like Morgellons. Focus on anti-inflammatory foods, supplements, lifestyle factors, and general wellness. Make questions educational but engaging. Respond with JSON format."
        },
        {
          role: "user",
          content: "Create a daily health riddle with a question, 4 multiple choice options (A-D), the correct answer index (0-3), and a brief explanation. Focus on topics relevant to inflammation, nutrition, supplements, or wellness practices that might benefit someone with Morgellons. Return JSON with fields: question, options (array), correctAnswer (number), explanation."
        }
      ],
      response_format: { type: "json_object" },
    });

    const riddle = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      question: riddle.question || "What nutrient is known for its anti-inflammatory properties?",
      options: riddle.options || ["Vitamin C", "Omega-3 fatty acids", "Iron", "Calcium"],
      correctAnswer: riddle.correctAnswer || 1,
      explanation: riddle.explanation || "Omega-3 fatty acids have powerful anti-inflammatory properties that may help manage chronic conditions.",
    };
  } catch (error) {
    console.error("Error generating riddle:", error);
    // Return fallback riddle
    return {
      question: "Which of these foods is known for its anti-inflammatory properties?",
      options: ["Processed sugar", "Salmon", "White bread", "Fried foods"],
      correctAnswer: 1,
      explanation: "Salmon is rich in omega-3 fatty acids, which have powerful anti-inflammatory properties that may help manage chronic conditions.",
    };
  }
}
