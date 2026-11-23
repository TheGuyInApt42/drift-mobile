import { Preferences } from '@capacitor/preferences';

export type StoryProgress = {
  storyId: string;
  title: string;
  coverUrl: string;
  positionSeconds: number;
  durationSeconds: number;
  lastListened: number;
};

const STORAGE_KEY = 'story_progress';

function createProgressStore() {
  let data = $state<Record<string, StoryProgress>>({});
  let initialized = $state(false);

  async function load() {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      data = value ? JSON.parse(value) : {};
    } catch {
      data = {};
    } finally {
      initialized = true;
    }
  }

  async function persist() {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(data) });
  }

  return {
    get initialized() { return initialized; },

    load,

    async save(progress: StoryProgress) {
      data[progress.storyId] = progress;
      await persist();
    },

    get(storyId: string): StoryProgress | null {
      return data[storyId] ?? null;
    },

    get latest(): StoryProgress | null {
      const entries = Object.values(data);
      if (!entries.length) return null;
      return entries.sort((a, b) => b.lastListened - a.lastListened)[0];
    },

    async clear(storyId: string) {
      delete data[storyId];
      await persist();
    },
  };
}

export const progressStore = createProgressStore();