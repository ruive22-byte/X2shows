const fs = require('fs');
let code = fs.readFileSync('src/data/tmdbData.ts', 'utf8');

const newShows = `,
  // THE FAIRLY ODDPARENTS
  {
    id: 'tmdb-tv-4630',
    tmdbId: 4630,
    title: 'The Fairly OddParents',
    name: 'The Fairly OddParents',
    original_title: 'The Fairly OddParents',
    poster_path: null,
    posterUrl: 'https://media.themoviedb.org/t/p/w500/3ryMj7tIvVtiXyI2tLvHYTjOjq4.jpg',
    backdrop_path: null,
    backdropUrl: 'https://media.themoviedb.org/t/p/original/rMKFsYeK3LPJGk9xqUHhGdqA4aB.jpg',
    overview: "Timmy Turner is an average kid - sort of. He's an only child with oblivious parents. But luckily he has Cosmo and Wanda, his wacky fairy godparents who have the power to grant him wishes.",
    vote_average: 7.3,
    vote_count: 1400,
    release_date: '2001-03-30',
    genres: ['Animation', 'Comedy', 'Family', 'Sci-Fi & Fantasy'],
    genre_ids: [16, 35, 10751, 10765],
    media_type: 'tv',
    navType: 'Toons',
    category: 'Cause You Like',
    durationMinutes: 22,
    totalEpisodes: 172,
    seasonCount: 10,
    studio: 'Nickelodeon / Frederator Studios',
    qualityBadges: ['HD', 'CLASSIC'],
    matchScore: 92,
    tagline: 'Wands and wings, floaty crowny things!',
    episodes: [
      { number: 1, code: '1x01', title: 'The Big Problem / Power Mad', airDate: 'Mar 30, 2001', rating: 8.5, status: 'Available in HD', duration: '22m', synopsis: 'Timmy wishes to be an adult, and later gets trapped in a video game.' }
    ]
  },
  // HARVEY BEAKS
  {
    id: 'tmdb-tv-62487',
    tmdbId: 62487,
    title: 'Harvey Beaks',
    name: 'Harvey Beaks',
    original_title: 'Harvey Beaks',
    poster_path: null,
    posterUrl: 'https://media.themoviedb.org/t/p/w500/8ZyogSmk6UFKz6Cz3VOo93QRuB4.jpg',
    backdrop_path: null,
    backdropUrl: 'https://media.themoviedb.org/t/p/original/1MgkWA4WNSZcfYeumJ3KdxZa3Gy.jpg',
    overview: "Mild-mannered bird Harvey Beaks and his two best friends, the rambunctious twins Fee and Foo, seek adventure and mischief in the magical forest of Bigbark Woods.",
    vote_average: 7.2,
    vote_count: 120,
    release_date: '2015-03-28',
    genres: ['Animation', 'Comedy', 'Kids'],
    genre_ids: [16, 35, 10762],
    media_type: 'tv',
    navType: 'Toons',
    category: 'Explore More',
    durationMinutes: 22,
    totalEpisodes: 52,
    seasonCount: 2,
    studio: 'Nickelodeon',
    qualityBadges: ['HD'],
    matchScore: 89,
    tagline: 'Adventure is a funny bird.',
    episodes: [
      { number: 1, code: '1x01', title: 'Pe-Choo / The Spitting Tree', airDate: 'Mar 28, 2015', rating: 7.5, status: 'Available in HD', duration: '22m', synopsis: 'Harvey wants to get banned from the lake to show he is a rebel.' }
    ]
  },
  // THE LOUD HOUSE
  {
    id: 'tmdb-tv-68073',
    tmdbId: 68073,
    title: 'The Loud House',
    name: 'The Loud House',
    original_title: 'The Loud House',
    poster_path: null,
    posterUrl: 'https://media.themoviedb.org/t/p/w500/v0xMCeZIkgBUQtiije0IDc8ReHr.jpg',
    backdrop_path: null,
    backdropUrl: 'https://media.themoviedb.org/t/p/original/jQmYRTt29hTNFGdNdwFVazOrDpO.jpg',
    overview: 'Things are crowded in the Loud household, with 11 children — 10 girls and one boy — causing craziness in the house. As the only boy, 11-year-old Lincoln is right in the middle of all of the madness.',
    vote_average: 7.6,
    vote_count: 850,
    release_date: '2016-05-02',
    genres: ['Animation', 'Comedy', 'Kids', 'Family'],
    genre_ids: [16, 35, 10762, 10751],
    media_type: 'tv',
    navType: 'Toons',
    category: 'For You',
    durationMinutes: 22,
    totalEpisodes: 200,
    seasonCount: 8,
    studio: 'Nickelodeon',
    qualityBadges: ['4K UHD'],
    matchScore: 94,
    tagline: 'One boy, ten girls. What could go wrong?',
    episodes: [
      { number: 1, code: '1x01', title: 'Left in the Dark / Get the Message', airDate: 'May 02, 2016', rating: 7.8, status: 'Available in 4K', duration: '22m', synopsis: 'Lincoln tries to watch the finale of his favorite show, and later leaves a nasty voicemail on Lori’s phone.' }
    ]
  }
];`;

code = code.replace(/    \]\n  \}\n\];/, '    ]\n  }' + newShows);
fs.writeFileSync('src/data/tmdbData.ts', code, 'utf8');
