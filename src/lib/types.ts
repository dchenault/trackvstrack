export interface Track {
  id: string;
  name: string;
  trackNumber: number;
  previewUrl: string | null;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artworkUrl: string;
  tracks: Track[];
}

export interface Matchup {
  id: string;
  track1: Track | null;
  track2: Track | null;
  winner: Track | null;
  votes: {
    track1: number;
    track2: number;
  };
}

export interface Round {
  id: string;
  name: string;
  matchups: Matchup[];
}

export interface Bracket {
  id: string;
  album: Album;
  rounds: Round[];
  status: 'pending' | 'active' | 'complete';
  winner: Track | null;
}

export interface User {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  users: User[];
  activeBracket: Bracket | null;
  archivedBrackets: Bracket[];
}
