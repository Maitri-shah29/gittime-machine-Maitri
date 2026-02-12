/**
 * Client for the GitTime AI Python backend API
 * Backend must be running on localhost:8000 or configured via env var
 */

const BACKEND_URL = process.env.GITTIME_BACKEND_URL || 'http://localhost:8000';

export interface VersionEntry {
    version: string;
    date: string;
    description: string;
}

export interface Feature {
    id: string;
    name: string;
    description: string;
    files: string[];
    versions?: VersionEntry[];
}

export interface AnalysisResponse {
    repo: string;
    features: Feature[];
}

export interface FileChange {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch: string;
}

export interface CommitEvolution {
    sha: string;
    date: string;
    message: string;
    author: string;
    files_changed: FileChange[];
    total_additions: number;
    total_deletions: number;
    evolution_summary: string;
}

export interface FeatureTimelineResponse {
    feature_id: string;
    versions: VersionEntry[];
}

export interface FeatureEvolutionResponse {
    feature_id: string;
    evolution: CommitEvolution[];
}

/**
 * Analyze a repository and extract features
 */
export async function analyzeRepository(repoUrl: string): Promise<AnalysisResponse> {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo_url: repoUrl }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Backend error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get version timeline for a specific feature
 */
export async function getFeatureTimeline(
    repo: string,
    feature: Feature
): Promise<FeatureTimelineResponse> {
    const response = await fetch(`${BACKEND_URL}/api/feature-timeline`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo, feature }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Backend error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get commit-level evolution for a specific feature
 */
export async function getFeatureEvolution(
    repo: string,
    feature: Feature
): Promise<FeatureEvolutionResponse> {
    const response = await fetch(`${BACKEND_URL}/api/feature-evolution`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo, feature }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Backend error: ${response.status}`);
    }

    return response.json();
}

/**
 * Check if backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch {
        return false;
    }
}
