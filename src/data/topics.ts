export const topics = [
  { slug: 'technology', name: 'Technology', description: 'Software, systems, tools and the ideas behind them.' },
  { slug: 'ai', name: 'AI', description: 'Artificial intelligence, experiments, workflows and practical lessons.' },
  { slug: 'programming', name: 'Programming', description: 'Engineering notes, patterns, architecture and development.' },
  { slug: 'games', name: 'Games', description: 'Games worth playing, understanding and talking about.' },
  { slug: 'manga', name: 'Manga & Comics', description: 'Stories, recommendations, reviews and collections.' },
  { slug: 'novels', name: 'Novels', description: 'Books and stories worth reading and remembering.' },
  { slug: 'music', name: 'Music', description: 'Albums, artists, discoveries and listening notes.' },
] as const;

export type Topic = (typeof topics)[number];
