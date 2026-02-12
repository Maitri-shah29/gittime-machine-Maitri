import { getAllCommits } from "@/lib/github";
import { CommitGraph } from "@/components/commit-graph";
import { AlertCircle, GitGraph } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function CommitHistoryPage({
    params,
}: {
    params: Promise<{ owner: string; repo: string }>;
}) {
    const { owner, repo } = await params;

    let commits: any[] = [];
    let error: string | null = null;

    try {
        commits = await getAllCommits(owner, repo);
    } catch (err: any) {
        error = err.message;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-border/50 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GitGraph className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Project Timeline</h1>
                </div>
                <p className="text-muted-foreground ml-13 font-mono text-sm">
                    <span className="text-primary">$</span> git log --all --graph <span className="text-muted-foreground/50">//</span> <span className="font-sans">{owner}/{repo}</span>
                </p>
            </div>

            {error === "API Rate Limit Exceeded" && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">API Rate Limit Exceeded</AlertTitle>
                    <AlertDescription className="mt-2">
                        You have hit the GitHub API rate limit (60 requests/hour for unauthenticated users).
                        <br />
                        <code className="mt-2 block bg-background/50 p-2 rounded text-xs font-mono border border-border/50">
                            GITHUB_TOKEN=your_token_here
                        </code>
                        <span className="text-xs mt-2 block">Add this to your <code>.env.local</code> file.</span>
                    </AlertDescription>
                </Alert>
            )}

            <CommitGraph commits={commits} />
        </div>
    );
}
