
import { Octokit } from "octokit";
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

// Helper to extract local imports using regex patterns
function extractLocalImports(content: string, filePath: string): string[] {
    const imports: string[] = [];
    const fileExt = filePath.split('.').pop()?.toLowerCase();

    if (fileExt === 'ts' || fileExt === 'tsx' || fileExt === 'js' || fileExt === 'jsx') {
        // TypeScript/JavaScript imports
        // Match ES6 imports: import ... from "..." or import ... from '...'
        const es6ImportRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"](.*?)['"]/g;
        let match;
        while ((match = es6ImportRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (isLocalImport(importPath)) {
                imports.push(importPath);
            }
        }

        // Match CommonJS require: require("...") or require('...')
        const requireRegex = /require\s*\(\s*['"](.*?)['"]\s*\)/g;
        while ((match = requireRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (isLocalImport(importPath)) {
                imports.push(importPath);
            }
        }

        // Match dynamic imports: import("...") or import('...')
        const dynamicImportRegex = /import\s*\(\s*['"](.*?)['"]\s*\)/g;
        while ((match = dynamicImportRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (isLocalImport(importPath)) {
                imports.push(importPath);
            }
        }
    } else if (fileExt === 'py') {
        // Python imports: from ... import ... or import ...
        const pythonFromImportRegex = /from\s+([.\w]+)\s+import/g;
        let match;
        while ((match = pythonFromImportRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (importPath.startsWith('.')) {
                imports.push(importPath);
            }
        }

        const pythonImportRegex = /^import\s+([.\w]+)/gm;
        while ((match = pythonImportRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (importPath.startsWith('.')) {
                imports.push(importPath);
            }
        }
    } else if (fileExt === 'java') {
        // Java imports (local packages only, detect project packages)
        const javaImportRegex = /import\s+([\w.]+);/g;
        let match;
        while ((match = javaImportRegex.exec(content)) !== null) {
            const importPath = match[1];
            // Filter out standard library imports
            if (!importPath.startsWith('java.') && !importPath.startsWith('javax.') && 
                !importPath.startsWith('org.junit') && !importPath.startsWith('org.springframework')) {
                imports.push(importPath);
            }
        }
    } else if (fileExt === 'go') {
        // Go imports
        const goImportRegex = /import\s+(?:"([^"]+)"|[\s\S]*?"([^"]+)")/g;
        let match;
        while ((match = goImportRegex.exec(content)) !== null) {
            const importPath = match[1] || match[2];
            // Only local imports (usually contain project name or start with .)
            if (importPath.startsWith('.') || (!importPath.includes('github.com') && !importPath.includes('golang.org'))) {
                imports.push(importPath);
            }
        }
    } else if (fileExt === 'rs') {
        // Rust imports
        const rustUseRegex = /use\s+(?:crate|super|self)::([\w:]+)/g;
        let match;
        while ((match = rustUseRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
    }

    return [...new Set(imports)]; // Return unique imports
}

// Helper to determine if an import is local (not an external package)
function isLocalImport(importPath: string): boolean {
    // Check if it's a relative import
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
        return true;
    }
    // Check if it's an alias import (common patterns)
    if (importPath.startsWith('@/') || importPath.startsWith('~/') || importPath.startsWith('@')) {
        return true;
    }
    // Exclude common external packages
    const commonExternals = [
        'react', 'next', 'vue', 'angular', 'express', 'axios', 'lodash',
        'moment', 'zod', 'yup', 'fs', 'path', 'http', 'https', 'crypto',
        'util', 'os', 'stream', 'events', 'buffer'
    ];
    
    return !commonExternals.some(ext => importPath === ext || importPath.startsWith(ext + '/'));
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

        if (onProgress) onProgress(`Found ${relevantFiles.length} relevant files. Starting regex-based import analysis...`);

        // 2. Process each file
        const BATCH_SIZE = 5;
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

                    // Extract imports using regex
                    const imports = extractLocalImports(content, file.path);

                    // Create node for the current file
                    if (!nodesMap.has(file.path)) {
                        nodesMap.set(file.path, {
                            id: file.path,
                            label: file.path.split('/').pop() || file.path,
                            type: 'File',
                            description: file.path,
                            fileSources: [file.path],
                            size: 10
                        });
                    }

                    // Create nodes and edges for imports
                    imports.forEach((imp: string) => {
                        let target = imp;

                        if (!nodesMap.has(target)) {
                            nodesMap.set(target, {
                                id: target,
                                label: target.split('/').pop() || target,
                                type: 'File',
                                description: target,
                                fileSources: [],
                                size: 8
                            });
                        }

                        edges.push({
                            source: target,
                            target: file.path,
                            relationship: 'imports',
                            value: 1
                        });
                    });
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
