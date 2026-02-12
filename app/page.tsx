"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight, GitGraph, BrainCircuit, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Basic extraction of owner/repo from URL
      // Supports: https://github.com/owner/repo
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const [owner, repo] = pathParts;
        router.push(`/dashboard/${owner}/${repo}`);
      } else {
        alert("Invalid GitHub URL format");
      }
    } catch (err) {
      alert("Please enter a valid URL");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-purple-400/30 blur-[120px]"></div>
      <div className="absolute left-1/4 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[100px]"></div>

      <div className="z-10 w-full max-w-7xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto w-fit rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-sm mb-6 shadow-lg shadow-primary/10">
            <span className="terminal-effect">$ git-timemachine --init</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl text-foreground">
            Git Time Machine
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto font-light">
            Travel through your <span className="text-primary font-semibold">commit history</span> and uncover the hidden structure of your <span className="text-primary font-semibold">dependencies</span>.
            <br />
            <span className="text-sm mt-2 block">Visualize code evolution with GitHub-powered analytics.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">$</span>
              <Input
                type="url"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="h-14 pl-8 text-base bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary shadow-lg font-mono"
                required
              />
            </div>
            <Button size="lg" className="h-14 px-10 font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">
              Analyze <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Github className="h-4 w-4" />
            Try analyzing any public GitHub repository
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-7xl mx-auto mt-16"
        >
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch">
            <div className="group flex-1 p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-purple-400/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <GitGraph className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 flex-wrap">
                Commit Graph
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">git log</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Interactive visualization of branches, merges, and commit history over time with detailed timeline analysis.
              </p>
            </div>

            <div className="group flex-1 p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 flex-wrap">
                Dependency Graph
                <span className="text-xs font-mono text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">imports</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Fast regex-based analysis of code imports and dependencies with visual relationship mapping.
              </p>
            </div>

            <div className="group flex-1 p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 flex-wrap">
                AI Features
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">powered</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered feature discovery, version timelines, and commit evolution tracking.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
