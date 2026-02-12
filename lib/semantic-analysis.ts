
import { Octokit } from "octokit";
import { generateCompletion } from "./groq";
import { SimulationNodeDatum } from 'd3';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export interface SemanticNode extends SimulationNodeDatum {
    id: string; // Concept Name
    label: string;
    type: 'Service' | 'Model' | 'Utility' | 'Config' | 'Component' | 'Page' | 'File';
    description: string;
    fileSources: string[]; // Files contributing to this concept
    size: number;
}

export interface SemanticEdge {
    source: string;
    target: string;
    relationship: string; // e.g., "calls", "imports", "uses"
    value: number;
}

export interface SemanticGraphData {
    nodes: SemanticNode[];
    links: SemanticEdge[];
}

// Helper to chunk file content
function chunkContent(content: string, maxLines: number = 200): string[] {
    const lines = content.split('\n');
    const chunks: string[] = [];

    for (let i = 0; i < lines.length; i += maxLines) {
        chunks.push(lines.slice(i, i + maxLines).join('\n'));
    }

    return chunks;
}

export async function analyzeRepositorySemantics(owner: string, repo: string, onProgress?: (msg: string) => void): Promise<SemanticGraphData> {
    const nodesMap = new Map<string, SemanticNode>();
    const edges: SemanticEdge[] = [];

    try {
        if (onProgress) onProgress("Fetching file tree...");

        // 1. Fetch file tree
        const treeResponse = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1', {
            owner,
            repo,
            branch: 'main',
        }).catch(err => {
            return octokit.request('GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1', {
                owner,
                repo,
                branch: 'master',
            }).catch(() => null);
        });

        if (!treeResponse) throw new Error("Could not fetch repository tree.");

        // Filter relevant files (limit scope for MVP)
        const relevantFiles = treeResponse.data.tree.filter((f: any) =>
            f.type === 'blob' &&
            /\.(ts|tsx|js|jsx|py|java|go|rs)$/.test(f.path) &&
            !f.path.includes('node_modules') &&
            !f.path.includes('test') &&
            !f.path.includes('.d.ts')
        ).slice(0, 20); // Analyzing top 20 files for demo speed

        if (onProgress) onProgress(`Found ${relevantFiles.length} relevant files. Analysis started with Groq (Llama 3)...`);

        // 2. Process each file
        // With Groq we can go faster, maybe parallelize a bit more? 
        // Let's do batches of 3
        const BATCH_SIZE = 3;
        for (let i = 0; i < relevantFiles.length; i += BATCH_SIZE) {
            const batch = relevantFiles.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (file: any) => {
                try {
                    if (onProgress) onProgress(`Analyzing ${file.path}...`);

                    // Fetch content
                    const contentResponse = await octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
                        owner,
                        repo,
                        file_sha: file.sha
                    });
                    const content = Buffer.from(contentResponse.data.content, 'base64').toString();

                    // Chunk if necessary (simplified for prompt)
                    const chunks = chunkContent(content);
                    const chunk = chunks[0]; // Analyze only first chunk for speed in MVP

                    // 3. LLM Extraction
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
                    ${chunk.substring(0, 4000)}
                    `;

                    const response = await generateCompletion(prompt);
                    // Clean response string (remove potential Markdown backticks)
                    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();

                    try {
                        const result = JSON.parse(jsonStr);

                        // Create node for the current file
                        if (!nodesMap.has(file.path)) {
                            nodesMap.set(file.path, {
                                id: file.path,
                                label: file.path.split('/').pop() || file.path,
                                type: 'File',
                                description: 'Source File',
                                fileSources: [file.path],
                                size: 10
                            });
                        }

                        if (result.imports && Array.isArray(result.imports)) {
                            result.imports.forEach((imp: string) => {
                                // Simple resolution attempt
                                let target = imp;

                                // We can try to match it to existing known files if possible, 
                                // but for now let's just create a node for the target so it shows up.

                                if (!nodesMap.has(target)) {
                                    nodesMap.set(target, {
                                        id: target,
                                        label: target.split('/').pop() || target,
                                        type: 'File',
                                        description: 'Imported File',
                                        fileSources: [],
                                        size: 8
                                    });
                                }

                                edges.push({
                                    source: file.path,
                                    target: target,
                                    relationship: 'imports',
                                    value: 1
                                });
                            });
                        }
                    } catch (e) {
                        console.error(`Failed to parse JSON for ${file.path}: ${response}`, e);
                    }
                } catch (e) {
                    console.error(`Error processing ${file.path}:`, e);
                }
            }));
        }

        // Post-processing: Ensure all edge targets exist as nodes
        const finalNodes = Array.from(nodesMap.values());
        const finalEdges = edges.filter(e => nodesMap.has(e.source) && nodesMap.has(e.target));

        return { nodes: finalNodes, links: finalEdges };

    } catch (error) {
        console.error("Semantic analysis failed:", error);
        throw error;
    }
}
