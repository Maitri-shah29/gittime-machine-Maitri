import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/gittime-backend-client';

/**
 * API route to analyze repository using GitTime AI backend
 * Extracts features and their details
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { repoUrl } = body;

        if (!repoUrl) {
            return NextResponse.json(
                { error: 'repoUrl is required' },
                { status: 400 }
            );
        }

        console.log(`Analyzing repository: ${repoUrl}`);

        const result = await analyzeRepository(repoUrl);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('GitTime Analysis Error:', error);
        
        // Check if it's a connection error
        if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { 
                    error: 'Backend not available. Make sure the Python backend is running on localhost:8000',
                    details: error.message 
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Analysis failed' },
            { status: 500 }
        );
    }
}
