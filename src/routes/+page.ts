import type { PageLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch(`${PUBLIC_API_URL}/stories`);
    if (!res.ok) return { stories: [], featured: null };
    const stories = await res.json();
    return {
        stories,
        featured: stories[0] ?? null
    };
};