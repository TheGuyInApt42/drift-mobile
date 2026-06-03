import type { Env } from '../index';

export async function handleStories(env: Env, cors: Record<string, string>) {
    const [stories, tags] = await Promise.all([
        env.DB.prepare('SELECT * FROM stories').all(),
        env.DB.prepare('SELECT * FROM story_tags').all(),
    ]);

    // Group tags by story_id
    const tagMap = tags.results.reduce((acc, t: any) => {
        acc[t.story_id] = [...(acc[t.story_id] || []), t.tag];
        return acc;
    }, {} as Record<string, string[]>);

    const result = stories.results.map((s: any) => ({
        ...s,
        tags: tagMap[s.id] || [],
    }));

    return Response.json(result, { headers: cors });
}