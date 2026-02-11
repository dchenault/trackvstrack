import { CreateAlbumShowdownData, CreateAlbumShowdownVariables, ListActiveAlbumShowdownsData, CastVoteData, CastVoteVariables, GetAlbumData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateAlbumShowdown(options?: useDataConnectMutationOptions<CreateAlbumShowdownData, FirebaseError, CreateAlbumShowdownVariables>): UseDataConnectMutationResult<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;
export function useCreateAlbumShowdown(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAlbumShowdownData, FirebaseError, CreateAlbumShowdownVariables>): UseDataConnectMutationResult<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;

export function useListActiveAlbumShowdowns(options?: useDataConnectQueryOptions<ListActiveAlbumShowdownsData>): UseDataConnectQueryResult<ListActiveAlbumShowdownsData, undefined>;
export function useListActiveAlbumShowdowns(dc: DataConnect, options?: useDataConnectQueryOptions<ListActiveAlbumShowdownsData>): UseDataConnectQueryResult<ListActiveAlbumShowdownsData, undefined>;

export function useCastVote(options?: useDataConnectMutationOptions<CastVoteData, FirebaseError, CastVoteVariables>): UseDataConnectMutationResult<CastVoteData, CastVoteVariables>;
export function useCastVote(dc: DataConnect, options?: useDataConnectMutationOptions<CastVoteData, FirebaseError, CastVoteVariables>): UseDataConnectMutationResult<CastVoteData, CastVoteVariables>;

export function useGetAlbum(options?: useDataConnectQueryOptions<GetAlbumData>): UseDataConnectQueryResult<GetAlbumData, undefined>;
export function useGetAlbum(dc: DataConnect, options?: useDataConnectQueryOptions<GetAlbumData>): UseDataConnectQueryResult<GetAlbumData, undefined>;
