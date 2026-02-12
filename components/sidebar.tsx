"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitGraph, ArrowLeft, Github, BrainCircuit } from "lucide-react";
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
        },
        {
            name: "Semantic Graph",
            href: `${baseUrl}/semantic-graph`,
            icon: BrainCircuit,
            active: pathname === `${baseUrl}/semantic-graph`,
        },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                </Link>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Github className="h-4 w-4" />
                    <span className="truncate" title={`${owner}/${repo}`}>
                        {owner}/{repo}
                    </span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Button
                            variant={link.active ? "secondary" : "ghost"}
                            className={cn("w-full justify-start gap-2", link.active && "bg-secondary")}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.name}
                        </Button>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t text-xs text-center text-muted-foreground">
                Git Time Machine
            </div>
        </div>
    );
}
