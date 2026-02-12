
import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepositorySemantics } from '@/lib/semantic-analysis';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { owner, repo } = body;

        console.log(`Starting semantic analysis for ${owner}/${repo}...`);

        // This will now use Groq API which is faster
        const graphData = await analyzeRepositorySemantics(owner, repo, (msg) => {
            console.log(`[Analysis]: ${msg}`);
        });

        return NextResponse.json(graphData);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}
