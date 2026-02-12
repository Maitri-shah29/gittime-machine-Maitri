"use client";

import { Gitgraph, TemplateName, templateExtend } from "@gitgraph/react";
import { CommitData } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CommitGraphProps {
    commits: CommitData[];
}

export function CommitGraph({ commits }: CommitGraphProps) {
    if (!commits.length) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No commits found or failed to fetch.</p>
                </CardContent>
            </Card>
        );
    }

    // Deduplicate commits based on SHA
    const uniqueCommits = Array.from(new Map(commits.map(c => [c.sha, c])).values());

    // Sort by date (ascending) to ensure parents are processed before children
    uniqueCommits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const sortedCommits = uniqueCommits;

    return (
        <Card className="h-full bg-[#1e1e1e] border-[#333]">
            <CardHeader className="border-b border-[#333] py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-[#cccccc] text-sm font-normal">Git Graph</CardTitle>
                <div className="flex items-center gap-2 text-xs text-[#858585]">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#007acc]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#d73a49]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#28a745]"></span>
                        <span>Branches</span>
                    </span>
                </div>
            </CardHeader>
            <CardContent className="overflow-auto min-h-[600px] p-0 font-mono text-sm bg-[#1e1e1e]">
                <div className="p-4">
                    <Gitgraph options={{
                        template: templateExtend(TemplateName.Metro, {
                            colors: ["#007acc", "#d73a49", "#28a745", "#ff79c6", "#bd93f9", "#ffb86c"],
                            branch: {
                                lineWidth: 2,
                                spacing: 20,
                                label: {
                                    display: false,
                                }
                            },
                            commit: {
                                spacing: 28,
                                dot: {
                                    size: 6,
                                    strokeWidth: 2,
                                },
                                message: {
                                    displayAuthor: true,
                                    displayHash: false,
                                    color: "#cccccc",
                                    font: "normal 13px Consolas, 'Courier New', monospace",
                                }
                            }
                        }),
                        author: " ",
                    }}>
                        {(gitgraph) => {
                            const branchMap = new Map<string, any>();
                            const branchTips = new Map<string, string>();

                            const main = gitgraph.branch("main");

                            sortedCommits.forEach((commit) => {
                                const parents = commit.parents;
                                let currentBranch;

                                if (parents.length === 0) {
                                    currentBranch = main;
                                } else {
                                    const primaryParentSha = parents[0];
                                    const parentBranch = branchMap.get(primaryParentSha) || main;
                                    const isParentTip = branchTips.get(parentBranch.name) === primaryParentSha;

                                    if (isParentTip) {
                                        currentBranch = parentBranch;
                                    } else {
                                        currentBranch = gitgraph.branch({
                                            from: parentBranch,
                                            name: `branch-${commit.sha.substring(0, 7)}`,
                                        });
                                    }
                                }

                                branchMap.set(commit.sha, currentBranch);
                                branchTips.set(currentBranch.name, commit.sha);

                                if (parents.length > 1) {
                                    const secondaryParentSha = parents[1];
                                    const sourceBranch = branchMap.get(secondaryParentSha);

                                    if (sourceBranch) {
                                        currentBranch.merge(sourceBranch, {
                                            subject: commit.message,
                                            author: commit.author,
                                            hash: commit.sha,
                                            style: {
                                                message: { color: "#858585" },
                                            }
                                        });
                                    } else {
                                        currentBranch.commit({
                                            subject: commit.message,
                                            author: commit.author,
                                            hash: commit.sha,
                                        });
                                    }
                                } else {
                                    currentBranch.commit({
                                        subject: commit.message,
                                        author: commit.author,
                                        hash: commit.sha,
                                    });
                                }
                            });
                        }}
                    </Gitgraph>
                </div>
            </CardContent>
        </Card>
    );
}
