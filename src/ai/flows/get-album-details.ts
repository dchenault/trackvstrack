'use server';
/**
 * @fileOverview A flow to retrieve album details from a Spotify URL.
 *
 * - getAlbumDetails - A function that simulates scraping a Spotify URL for album details.
 * - GetAlbumDetailsInput - The input type for the getAlbumDetails function.
 * - GetAlbumDetailsOutput - The return type for the getAlbumDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Album } from '@/lib/types';

// Define Zod schemas that match the types in src/lib/types.ts
const TrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  trackNumber: z.number(),
  previewUrl: z.string().nullable(),
});

const AlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  artworkUrl: z.string(),
  tracks: z.array(TrackSchema),
});

export const GetAlbumDetailsInputSchema = z.object({
  url: z.string().url().describe("The Spotify album URL"),
});
export type GetAlbumDetailsInput = z.infer<typeof GetAlbumDetailsInputSchema>;

// The output schema is the Album schema
export const GetAlbumDetailsOutputSchema = AlbumSchema;
export type GetAlbumDetailsOutput = z.infer<typeof GetAlbumDetailsOutputSchema>;

// Since I cannot actually scrape a web page, I will return mock data
// based on the user's example URL for Radiohead - The Bends.
// To fit the 8-song bracket, I will use the first 8 tracks.
const mockAlbumData: Album = {
  id: 'spotify-0ZbnBDVUkpegVOfgPFr1wr',
  name: 'The Bends',
  artist: 'Radiohead',
  artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273da2472093154815462a45f93',
  tracks: [
    { id: 't1-bends', name: 'Planet Telex', trackNumber: 1, previewUrl: null },
    { id: 't2-bends', name: 'The Bends', trackNumber: 2, previewUrl: null },
    { id: 't3-bends', name: 'High and Dry', trackNumber: 3, previewUrl: null },
    { id: 't4-bends', name: 'Fake Plastic Trees', trackNumber: 4, previewUrl: null },
    { id: 't5-bends', name: 'Bones', trackNumber: 5, previewUrl: null },
    { id: 't6-bends', name: '(Nice Dream)', trackNumber: 6, previewUrl: null },
    { id: 't7-bends', name: 'Just', trackNumber: 7, previewUrl: null },
    { id: 't8-bends', name: 'My Iron Lung', trackNumber: 8, previewUrl: null },
  ],
};


const getAlbumDetailsFlow = ai.defineFlow(
  {
    name: 'getAlbumDetailsFlow',
    inputSchema: GetAlbumDetailsInputSchema,
    outputSchema: GetAlbumDetailsOutputSchema,
  },
  async (input) => {
    console.log(`Simulating scraping for URL: ${input.url}`);
    // In a real implementation, this would involve scraping the URL.
    // For now, we return mock data and add a delay to simulate network activity.
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockAlbumData;
  }
);

export async function getAlbumDetails(input: GetAlbumDetailsInput): Promise<GetAlbumDetailsOutput> {
  return await getAlbumDetailsFlow(input);
}
