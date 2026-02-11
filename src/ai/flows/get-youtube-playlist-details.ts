'use server';
/**
 * @fileOverview A flow to retrieve playlist details from a YouTube URL.
 *
 * - getYoutubePlaylistDetails - A function that simulates scraping a YouTube URL for playlist details.
 * - GetYoutubePlaylistDetailsInput - The input type for the getYoutubePlaylistDetails function.
 * - GetYoutubePlaylistDetailsOutput - The return type for the getYoutubePlaylistDetails function.
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

export const GetYoutubePlaylistDetailsInputSchema = z.object({
  url: z.string().url().describe("The YouTube playlist URL"),
});
export type GetYoutubePlaylistDetailsInput = z.infer<typeof GetYoutubePlaylistDetailsInputSchema>;

// The output schema is the Album schema
export const GetYoutubePlaylistDetailsOutputSchema = AlbumSchema;
export type GetYoutubePlaylistDetailsOutput = z.infer<typeof GetYoutubePlaylistDetailsOutputSchema>;

// Since I cannot actually call the YouTube API, I will return mock data.
// The artwork will be a placeholder from picsum.
const mockPlaylistData: Album = {
  id: 'youtube-pl-mock-1',
  name: 'Lo-fi Beats to Study To',
  artist: 'Various Artists',
  artworkUrl: 'https://picsum.photos/seed/lofi/400/400',
  tracks: [
    { id: 'yt1', name: 'Sunrise Lullaby', trackNumber: 1, previewUrl: null },
    { id: 'yt2', name: 'Midnight Commute', trackNumber: 2, previewUrl: null },
    { id: 'yt3', name: 'Rainy Day Reverie', trackNumber: 3, previewUrl: null },
    { id: 'yt4', name: 'Zenith', trackNumber: 4, previewUrl: null },
  ],
};


const getYoutubePlaylistDetailsFlow = ai.defineFlow(
  {
    name: 'getYoutubePlaylistDetailsFlow',
    inputSchema: GetYoutubePlaylistDetailsInputSchema,
    outputSchema: GetYoutubePlaylistDetailsOutputSchema,
  },
  async (input) => {
    console.log(`Simulating YouTube API call for URL: ${input.url}`);
    // In a real implementation, this would involve calling the YouTube Data API.
    // For now, we return mock data and add a delay to simulate network activity.
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockPlaylistData;
  }
);

export async function getYoutubePlaylistDetails(input: GetYoutubePlaylistDetailsInput): Promise<GetYoutubePlaylistDetailsOutput> {
  return await getYoutubePlaylistDetailsFlow(input);
}
