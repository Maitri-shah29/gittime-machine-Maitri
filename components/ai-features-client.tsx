'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Clock, GitBranch, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Feature, AnalysisResponse, FeatureTimelineResponse, FeatureEvolutionResponse } from '@/lib/gittime-backend-client';

interface AIFeaturesClientProps {
    owner: string;
    repo: string;
}

export function AIFeaturesClient({ owner, repo }: AIFeaturesClientProps) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'evolution'>('timeline');
    const [timeline, setTimeline] = useState<FeatureTimelineResponse | null>(null);
    const [evolution, setEvolution] = useState<FeatureEvolutionResponse | null>(null);
    const [error, setError] = useState<string>('');
    const [loadingData, setLoadingData] = useState(false);

    const analyzeRepo = async () => {
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
                body: JSON.stringify({ repoUrl: `${owner}/${repo}` }),
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
        setActiveTab('timeline');
        setError('');
        setLoadingData(true);

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
        } finally {
            setLoadingData(false);
        }
    };

    const loadFeatureEvolution = async (feature: Feature) => {
        if (!analysis) return;

        setSelectedFeature(feature);
        setActiveTab('evolution');
        setError('');
        setLoadingData(true);

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
        } finally {
            setLoadingData(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Feature Analysis</h1>
                    <p className="text-muted-foreground">
                        AI-powered feature discovery and evolution tracking
                    </p>
                </div>
                <Button onClick={analyzeRepo} disabled={loading} size="lg">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Repository'
                    )}
                </Button>
            </div>

            {/* Error Display */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Analyzing repository with AI...</p>
                        <p className="text-sm text-muted-foreground mt-2">This may take 30-60 seconds</p>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {analysis && !loading && (
                <>
                    {/* Repository Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Repository: {analysis.repo}</CardTitle>
                            <CardDescription>
                                Found {analysis.features.length} distinct features
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysis.features.map((feature) => (
                            <Card
                                key={feature.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                    selectedFeature?.id === feature.id
                                        ? 'border-primary shadow-lg'
                                        : ''
                                }`}
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                                    <CardDescription className="line-clamp-3">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground mb-3">
                                        <strong>Files:</strong>{' '}
                                        {feature.files.slice(0, 2).join(', ')}
                                        {feature.files.length > 2 && ` +${feature.files.length - 2} more`}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => loadFeatureTimeline(feature)}
                                            variant="default"
                                        >
                                            <Clock className="mr-1 h-3 w-3" />
                                            Timeline
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => loadFeatureEvolution(feature)}
                                            variant="secondary"
                                        >
                                            <GitBranch className="mr-1 h-3 w-3" />
                                            Evolution
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Feature Details */}
                    {selectedFeature && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>{selectedFeature.name}</CardTitle>
                                <CardDescription>{selectedFeature.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingData ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : activeTab === 'timeline' && timeline ? (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Version Timeline</h3>
                                        {timeline.versions.length === 0 ? (
                                            <p className="text-muted-foreground">No versions found</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {timeline.versions.map((version, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="border-l-4 border-primary pl-4 py-2"
                                                    >
                                                        <div className="flex items-baseline gap-3 mb-1">
                                                            <span className="font-mono text-sm font-semibold text-primary">
                                                                {version.version}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {version.date}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {version.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : activeTab === 'evolution' && evolution ? (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Commit Evolution</h3>
                                        {evolution.evolution.length === 0 ? (
                                            <p className="text-muted-foreground">No commits found</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {evolution.evolution.map((commit, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="border-l-4 border-green-500 pl-4 py-2"
                                                    >
                                                        <div className="flex items-baseline gap-3 mb-1">
                                                            <span className="font-mono text-xs font-semibold text-green-600">
                                                                {commit.sha}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {commit.date}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                by {commit.author}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium mb-2">
                                                            {commit.message}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {commit.evolution_summary}
                                                        </p>
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="text-green-600">
                                                                +{commit.total_additions}
                                                            </span>
                                                            {' / '}
                                                            <span className="text-red-600">
                                                                -{commit.total_deletions}
                                                            </span>
                                                            {' • '}
                                                            {commit.files_changed?.length || 0} files changed
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Empty State */}
            {!analysis && !loading && !error && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Click "Analyze Repository" to use AI to discover features, track version timelines, 
                            and understand how features evolved over time.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
