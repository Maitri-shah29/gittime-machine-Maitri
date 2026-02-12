import { NextRequest, NextResponse } from 'next/server';
import { getFeatureEvolution } from '@/lib/gittime-backend-client';

/**
 * API route to get commit-level evolution for a specific feature
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { repo, feature } = body;

        if (!repo || !feature) {
            return NextResponse.json(
                { error: 'repo and feature are required' },
                { status: 400 }
            );
        }

        console.log(`Fetching evolution for feature: ${feature.name}`);

        const result = await getFeatureEvolution(repo, feature);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Feature Evolution Error:', error);
        
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
            { error: error.message || 'Evolution fetch failed' },
            { status: 500 }
        );
    }
}
