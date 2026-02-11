'use client';

const ADJECTIVES = [
  "Funky", "Groovy", "Cosmic", "Electric", "Retro", "Synth", "Neon",
  "Golden", "Diamond", "Silver", "Platinum", "Vinyl", "Acoustic",
  "Rhythmic", "Melodic", "Harmonic", "Lyrical", "Vibing", "Jazzy",
  "Rocking", "Indie", "Screaming", "Whispering", "Wailing", "Crooning",
  "Digital", "Analog", "Stereo", "Mono", "Heavy", "Light", "Dark", "Bright",
  "Psychedelic", "Fuzzy", "Distorted", "Clean", "Reverb", "Echo", "Phase",
  "Flanger", "Chorus", "Wah", "Major", "Minor", "Sad", "Happy", "Chill"
];

const NOUNS = [
  "Rider", "Voyager", "Dreamer", "Pilot", "Pioneer", "Bandit", "Ghost",
  "Knight", "Wizard", "Sorcerer", "King", "Queen", "Prince", "Princess",
  "Warrior", "Samurai", "Ninja", "Cowboy", "Spaceman", "Stardust",
  "Echo", "Reverb", "Delay", "Fuzz", "Distortion", "Wah", "Phaser", "Flanger",
  "Beat", "Rhythm", "Melody", "Harmony", "Chord", "Note", "Octave", "Scale",
  "Groove", "Jam", "Solo", "Riff", "Hook", "Verse", "Chorus", "Bridge",
  "Outro", "Intro", "Mix", "Master"
];

export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}
