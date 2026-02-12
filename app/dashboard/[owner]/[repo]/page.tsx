import { getAllCommits } from "@/lib/github";
import { CommitGraph } from "@/components/commit-graph";
import { AlertCircle } from "lucide-react";
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Timeline</h1>
                <p className="text-muted-foreground">
                    Visualizing commit history for {owner}/{repo}
                </p>
            </div>

            {error === "API Rate Limit Exceeded" && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>API Rate Limit Exceeded</AlertTitle>
                    <AlertDescription>
                        You have hit the GitHub API rate limit (60 requests/hour for unauthenticated users).
                        To fix this, create a `.env.local` file with `GITHUB_TOKEN=your_token_here`.
                    </AlertDescription>
                </Alert>
            )}

            <CommitGraph commits={commits} />
        </div>
    );
}
