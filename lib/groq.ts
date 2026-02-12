
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_build',
    dangerouslyAllowBrowser: true // Not recommended for prod, but handy for quick prototypes if needed client-side (we are using server-side though)
});

export async function generateCompletion(prompt: string, model: string = 'llama3-70b-8192'): Promise<string> {
    try {
        if (!process.env.GROQ_API_KEY) {
            console.warn("GROQ_API_KEY is missing in environment variables.");
            // throw new Error("GROQ_API_KEY is missing."); // Let's try to proceed or return mock? Better to throw.
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: model,
            temperature: 0.1,
            max_tokens: 4096,
            top_p: 1,
            stream: false,
            stop: null,
        });

        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}
