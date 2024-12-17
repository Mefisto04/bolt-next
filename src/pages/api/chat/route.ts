import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from '../../../lib/prompts';

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
        const messages = body.messages;

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

        return NextResponse.json({
            response: response.response.text()
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
