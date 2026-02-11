import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AlbumShowdown_Key {
  id: UUIDString;
  __typename?: 'AlbumShowdown_Key';
}

export interface Album_Key {
  id: UUIDString;
  __typename?: 'Album_Key';
}

export interface CastVoteData {
  matchup_update?: Matchup_Key | null;
}

export interface CastVoteVariables {
  matchupId: UUIDString;
  winnerId: UUIDString;
}

export interface CreateAlbumShowdownData {
  albumShowdown_insert: AlbumShowdown_Key;
}

export interface CreateAlbumShowdownVariables {
  name: string;
  description: string;
  inviteCode: string;
}

export interface GetAlbumData {
  albums: ({
    id: UUIDString;
    title: string;
    artist: string;
    artworkUrl?: string | null;
  } & Album_Key)[];
}

export interface ListActiveAlbumShowdownsData {
  albumShowdowns: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    inviteCode?: string | null;
    createdAt: TimestampString;
  } & AlbumShowdown_Key)[];
}

export interface Matchup_Key {
  id: UUIDString;
  __typename?: 'Matchup_Key';
}

export interface ShowdownAlbum_Key {
  albumShowdownId: UUIDString;
  albumId: UUIDString;
  __typename?: 'ShowdownAlbum_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateAlbumShowdownRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAlbumShowdownVariables): MutationRef<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAlbumShowdownVariables): MutationRef<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;
  operationName: string;
}
export const createAlbumShowdownRef: CreateAlbumShowdownRef;

export function createAlbumShowdown(vars: CreateAlbumShowdownVariables): MutationPromise<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;
export function createAlbumShowdown(dc: DataConnect, vars: CreateAlbumShowdownVariables): MutationPromise<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;

interface ListActiveAlbumShowdownsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListActiveAlbumShowdownsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListActiveAlbumShowdownsData, undefined>;
  operationName: string;
}
export const listActiveAlbumShowdownsRef: ListActiveAlbumShowdownsRef;

export function listActiveAlbumShowdowns(): QueryPromise<ListActiveAlbumShowdownsData, undefined>;
export function listActiveAlbumShowdowns(dc: DataConnect): QueryPromise<ListActiveAlbumShowdownsData, undefined>;

interface CastVoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CastVoteVariables): MutationRef<CastVoteData, CastVoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CastVoteVariables): MutationRef<CastVoteData, CastVoteVariables>;
  operationName: string;
}
export const castVoteRef: CastVoteRef;

export function castVote(vars: CastVoteVariables): MutationPromise<CastVoteData, CastVoteVariables>;
export function castVote(dc: DataConnect, vars: CastVoteVariables): MutationPromise<CastVoteData, CastVoteVariables>;

interface GetAlbumRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAlbumData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAlbumData, undefined>;
  operationName: string;
}
export const getAlbumRef: GetAlbumRef;

export function getAlbum(): QueryPromise<GetAlbumData, undefined>;
export function getAlbum(dc: DataConnect): QueryPromise<GetAlbumData, undefined>;

