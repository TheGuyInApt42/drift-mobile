import type { PageLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

// Mirror whatever ssr/prerender config your home +page.ts already uses —
// this hits the drift-api Worker at runtime, so it can't be prerendered.
export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(`${PUBLIC_API_URL}/stories`);

	if (!res.ok) {
		throw new Error(`Failed to load stories: ${res.status}`);
	}

	const stories = await res.json();
	return { stories };
};