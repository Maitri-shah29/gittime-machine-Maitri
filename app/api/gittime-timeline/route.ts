import { NextRequest, NextResponse } from 'next/server';
import { getFeatureTimeline } from '@/lib/gittime-backend-client';

/**
 * API route to get version timeline for a specific feature
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

        console.log(`Fetching timeline for feature: ${feature.name}`);

        const result = await getFeatureTimeline(repo, feature);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Feature Timeline Error:', error);
        
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
            { error: error.message || 'Timeline fetch failed' },
            { status: 500 }
        );
    }
}
