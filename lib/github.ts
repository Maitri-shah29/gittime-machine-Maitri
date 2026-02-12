import { Octokit } from "octokit";

const octokit = new Octokit({
    // process.env.GITHUB_TOKEN can be added here if available
    auth: process.env.GITHUB_TOKEN,
});

export interface CommitData {
    sha: string;
    message: string;
    author: string;
    date: string;
    parents: string[];
}

export interface BranchData {
    name: string;
    sha: string;
}

export async function getBranches(owner: string, repo: string): Promise<BranchData[]> {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
            owner,
            repo,
        });
        return response.data.map((branch: any) => ({
            name: branch.name,
            sha: branch.commit.sha,
        }));
    } catch (error: any) {
        console.error("Error fetching branches:", error);
        if (error.status === 403) {
            console.warn("Rate limit exceeded for branches.");
            return [];
        }
        return [];
    }
}

export async function getAllCommits(owner: string, repo: string): Promise<CommitData[]> {
    try {
        // 1. Fetch all branches
        const branches = await getBranches(owner, repo);

        // If no branches returned (e.g. rate limit), try fetching default just in case or return empty
        if (branches.length === 0) {
            // Fallback to just getCommits which tries default branch
            return getCommits(owner, repo);
        }

        // 2. Fetch commits for each branch tip
        // Limit to top 5 branches to avoid exploding API limits if no token
        const branchesToFetch = branches.slice(0, 5);

        const commitPromises = branchesToFetch.map(branch =>
            octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner,
                repo,
                sha: branch.name,
                per_page: 50, // Get last 50 per branch
            }).then(res => res.data).catch(err => {
                console.error(`Error fetching commits for branch ${branch.name}:`, err);
                return [];
            })
        );

        const results = await Promise.all(commitPromises);

        // 3. Flatten and deduplicate
        const allCommits = results.flat();
        const uniqueCommits = Array.from(new Map(allCommits.map((c: any) => [c.sha, c])).values());

        return uniqueCommits.map((commit: any) => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            parents: commit.parents.map((parent: any) => parent.sha),
        }));

    } catch (error: any) {
        console.error("Error fetching all commits:", error);
        if (error.status === 403) {
            throw new Error("API Rate Limit Exceeded");
        }
        return [];
    }
}

export async function getCommits(owner: string, repo: string): Promise<CommitData[]> {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner,
            repo,
            per_page: 100,
        });

        return response.data.map((commit: any) => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            parents: commit.parents.map((parent: any) => parent.sha),
        }));
    } catch (error: any) {
        console.error("Error fetching commits:", error);
        if (error.status === 403) {
            throw new Error("API Rate Limit Exceeded");
        }
        return [];
    }
}
