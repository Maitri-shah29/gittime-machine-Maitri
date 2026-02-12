import { AIFeaturesClient } from '@/components/ai-features-client';

export default async function AIFeaturesPage({
    params,
}: {
    params: Promise<{ owner: string; repo: string }>;
}) {
    const { owner, repo } = await params;

    return <AIFeaturesClient owner={owner} repo={repo} />;
}
