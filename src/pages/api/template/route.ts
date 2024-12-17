import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT } from '../../../lib/prompts';
import { basePrompt as nodeBasePrompt } from '../../../lib/defaults/node';
import { basePrompt as reactBasePrompt } from '../../../lib/defaults/react';

const genAI = new GoogleGenerativeAI("AIzaSyAGC6ratkmWs5Esxyz7k4qXE8rD-FuQDtQ");
const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
        maxOutputTokens: 15000,
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const prompt = body.prompt;

        const systemInstruction = "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra. ";
        const fullPrompt = systemInstruction + prompt;

        const result = await model.generateContent([
            { text: fullPrompt }
        ]);

        const response = await result.response;
        const answer = response.text().trim().toLowerCase();

        if (answer === "react") {
            return NextResponse.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`
                ],
                uiPrompts: [reactBasePrompt]
            });
        }

        if (answer === "node") {
            return NextResponse.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`
                ],
                uiPrompts: [nodeBasePrompt]
            });
        }

        return NextResponse.json(
            { message: "You cant access this" },
            { status: 403 }
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
