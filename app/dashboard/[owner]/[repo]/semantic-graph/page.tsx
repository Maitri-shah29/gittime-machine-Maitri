"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SemanticGraph } from "@/components/semantic-graph";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, Loader2, Zap, Terminal } from "lucide-react";
import { SemanticGraphData } from "@/lib/semantic-analysis";

export default function SemanticGraphPage() {
    const params = useParams();
    const owner = params.owner as string;
    const repo = params.repo as string;

    const [data, setData] = useState<SemanticGraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");

    const analyze = async () => {
        setLoading(true);
        setError(null);
        setStatus("Initializing regex-based analysis...");

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner, repo })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Analysis failed');
            }

            const graphData = await res.json();
            setData(graphData);
            setStatus("Analysis complete!");
        } catch (err: any) {
            setError(err.message);
            setStatus("Error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-start justify-between border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold tracking-tight">Dependency Graph</h1>
                    </div>
                    <p className="text-muted-foreground ml-13 font-mono text-sm">
                        <span className="text-primary">$</span> analyze-imports <span className="text-muted-foreground/50">//</span> <span className="font-sans">Fast regex-based import detection</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {loading && (
                        <span className="text-sm text-primary font-mono animate-pulse flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            {status}
                        </span>
                    )}
                    <Button onClick={analyze} disabled={loading} size="lg" className="shadow-lg">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                        {data ? 'Re-Analyze' : 'Start Analysis'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-xl text-red-500">
                    <div className="flex items-center gap-2 font-semibold mb-1">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Error
                    </div>
                    <div className="text-sm font-mono">{error}</div>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/20 backdrop-blur-sm">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
                        <BrainCircuit className="relative h-20 w-20 text-purple-500/50" />
                    </div>
                    <p className="text-foreground font-semibold text-lg mb-2">No analysis data yet</p>
                    <p className="text-sm text-muted-foreground max-w-md text-center leading-relaxed">
                        Click <span className="font-semibold text-primary">Start Analysis</span> to extract imports and visualize dependencies.
                    </p>
                    <div className="mt-6 p-4 bg-card/50 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Terminal className="h-3 w-3" />
                            <span className="font-semibold">Features</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary"></span>
                                Regex pattern matching
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary"></span>
                                No API key required
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary"></span>
                                Fast & efficient
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {loading && !data && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 backdrop-blur-sm">
                    <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                    <p className="text-foreground font-semibold text-lg mb-2">Analyzing repository code...</p>
                    <p className="text-sm text-muted-foreground font-mono">{status}</p>
                    <div className="mt-4 flex gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '0.2s'}}></span>
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                </div>
            )}

            {data && (
                <div className="flex-1 min-h-[500px] border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm p-6">
                    <SemanticGraph data={data} />
                    <div className="mt-6 flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="h-2 w-2 rounded-full bg-primary"></span>
                            <span className="font-mono text-primary font-semibold">{data.nodes.length}</span>
                            <span className="text-muted-foreground">nodes</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                            <span className="font-mono text-purple-500 font-semibold">{data.links.length}</span>
                            <span className="text-muted-foreground">relationships</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
