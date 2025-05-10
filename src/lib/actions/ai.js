export const instructionMap = {
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

export const streamAIResponse = async ({ inputText, type, onChunk }) => {
    const instruction = instructionMap[type] || 'Write a professional and engaging LinkedIn post based on the following idea or text.';

    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AI_MODEL_KEY}`,
        },
        body: JSON.stringify({
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            stream: true,
            temperature: 0.7,
            max_tokens: type === 'longer' ? 800 : 300,
            messages: [
                { role: 'system', content: instruction },
                { role: 'user', content: inputText },
            ],
        }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    for await (const chunk of streamIterator(reader, decoder)) {
        if (chunk === '[DONE]') break;

        try {
            const parsed = JSON.parse(chunk);
            const content = parsed?.choices?.[0]?.delta?.content;
            if (content) {
                result += content;
                onChunk(content);
            }
        } catch (err) {
            // console.error('Error parsing chunk:', err);
        }
    }

    return result;
};

async function* streamIterator(reader, decoder) {
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        for (const line of lines) {
            if (line.startsWith('data:')) yield line.replace(/^data:\s*/, '').trim();
        }
        buffer = '';
    }
}