import { verifyLinkedInToken } from '@/middleware/verifyLinkedInToken';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_AI_MODEL_KEY,
    baseURL: 'https://api.together.xyz/v1',
});

const modes = {
    continue: 'Continue writing this LinkedIn post.',
    improve: 'Improve the quality and writing of this LinkedIn post.',
    grammar: 'Fix grammar and typos in this LinkedIn post.',
    shorter: 'Make the LinkedIn post shorter but still impactful.',
    longer: 'Expand on the ideas and make the LinkedIn post longer.',
    positive: 'Rewrite the LinkedIn post with a more optimistic tone.',
    simplify: 'Simplify the language for broader understanding for LinkedIn post.',
    hook: 'Add a strong attention-grabbing hook at the beginning for LinkedIn post.',
    cta: 'Add a strong CTA at the end for LinkedIn post.',
    emoji: 'Add emojis to make it more expressive for LinkedIn post.',
    examples: 'Add specific examples to support the message for LinkedIn post.',
};

const defaultInstruction = 'Write a professional and engaging LinkedIn post based on the following idea or text.';


export async function POST(request) {
    if (request.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const verified = await verifyLinkedInToken(token);
        const { inputText, type } = body;
        const instruction = modes[type] || defaultInstruction;
        const response = await openai.chat.completions.create({
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            messages: [
                { role: 'system', content: instruction },
                { role: 'user', content: inputText },
            ],
            temperature: 0.7,
        });

        return NextResponse.json({
            status: true,
            message: "Ai Reply successfully",
            data: response.choices[0].message.content
        }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ status: false, error: err.message }, { status: 500 });
    }
}
