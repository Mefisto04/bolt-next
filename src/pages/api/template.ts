// pages/api/template.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT } from "@/lib/prompts";  // Adjust path as needed
import { basePrompt as reactBasePrompt } from "@/lib/defaults/react";
import { basePrompt as nodeBasePrompt } from "@/lib/defaults/node";

const genAI = new GoogleGenerativeAI("AIzaSyAGC6ratkmWs5Esxyz7k4qXE8rD-FuQDtQ");
const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
        maxOutputTokens: 15000,
    }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    const systemInstruction = "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra. ";
    const fullPrompt = systemInstruction + prompt;
    
    const result = await model.generateContent([
      { text: fullPrompt }
    ]);
    
    const response = await result.response;
    const answer = response.text().trim().toLowerCase();
    
    if (answer === "react") {
      return res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\n${reactBasePrompt}\n`
        ],
        uiPrompts: [reactBasePrompt]
      });
    }

    if (answer === "node") {
      return res.json({
        prompts: [reactBasePrompt],
        uiPrompts: [nodeBasePrompt]
      });
    }

    return res.status(403).json({ message: "You cant access this" });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
