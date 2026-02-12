"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitGraph, ArrowLeft, Github, BrainCircuit, Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    owner: string;
    repo: string;
}

export function Sidebar({ owner, repo }: SidebarProps) {
    const pathname = usePathname();
    const baseUrl = `/dashboard/${owner}/${repo}`;

    const links = [
        {
            name: "Commit History",
            href: baseUrl,
            icon: GitGraph,
            active: pathname === baseUrl,
            description: "View timeline"
        },
        {
            name: "Dependency Graph",
            href: `${baseUrl}/semantic-graph`,
            icon: BrainCircuit,
            active: pathname === `${baseUrl}/semantic-graph`,
        },
        {
            name: "AI Features",
            href: `${baseUrl}/ai-features`,
            icon: Sparkles,
            active: pathname === `${baseUrl}/ai-features`,
        },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
            <div className="p-5 border-b border-border/50">
                <Link href="/" className="group flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Home</span>
                </Link>
                <div className="mt-5 p-3 rounded-lg bg-accent/50 border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                        <Terminal className="h-3 w-3" />
                        <span>Repository</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono">
                        <Github className="h-4 w-4 text-primary" />
                        <span className="truncate font-semibold" title={`${owner}/${repo}`}>
                            {owner}<span className="text-muted-foreground">/</span>{repo}
                        </span>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-3 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Navigation
                </div>
                {links.map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Button
                            variant={link.active ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 h-auto py-3 px-3 transition-all",
                                link.active 
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                                    : "hover:bg-accent/50 hover:text-foreground"
                            )}
                        >
                            <link.icon className={cn("h-4 w-4", link.active && "text-primary")} />
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium">{link.name}</span>
                                <span className="text-xs text-muted-foreground">{link.description}</span>
                            </div>
                        </Button>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-border/50">
                <div className="text-xs text-center">
                    <div className="font-mono text-primary font-semibold">$ git-timemachine</div>
                    <div className="text-muted-foreground mt-1">v1.0.0</div>
                </div>
            </div>
        </div>
    );
}
