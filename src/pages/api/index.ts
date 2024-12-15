import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "@/lib/prompts";
import { basePrompt as nodeBasePrompt } from "@/lib/defaults/node";
import { basePrompt as reactBasePrompt } from "@/lib/defaults/react";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
        maxOutputTokens: 15000,
    },
});

// Helper to handle CORS and method checks
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === "POST") {
            if (req.url?.endsWith("/template")) {
                return await handleTemplate(req, res);
            } else if (req.url?.endsWith("/chat")) {
                return await handleChat(req, res);
            }
        }

        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Handler for "/template" endpoint
const handleTemplate = async (req: NextApiRequest, res: NextApiResponse) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    const systemInstruction =
        "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra. ";
    const fullPrompt = `${systemInstruction}${prompt}`;

    const result = await model.generateContent([{ text: fullPrompt }]);
    const response = await result.response;
    const answer = response.text().trim().toLowerCase();

    if (answer === "react") {
        return res.json({
            prompts: [
                BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`,
            ],
            uiPrompts: [reactBasePrompt],
        });
    }

    if (answer === "node") {
        return res.json({
            prompts: [
                BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`,
            ],
            uiPrompts: [nodeBasePrompt],
        });
    }

    return res.status(403).json({ message: "You can't access this" });
};

// Handler for "/chat" endpoint
const handleChat = async (req: NextApiRequest, res: NextApiResponse) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
    }

    const systemPrompt = getSystemPrompt();
    const chat = model.startChat({
        generationConfig: {
            maxOutputTokens: 20000,
        },
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
        response: response.response.text(),
    });
};

export default handler;
