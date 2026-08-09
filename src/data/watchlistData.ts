import { WatchlistItem, WatchlistStatus } from '../types';

export const WATCHLIST_GENRES = [
  'Action',
  'Romance',
  'Adventure',
  'Supernatural',
  'Fantasy',
  'Sci-Fi',
  'Dark Fantasy',
  'Comedy',
  'Cyberpunk',
  'Mystery',
  'Slice of Life',
  'Thriller',
  'Mecha',
  'Sports',
  'Historical'
] as const;

export interface YearFilterOption {
  id: string;
  label: string;
  shortLabel: string;
  match: (year: number) => boolean;
}

export const WATCHLIST_YEAR_OPTIONS: YearFilterOption[] = [
  {
    id: '2026',
    label: '2026 (New / Current)',
    shortLabel: '2026',
    match: (y) => y === 2026
  },
  {
    id: '2025',
    label: '2025 (Next Gen)',
    shortLabel: '2025',
    match: (y) => y === 2025
  },
  {
    id: '2024',
    label: '2024 Blockbusters',
    shortLabel: '2024',
    match: (y) => y === 2024
  },
  {
    id: '2023',
    label: '2023 Viral Hits',
    shortLabel: '2023',
    match: (y) => y === 2023
  },
  {
    id: '2022',
    label: '2022 Classics',
    shortLabel: '2022',
    match: (y) => y === 2022
  },
  {
    id: '2020-2021',
    label: '2020 – 2021 Era',
    shortLabel: '2020-21',
    match: (y) => y >= 2020 && y <= 2021
  },
  {
    id: '2010s',
    label: '2010s Golden Era (2010 – 2019)',
    shortLabel: '2010s',
    match: (y) => y >= 2010 && y <= 2019
  },
  {
    id: '2000s',
    label: '2000s Modern Vintage (2000 – 2009)',
    shortLabel: '2000s',
    match: (y) => y >= 2000 && y <= 2009
  },
  {
    id: 'classics',
    label: '1990s & 80s Sakuga Classics (1980 – 1999)',
    shortLabel: '1990s & 80s',
    match: (y) => y >= 1980 && y <= 1999
  }
];

export const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    id: 'wl-01',
    showId: 'tmdb-tv-94605',
    title: 'Arcane',
    japaneseTitle: 'アーケイン',
    status: 'Watching',
    releaseYear: 2024,
    genres: ['Action', 'Sci-Fi', 'Dark Fantasy', 'Adventure'],
    studio: 'Fortiche Production',
    score: 9.8,
    userRating: 10,
    matchScore: 99,
    episodesWatched: 12,
    totalEpisodes: 18,
    durationMinutes: 44,
    progressPercent: 66,
    format: 'TV',
    posterUrl: '/fqL8rh4U5qSY0yK00p9r1Q3j2kF.jpg',
    backdropUrl: '/70Ufbdv3n2l1dEv3p4m3jL2b5z.jpg',
    notes: 'God-tier painted 3D animation, emotional storyline, Woodkid score.'
  },
  {
    id: 'wl-02',
    showId: 'tmdb-movie-569094',
    title: 'Spider-Man: Across the Spider-Verse',
    japaneseTitle: 'スパイダーマン：アクロス・ザ・スパイダーバース',
    status: 'Finished',
    releaseYear: 2023,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    studio: 'Sony Pictures Animation',
    score: 9.7,
    userRating: 10,
    matchScore: 98,
    episodesWatched: 1,
    totalEpisodes: 1,
    durationMinutes: 140,
    progressPercent: 100,
    format: 'Movies',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg',
    notes: 'Groundbreaking comic book aesthetic, revolutionary frame rate shifting.'
  },
  {
    id: 'wl-03',
    showId: 'tmdb-tv-85937',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃',
    status: 'Watching',
    releaseYear: 2024,
    genres: ['Action', 'Fantasy', 'Supernatural', 'Dark Fantasy'],
    studio: 'ufotable',
    score: 9.8,
    userRating: 9.5,
    matchScore: 99,
    episodesWatched: 38,
    totalEpisodes: 55,
    durationMinutes: 24,
    progressPercent: 69,
    format: 'Anime',
    posterUrl: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    backdropUrl: '/nTvM4mhqZlHI3UkI1T4bbqUEKyG.jpg',
    notes: 'Unbelievable 3D/2D particle effects and choreography.'
  },
  {
    id: 'wl-04',
    showId: 'tmdb-tv-105248',
    title: 'Cyberpunk: Edgerunners',
    japaneseTitle: 'サイバーパンク エッジランナーズ',
    status: 'Finished',
    releaseYear: 2022,
    genres: ['Action', 'Sci-Fi', 'Cyberpunk', 'Thriller'],
    studio: 'Studio TRIGGER',
    score: 9.7,
    userRating: 10,
    matchScore: 98,
    episodesWatched: 10,
    totalEpisodes: 10,
    durationMinutes: 25,
    progressPercent: 100,
    format: 'Anime',
    posterUrl: '/7jSW0L9n1iLsI9nvdJg9H9w70A9.jpg',
    backdropUrl: '/sA5vyW4EI3qo669fPsd77aNqFqX.jpg',
    notes: 'Night City neon adrenaline, phenomenal soundtrack.'
  },
  {
    id: 'wl-05',
    showId: 'tmdb-tv-4424',
    title: 'Ben 10 (Classic)',
    japaneseTitle: 'ベン10',
    status: 'Watching',
    releaseYear: 2005,
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    studio: 'Cartoon Network Studios',
    score: 9.3,
    userRating: 9.5,
    matchScore: 98,
    episodesWatched: 26,
    totalEpisodes: 52,
    durationMinutes: 22,
    progressPercent: 50,
    format: 'TV',
    posterUrl: '/eEeyf6JzJocg8aB0Nf7B5yvj4wQ.jpg',
    backdropUrl: '/hKkVJ6d02m1vW4f4L5Z7kKjV9e0.jpg',
    notes: 'Classic Omnitrix lore, incredible alien combat choreography.'
  },
  {
    id: 'wl-06',
    showId: 'tmdb-tv-246',
    title: 'Avatar: The Last Airbender',
    japaneseTitle: 'アバター 伝説の少年アン',
    status: 'Finished',
    releaseYear: 2005,
    genres: ['Action', 'Adventure', 'Fantasy'],
    studio: 'Nickelodeon Animation',
    score: 9.9,
    userRating: 10,
    matchScore: 100,
    episodesWatched: 61,
    totalEpisodes: 61,
    durationMinutes: 24,
    progressPercent: 100,
    format: 'TV',
    posterUrl: '/cHFZA8Tlv03n8kpuYEEZAE89SuL.jpg',
    backdropUrl: '/kU98IATgcytAQdp0v4eFw74l6y.jpg',
    notes: 'Peak worldbuilding, character arcs, and martial arts choreography.'
  }
];
