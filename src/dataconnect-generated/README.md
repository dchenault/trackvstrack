# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListActiveAlbumShowdowns*](#listactivealbumshowdowns)
  - [*GetAlbum*](#getalbum)
- [**Mutations**](#mutations)
  - [*CreateAlbumShowdown*](#createalbumshowdown)
  - [*CastVote*](#castvote)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListActiveAlbumShowdowns
You can execute the `ListActiveAlbumShowdowns` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listActiveAlbumShowdowns(): QueryPromise<ListActiveAlbumShowdownsData, undefined>;

interface ListActiveAlbumShowdownsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListActiveAlbumShowdownsData, undefined>;
}
export const listActiveAlbumShowdownsRef: ListActiveAlbumShowdownsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listActiveAlbumShowdowns(dc: DataConnect): QueryPromise<ListActiveAlbumShowdownsData, undefined>;

interface ListActiveAlbumShowdownsRef {
  ...
  (dc: DataConnect): QueryRef<ListActiveAlbumShowdownsData, undefined>;
}
export const listActiveAlbumShowdownsRef: ListActiveAlbumShowdownsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listActiveAlbumShowdownsRef:
```typescript
const name = listActiveAlbumShowdownsRef.operationName;
console.log(name);
```

### Variables
The `ListActiveAlbumShowdowns` query has no variables.
### Return Type
Recall that executing the `ListActiveAlbumShowdowns` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListActiveAlbumShowdownsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListActiveAlbumShowdownsData {
  albumShowdowns: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    inviteCode?: string | null;
    createdAt: TimestampString;
  } & AlbumShowdown_Key)[];
}
```
### Using `ListActiveAlbumShowdowns`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listActiveAlbumShowdowns } from '@dataconnect/generated';


// Call the `listActiveAlbumShowdowns()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listActiveAlbumShowdowns();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listActiveAlbumShowdowns(dataConnect);

console.log(data.albumShowdowns);

// Or, you can use the `Promise` API.
listActiveAlbumShowdowns().then((response) => {
  const data = response.data;
  console.log(data.albumShowdowns);
});
```

### Using `ListActiveAlbumShowdowns`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listActiveAlbumShowdownsRef } from '@dataconnect/generated';


// Call the `listActiveAlbumShowdownsRef()` function to get a reference to the query.
const ref = listActiveAlbumShowdownsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listActiveAlbumShowdownsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.albumShowdowns);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.albumShowdowns);
});
```

## GetAlbum
You can execute the `GetAlbum` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAlbum(): QueryPromise<GetAlbumData, undefined>;

interface GetAlbumRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAlbumData, undefined>;
}
export const getAlbumRef: GetAlbumRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAlbum(dc: DataConnect): QueryPromise<GetAlbumData, undefined>;

interface GetAlbumRef {
  ...
  (dc: DataConnect): QueryRef<GetAlbumData, undefined>;
}
export const getAlbumRef: GetAlbumRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAlbumRef:
```typescript
const name = getAlbumRef.operationName;
console.log(name);
```

### Variables
The `GetAlbum` query has no variables.
### Return Type
Recall that executing the `GetAlbum` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAlbumData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAlbumData {
  albums: ({
    id: UUIDString;
    title: string;
    artist: string;
    artworkUrl?: string | null;
  } & Album_Key)[];
}
```
### Using `GetAlbum`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAlbum } from '@dataconnect/generated';


// Call the `getAlbum()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAlbum();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAlbum(dataConnect);

console.log(data.albums);

// Or, you can use the `Promise` API.
getAlbum().then((response) => {
  const data = response.data;
  console.log(data.albums);
});
```

### Using `GetAlbum`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAlbumRef } from '@dataconnect/generated';


// Call the `getAlbumRef()` function to get a reference to the query.
const ref = getAlbumRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAlbumRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.albums);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.albums);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateAlbumShowdown
You can execute the `CreateAlbumShowdown` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAlbumShowdown(vars: CreateAlbumShowdownVariables): MutationPromise<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;

interface CreateAlbumShowdownRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAlbumShowdownVariables): MutationRef<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;
}
export const createAlbumShowdownRef: CreateAlbumShowdownRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAlbumShowdown(dc: DataConnect, vars: CreateAlbumShowdownVariables): MutationPromise<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;

interface CreateAlbumShowdownRef {
  ...
  (dc: DataConnect, vars: CreateAlbumShowdownVariables): MutationRef<CreateAlbumShowdownData, CreateAlbumShowdownVariables>;
}
export const createAlbumShowdownRef: CreateAlbumShowdownRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAlbumShowdownRef:
```typescript
const name = createAlbumShowdownRef.operationName;
console.log(name);
```

### Variables
The `CreateAlbumShowdown` mutation requires an argument of type `CreateAlbumShowdownVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAlbumShowdownVariables {
  name: string;
  description: string;
  inviteCode: string;
}
```
### Return Type
Recall that executing the `CreateAlbumShowdown` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAlbumShowdownData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAlbumShowdownData {
  albumShowdown_insert: AlbumShowdown_Key;
}
```
### Using `CreateAlbumShowdown`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAlbumShowdown, CreateAlbumShowdownVariables } from '@dataconnect/generated';

// The `CreateAlbumShowdown` mutation requires an argument of type `CreateAlbumShowdownVariables`:
const createAlbumShowdownVars: CreateAlbumShowdownVariables = {
  name: ..., 
  description: ..., 
  inviteCode: ..., 
};

// Call the `createAlbumShowdown()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAlbumShowdown(createAlbumShowdownVars);
// Variables can be defined inline as well.
const { data } = await createAlbumShowdown({ name: ..., description: ..., inviteCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAlbumShowdown(dataConnect, createAlbumShowdownVars);

console.log(data.albumShowdown_insert);

// Or, you can use the `Promise` API.
createAlbumShowdown(createAlbumShowdownVars).then((response) => {
  const data = response.data;
  console.log(data.albumShowdown_insert);
});
```

### Using `CreateAlbumShowdown`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAlbumShowdownRef, CreateAlbumShowdownVariables } from '@dataconnect/generated';

// The `CreateAlbumShowdown` mutation requires an argument of type `CreateAlbumShowdownVariables`:
const createAlbumShowdownVars: CreateAlbumShowdownVariables = {
  name: ..., 
  description: ..., 
  inviteCode: ..., 
};

// Call the `createAlbumShowdownRef()` function to get a reference to the mutation.
const ref = createAlbumShowdownRef(createAlbumShowdownVars);
// Variables can be defined inline as well.
const ref = createAlbumShowdownRef({ name: ..., description: ..., inviteCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAlbumShowdownRef(dataConnect, createAlbumShowdownVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.albumShowdown_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.albumShowdown_insert);
});
```

## CastVote
You can execute the `CastVote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
castVote(vars: CastVoteVariables): MutationPromise<CastVoteData, CastVoteVariables>;

interface CastVoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CastVoteVariables): MutationRef<CastVoteData, CastVoteVariables>;
}
export const castVoteRef: CastVoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
castVote(dc: DataConnect, vars: CastVoteVariables): MutationPromise<CastVoteData, CastVoteVariables>;

interface CastVoteRef {
  ...
  (dc: DataConnect, vars: CastVoteVariables): MutationRef<CastVoteData, CastVoteVariables>;
}
export const castVoteRef: CastVoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the castVoteRef:
```typescript
const name = castVoteRef.operationName;
console.log(name);
```

### Variables
The `CastVote` mutation requires an argument of type `CastVoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CastVoteVariables {
  matchupId: UUIDString;
  winnerId: UUIDString;
}
```
### Return Type
Recall that executing the `CastVote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CastVoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CastVoteData {
  matchup_update?: Matchup_Key | null;
}
```
### Using `CastVote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, castVote, CastVoteVariables } from '@dataconnect/generated';

// The `CastVote` mutation requires an argument of type `CastVoteVariables`:
const castVoteVars: CastVoteVariables = {
  matchupId: ..., 
  winnerId: ..., 
};

// Call the `castVote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await castVote(castVoteVars);
// Variables can be defined inline as well.
const { data } = await castVote({ matchupId: ..., winnerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await castVote(dataConnect, castVoteVars);

console.log(data.matchup_update);

// Or, you can use the `Promise` API.
castVote(castVoteVars).then((response) => {
  const data = response.data;
  console.log(data.matchup_update);
});
```

### Using `CastVote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, castVoteRef, CastVoteVariables } from '@dataconnect/generated';

// The `CastVote` mutation requires an argument of type `CastVoteVariables`:
const castVoteVars: CastVoteVariables = {
  matchupId: ..., 
  winnerId: ..., 
};

// Call the `castVoteRef()` function to get a reference to the mutation.
const ref = castVoteRef(castVoteVars);
// Variables can be defined inline as well.
const ref = castVoteRef({ matchupId: ..., winnerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = castVoteRef(dataConnect, castVoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.matchup_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.matchup_update);
});
```

