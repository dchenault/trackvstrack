const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-west4'
};
exports.connectorConfig = connectorConfig;

const createAlbumShowdownRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAlbumShowdown', inputVars);
}
createAlbumShowdownRef.operationName = 'CreateAlbumShowdown';
exports.createAlbumShowdownRef = createAlbumShowdownRef;

exports.createAlbumShowdown = function createAlbumShowdown(dcOrVars, vars) {
  return executeMutation(createAlbumShowdownRef(dcOrVars, vars));
};

const listActiveAlbumShowdownsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListActiveAlbumShowdowns');
}
listActiveAlbumShowdownsRef.operationName = 'ListActiveAlbumShowdowns';
exports.listActiveAlbumShowdownsRef = listActiveAlbumShowdownsRef;

exports.listActiveAlbumShowdowns = function listActiveAlbumShowdowns(dc) {
  return executeQuery(listActiveAlbumShowdownsRef(dc));
};

const castVoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CastVote', inputVars);
}
castVoteRef.operationName = 'CastVote';
exports.castVoteRef = castVoteRef;

exports.castVote = function castVote(dcOrVars, vars) {
  return executeMutation(castVoteRef(dcOrVars, vars));
};

const getAlbumRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAlbum');
}
getAlbumRef.operationName = 'GetAlbum';
exports.getAlbumRef = getAlbumRef;

exports.getAlbum = function getAlbum(dc) {
  return executeQuery(getAlbumRef(dc));
};
