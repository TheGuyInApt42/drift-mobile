import type { PageLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

// Home is the launch screen, so it never throws: an offline launch or an API
// hiccup renders an inline "can't reach stories" state with Try again,
// instead of an empty page (or the bare framework error page).
export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${PUBLIC_API_URL}/stories`);
		if (!res.ok) return { stories: [], featured: null, loadFailed: true };
		const stories = await res.json();
		return { stories, featured: stories[0] ?? null, loadFailed: false };
	} catch {
		return { stories: [], featured: null, loadFailed: true };
	}
};
