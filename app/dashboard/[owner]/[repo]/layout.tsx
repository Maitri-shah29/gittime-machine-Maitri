import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ owner: string; repo: string }>;
}) {
    const { owner, repo } = await params;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar owner={owner} repo={repo} />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
