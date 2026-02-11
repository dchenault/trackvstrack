import type { Group, Album, Bracket, Round, Matchup, Track } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const neonDreamsArt = PlaceHolderImages.find(img => img.id === 'album-1-art')?.imageUrl ?? 'https://picsum.photos/seed/101/500/500';
const cityLightsArt = PlaceHolderImages.find(img => img.id === 'album-2-art')?.imageUrl ?? 'https://picsum.photos/seed/102/500/500';

const album1Tracks: Track[] = [
  { id: 't1', name: 'Sunrise Drive', trackNumber: 1, previewUrl: null },
  { id: 't2', name: 'Chrome Reflections', trackNumber: 2, previewUrl: null },
  { id: 't3', name: 'Midnight Circuit', trackNumber: 3, previewUrl: null },
  { id: 't4', name: 'Digital Bloom', trackNumber: 4, previewUrl: null },
  { id: 't5', name: 'Starlight Cassette', trackNumber: 5, previewUrl: null },
  { id: 't6', name: 'Sunset Grid', trackNumber: 6, previewUrl: null },
  { id: 't7', name: 'Virtual Plaza', trackNumber: 7, previewUrl: null },
  { id: 't8', name: 'Ocean Drive', trackNumber: 8, previewUrl: null },
];

const album1: Album = {
  id: 'album-1',
  name: 'Neon Dreams',
  artist: 'Synthwave Rider',
  artworkUrl: neonDreamsArt,
  tracks: album1Tracks,
};

const album2: Album = {
  id: 'album-2',
  name: 'City Lights',
  artist: 'Urban Explorer',
  artworkUrl: cityLightsArt,
  tracks: [
    { id: 't9', name: 'First Train', trackNumber: 1, previewUrl: null },
    { id: 't10', name: 'Rooftop Gardens', trackNumber: 2, previewUrl: null },
    { id: 't11', name: 'Cobblestone Alleys', trackNumber: 3, previewUrl: null },
    { id: 't12', name: 'Market Bustle', trackNumber: 4, previewUrl: null },
  ],
};


// Function to create a bracket from an album
function createBracket(album: Album): Bracket {
  const tracks = [...album.tracks];
  
  const round1Matchups: Matchup[] = [];
  for (let i = 0; i < tracks.length; i += 2) {
    round1Matchups.push({
      id: `m-r1-${i/2}`,
      track1: tracks[i],
      track2: tracks[i+1],
      winner: null,
      votes: { track1: 0, track2: 0 },
    });
  }

  const round1: Round = { id: 'round-1', name: 'Quarter Finals', matchups: round1Matchups };

  const round2Matchups: Matchup[] = [
    { id: 'm-r2-1', track1: null, track2: null, winner: null, votes: { track1: 0, track2: 0 } },
    { id: 'm-r2-2', track1: null, track2: null, winner: null, votes: { track1: 0, track2: 0 } },
  ];
  const round2: Round = { id: 'round-2', name: 'Semi Finals', matchups: round2Matchups };

  const round3Matchups: Matchup[] = [
    { id: 'm-r3-1', track1: null, track2: null, winner: null, votes: { track1: 0, track2: 0 } },
  ];
  const round3: Round = { id: 'round-3', name: 'Final', matchups: round3Matchups };

  return {
    id: `bracket-${album.id}`,
    album,
    rounds: [round1, round2, round3],
    status: 'active',
    winner: null,
  };
}

const mainBracket = createBracket(album1);

mainBracket.rounds[0].matchups[0].votes = { track1: 3, track2: 5 };
mainBracket.rounds[0].matchups[0].winner = mainBracket.rounds[0].matchups[0].track2;

mainBracket.rounds[1].matchups[0].track1 = mainBracket.rounds[0].matchups[0].winner;

mainBracket.rounds[0].matchups[1].votes = { track1: 8, track2: 2 };
mainBracket.rounds[0].matchups[1].winner = mainBracket.rounds[0].matchups[1].track1;
mainBracket.rounds[1].matchups[0].track2 = mainBracket.rounds[0].matchups[1].winner;

mainBracket.rounds[1].matchups[0].votes = { track1: 1, track2: 0 };


export const MOCK_GROUP: Group = {
  id: '123-abc-789',
  name: 'The Album Club',
  ownerId: 'user-1',
  users: [
    { id: 'user-1', name: 'Alex' },
    { id: 'user-2', name: 'Beth' },
    { id: 'user-3', name: 'Charlie' },
  ],
  activeBracket: mainBracket,
  archivedBrackets: [],
};

export const MOCK_GROUP_NO_BRACKET: Group = {
  id: '123-abc-789-empty',
  name: 'Fresh Beats',
  ownerId: 'user-1',
  users: [{ id: 'user-1', name: 'Alex' }],
  activeBracket: null,
  archivedBrackets: [],
}

export const MOCK_ALBUMS = [album1, album2];
