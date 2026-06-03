import type { Env } from '../index';

export async function handleStory(env: Env, id: string, cors: Record<string, string>) {
    const [story, tracks, tags] = await Promise.all([
        env.DB.prepare('SELECT * FROM stories WHERE id = ?').bind(id).first(),
        env.DB.prepare('SELECT * FROM story_tracks WHERE story_id = ? ORDER BY track_order ASC').bind(id).all(),
        env.DB.prepare('SELECT tag FROM story_tags WHERE story_id = ?').bind(id).all(),
    ]);

    if (!story) {
        return Response.json({ error: 'Story not found' }, { status: 404, headers: cors });
    }

    return Response.json({
        story,
        tracks: tracks.results,
        tags: tags.results.map((t: any) => t.tag),
    }, { headers: cors });
}