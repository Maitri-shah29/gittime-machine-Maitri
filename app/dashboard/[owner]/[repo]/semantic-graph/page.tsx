"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SemanticGraph } from "@/components/semantic-graph";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, Loader2, Zap } from "lucide-react";
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
        setStatus("Initializing analysis with Groq...");

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        Semantic Graph
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered analysis of high-level concepts using <strong>Groq (Llama 3)</strong>.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {loading && (
                        <span className="text-sm text-muted-foreground animate-pulse">
                            {status}
                        </span>
                    )}
                    <Button onClick={analyze} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                        {data ? 'Re-Analyze' : 'Start Fast Analysis'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg text-red-500 text-sm">
                    {error}
                </div>
            )}

            {!data && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg bg-muted/20">
                    <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium">No analysis data yet.</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-md text-center">
                        Powered by Groq LPU™ Inference Engine. Extremely fast concept extraction.
                        <br />
                        Ensure <code>GROQ_API_KEY</code> is set in your env.
                    </p>
                </div>
            )}

            {loading && !data && (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg bg-muted/20">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Analyzing repository code via Groq...</p>
                    <p className="text-xs text-muted-foreground mt-2">This should be blazing fast.</p>
                </div>
            )}

            {data && (
                <div className="flex-1 min-h-[500px]">
                    <SemanticGraph data={data} />
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Found {data.nodes.length} concepts and {data.links.length} relationships.
                    </div>
                </div>
            )}
        </div>
    );
}
