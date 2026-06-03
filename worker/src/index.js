import { handleStories } from './routes/stories';
import { handleStory } from './routes/story';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			if (path === '/stories') {
				return handleStories(env, CORS_HEADERS);
			}

			const storyMatch = path.match(/^\/stories\/([^/]+)$/);
			if (storyMatch) {
				return handleStory(env, storyMatch[1], CORS_HEADERS);
			}

			return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
		} catch {
			return Response.json({ error: 'Server error' }, { status: 500, headers: CORS_HEADERS });
		}
	}
};
