import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-west4'
};

export const createAlbumShowdownRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAlbumShowdown', inputVars);
}
createAlbumShowdownRef.operationName = 'CreateAlbumShowdown';

export function createAlbumShowdown(dcOrVars, vars) {
  return executeMutation(createAlbumShowdownRef(dcOrVars, vars));
}

export const listActiveAlbumShowdownsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListActiveAlbumShowdowns');
}
listActiveAlbumShowdownsRef.operationName = 'ListActiveAlbumShowdowns';

export function listActiveAlbumShowdowns(dc) {
  return executeQuery(listActiveAlbumShowdownsRef(dc));
}

export const castVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CastVote', inputVars);
}
castVoteRef.operationName = 'CastVote';

export function castVote(dcOrVars, vars) {
  return executeMutation(castVoteRef(dcOrVars, vars));
}

export const getAlbumRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAlbum');
}
getAlbumRef.operationName = 'GetAlbum';

export function getAlbum(dc) {
  return executeQuery(getAlbumRef(dc));
}

