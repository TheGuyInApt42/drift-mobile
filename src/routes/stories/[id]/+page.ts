import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageLoad = async ({ params, fetch }) => {
    const res = await fetch(`${PUBLIC_API_URL}/stories/${params.id}`);
    if (!res.ok) error(res.status, 'Story not found');
    return res.json();
};