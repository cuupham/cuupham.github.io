import type vi from './vi';

export default {
  home: 'Home', content: 'Notes', about: 'About', language: 'Language',
  skip: 'Skip to content', previous: 'Previous', next: 'Next',
  published: 'Published', updated: 'Updated', articleLanguage: 'Article language',
  back: 'Back to notes', loadEmbed: 'Load embedded content', source: 'Open source',
  notFound: 'Page not found', homeDescription: 'A personal space for sharing by CPM.',
  tagline: 'Made from code, frames, and curiosity.',
  introduction: 'A personal space where I share products, experiences and things I find interesting.',
  aboutFirst: 'Find it interesting.', aboutSecond: 'Share it.',
  aboutBody: 'No single topic or format. A place to keep and share things I care about, in my own way.',
  latest: 'Recently shared', all: 'View all', read: 'Read', top: 'Back to top',
  listDescription: 'Notes, experiences, and things I want to share.',
  pagination: 'Pagination', navigation: 'Main navigation', footer: 'Footer links',
  allPosts: 'All notes',
  breadcrumbs: 'Breadcrumbs',
} satisfies Record<keyof typeof vi, string>;
