
import { Octokit } from "octokit";
import { generateCompletion } from "../lib/groq";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function analyzeExternal() {
    const owner = "ACM-VIT";
    const repo = "ExamCooker";

    console.log(`Fetching file list for ${owner}/${repo}...`);

    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1', {
            owner,
            repo,
            branch: 'main',
        }).catch(async () => {
            return await octokit.request('GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1', {
                owner,
                repo,
                branch: 'master',
            });
        });

        // Find a good source file (e.g., a controller or route)
        const file = data.tree.find((f: any) =>
            (f.path.endsWith('.js') || f.path.endsWith('.ts')) &&
            !f.path.includes('node_modules') &&
            f.path.includes('controllers') || f.path.includes('routes')
        ) || data.tree.find((f: any) => f.path.endsWith('.js') || f.path.endsWith('.ts'));

        if (!file) {
            console.error("No suitable JS/TS file found.");
            return;
        }

        console.log(`Selected file: ${file.path}`);

        const contentResponse = await octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
            owner,
            repo,
            file_sha: file.sha
        });
        const content = Buffer.from(contentResponse.data.content, 'base64').toString();

        const prompt = `
        Analyze the following code file: "${file.path}".
        Extract ALL local file imports/dependencies.
        Ignore external libraries (like "react", "next", "zod").
        Focus on relative imports (starts with "./", "../") or aliases ("@/").
        
        Return ONLY valid JSON:
        {
            "imports": [
                "../components/button",
                "@/lib/utils"
            ]
        }
        
        Code preview:
        ${content.substring(0, 4000)}
        `;

        console.log("Analyzing with Groq...");
        const result = await generateCompletion(prompt);
        console.log("\n--- LLM Response ---");
        console.log(result);

    } catch (error) {
        console.error("Error:", error);
    }
}

analyzeExternal();
