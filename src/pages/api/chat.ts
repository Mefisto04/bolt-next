// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "@/lib/prompts";  // Adjust path as needed

const genAI = new GoogleGenerativeAI("AIzaSyAGC6ratkmWs5Esxyz7k4qXE8rD-FuQDtQ");
const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
        maxOutputTokens: 20000,
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
    const { messages } = req.body;
    
    const systemPrompt = getSystemPrompt();
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 20000,
      }
    });

    await chat.sendMessage(systemPrompt);

    let response;
    for (const msg of messages) {
      const messageText = msg.content || msg.message;
      response = await chat.sendMessage(messageText);
    }

    if (!response) {
      throw new Error("No response generated");
    }

    return res.json({
      response: response.response.text()
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
