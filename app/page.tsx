"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight, GitGraph, BrainCircuit } from "lucide-react";
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 blur-[100px]"></div>

      <div className="z-10 w-full max-w-3xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto w-fit rounded-full border border-border bg-background/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm mb-6">
            🚀 Visualize your repository history & architecture
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
            Git Time Machine
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Travel through your commit history and uncover the hidden structure of your backend dependencies.
            Visualize code evolution like never before.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="h-12 text-base bg-background/80 backdrop-blur-sm"
              required
            />
            <Button size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/20">
              Analyze <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Try a public repository to get started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 max-w-4xl mx-auto"
        >
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <GitGraph className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Commit Graph</h3>
            <p className="text-muted-foreground">
              Interactive visualization of branches, merges, and commit history over time.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Semantic Graph</h3>
            <p className="text-muted-foreground">
              Fast regex-based analysis of code imports and dependencies.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
