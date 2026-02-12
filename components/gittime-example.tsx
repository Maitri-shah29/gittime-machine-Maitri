/**
 * Example component demonstrating how to use the GitTime AI backend integration
 */

'use client';

import { useState } from 'react';
import type { Feature, AnalysisResponse, FeatureTimelineResponse, FeatureEvolutionResponse } from '@/lib/gittime-backend-client';

export default function GitTimeExample() {
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [timeline, setTimeline] = useState<FeatureTimelineResponse | null>(null);
    const [evolution, setEvolution] = useState<FeatureEvolutionResponse | null>(null);
    const [error, setError] = useState<string>('');

    const analyzeRepo = async () => {
        if (!repoUrl.trim()) return;

        setLoading(true);
        setError('');
        setAnalysis(null);
        setSelectedFeature(null);
        setTimeline(null);
        setEvolution(null);

        try {
            const response = await fetch('/api/gittime-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Analysis failed');
            }

            const data: AnalysisResponse = await response.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadFeatureTimeline = async (feature: Feature) => {
        if (!analysis) return;

        setSelectedFeature(feature);
        setError('');

        try {
            const response = await fetch('/api/gittime-timeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo: analysis.repo, feature }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Timeline fetch failed');
            }

            const data: FeatureTimelineResponse = await response.json();
            setTimeline(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const loadFeatureEvolution = async (feature: Feature) => {
        if (!analysis) return;

        setSelectedFeature(feature);
        setError('');

        try {
            const response = await fetch('/api/gittime-evolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo: analysis.repo, feature }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Evolution fetch failed');
            }

            const data: FeatureEvolutionResponse = await response.json();
            setEvolution(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">GitTime AI Integration Example</h1>

            {/* Input Section */}
            <div className="mb-8">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="Enter GitHub repo URL (e.g., facebook/react)"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={analyzeRepo}
                        disabled={loading || !repoUrl.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Analyzing repository...</p>
                </div>
            )}

            {/* Results */}
            {analysis && (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">
                            Repository: {analysis.repo}
                        </h2>
                        <p className="text-gray-600">
                            Found {analysis.features.length} features
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {analysis.features.map((feature) => (
                            <div
                                key={feature.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedFeature?.id === feature.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                <h3 className="font-semibold mb-2">{feature.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {feature.description}
                                </p>
                                <div className="text-xs text-gray-500 mb-3">
                                    Files: {feature.files.slice(0, 3).join(', ')}
                                    {feature.files.length > 3 && ` +${feature.files.length - 3} more`}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => loadFeatureTimeline(feature)}
                                        className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Timeline
                                    </button>
                                    <button
                                        onClick={() => loadFeatureEvolution(feature)}
                                        className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Evolution
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline Display */}
                    {timeline && selectedFeature && (
                        <div className="mt-6 p-6 bg-white border rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Timeline: {selectedFeature.name}
                            </h3>
                            <div className="space-y-4">
                                {timeline.versions.map((version, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-mono text-sm font-semibold text-blue-600">
                                                {version.version}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {version.date}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1 text-gray-700">
                                            {version.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evolution Display */}
                    {evolution && selectedFeature && (
                        <div className="mt-6 p-6 bg-white border rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Evolution: {selectedFeature.name}
                            </h3>
                            <div className="space-y-6">
                                {evolution.evolution.map((commit, idx) => (
                                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-mono text-xs font-semibold text-green-600">
                                                {commit.sha}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {commit.date}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                by {commit.author}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium mt-1">
                                            {commit.message}
                                        </p>
                                        <p className="text-sm mt-2 text-gray-700">
                                            {commit.evolution_summary}
                                        </p>
                                        <div className="text-xs text-gray-500 mt-2">
                                            <span className="text-green-600">
                                                +{commit.total_additions}
                                            </span>
                                            {' / '}
                                            <span className="text-red-600">
                                                -{commit.total_deletions}
                                            </span>
                                            {' • '}
                                            {commit.files_changed.length} files changed
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
