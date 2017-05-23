# Api Reference
## v1

# Topics
 - [General API](#general-api)
    - [Id Types](#id-types)
    - [Room](#room)
    - [Structure](#structure)
       - [StructureData Types](#structuredata-types)
    - [CursorRecording](#cursorrecording)
    - [ActiveUser](#activeuser)
       - [PlatformData Types](#platformdata-types)
 - [Websocket API](#websocket-api)
    - [Receivable Events](#receivable-events)
    - [Emittable Events](#emittable-events)
    - [Transactions](#transactions)

# General API

## Id Types
128-bit UUID: `UserId`, `RoomId`, `StructureId`, `CursorRecordingId`

## Room

```typescript
{
    "id": RoomId,                                 //Unique room id
    "creator": UserId,                            //The id of the user who created the room,
    "title": string,                              //Room title
    "owners": {[id: UserId]: User},               //Map of users who are owners of this room
    "structures": {[id: StructureId]: Structure}, //Map of elements on the room
    "stylesheet": string                          //sanitized CSS for the room
}
```

## Structure

```typescript
{
    "id" : StructureId,
    "creator": UserId,
    "pos": //absolute position of the structure [0,1]
    {
        "x": number,
        "y": number
    }
    "data": StructureData
}
```

#### StructureData
```typescript
{
    "sType": string
    //...fields specific to this sType
}
```

### StructureData Types
#### Tunnel
```typescript
{
    "sType": "tunnel",
    "sourceId": RoomId,    //id of the room that created the tunnel
    "targetId": RoomId,    //id of the room this tunnel leads to
    "sourceText": string,  //display text when viewed in the source room
    "targetText": string   //display text when viewed in the target room
    
}
```

## CursorRecording
```typescript
{
    "id": CursorRecordingId,
    "userId": UserId,     //id of the user the cursor belongs to
    "frames": [{
        "pos":            //absolute position of the structure [0,1]
        {
            "x": number,
            "y": number
        },
        "t": number       //time step this frame occurred on
    ]}
}
```

## ActiveUser
```typescript
{
    "userId": UserId,
    "username": string,
    "platformData": PlatformData
}
```

#### PlatformData
```typescript
{
    "pType": string
    //...fields specific to this pType
}
```

### PlatformData Types
#### Desktop
```typescript
{
    "pType": "desktop",
    "cursorPos": //absolute position of the cursor [0,1]
        {
            "x": number,
            "y": number
        }
}
```

#### Mobile
```typescript
{
    "pType": "mobile"
}
```

# Websocket API Reference
The Websocket API is separated into two types of interactions--transactions and events.  
Transactions have the format described in [fresh-socketio-router](https://github.com/elliothatch/fresh-socketio-router). The
client emits requests with a specific format and recieves exactly one response from the server, emitted to the same route the
request was made on.

Events are subdivided into Receivable Events and Emittable Events. They have no predefined format, and tend to be "realtime" events, such as mouse movements.  

All routes not defined as events or transactions are treated as transaction routes, and will respond with `404 Not Found`.

The body for all transactions and events is a JSON object.

## Receivable Events

### `/rooms/updated`
Emitted when the room data was updated.

Body: A [room](#room) object, containing only fields that were updated.

### `/rooms/structures/created`
Emitted when an structure is created on the client's current room.

Body: The newly created [structure](#structure).

### `/rooms/structures/updated`
Emitted when an structure is updated on the client's current room.

Body:  A  [structure](#structure) object, containing the `id` and fields that were updated.

### `/rooms/active-users/entered`
Emitted when a user enters the client's current room

Body: The [ActiveUser](#active-user) that entered the room.

### `/rooms/active-users/exited`
Emitted when a user leaves the client's current room.

Body: The [ActiveUser](#active-user) that left the room.

### `/rooms/active-users/desktop/cursor-moved`
Emitted when another active user in the room moved their cursor.
Body: 
```typescript
{
    "userId": UserId,
    "pos": {
        "x": number,
        "y": number
    }
}
```

## Emittable Events
### `/rooms/active-users/desktop/cursor-moved`
Should be emitted whenever the client updates their state (e.g. moves their cursor).

Parameters:
```typescript
{
    "pos": {
        "x": number,
        "y": number
    }
}
```

## Transactions
Clients should issue each request with a unique value for the `X-Fresh-Request-Id` header, which will be present in the response headers so responses to the same multiple requests on the same route can be differentiated.

### `POST /users/connect`
Should be the first event emitted to the server on connection. Contains information about
the client's user account, as well as the root room id.

Request parameters: none

Responses:
 - `200`: Object containing user info:
```typescript
{
	"userId": UserId,    //the client's userId
	"rootRoomId": RoomId //the room id of the root room for all of mazenet
}
```

### `/rooms/enter`
Enter a room.

Request:
```typescript
{
	"roomId": RoomId //target room
}
```

Responses:
 - `200`: Successfully entered room:
```typescript
{
	"room": Room,
	"users": {[id: UserId]: ActiveUser} //active users in the room
}
```
 - `400`: Invalid request
 - `404`: Room not found

### `/rooms/update`
Update current room data.

Request:
```typescript
{
    "id": RoomId,
    "title": string?,                //optional
    "owners": {[id: UserId]: User}?, //optional
    "stylesheet": string?            //optional
}
```

Responses:
 - `200`: Room successfully updated. Responds with a [Room](#room) object, containing only fields that were updated.
Emits a `/rooms/updated` event is to all other users in the rooms.
 - `400`: Invalid request
 - `409`: User not in the room specified in `id`.

### `/rooms/structures/create`

Request:
```typescript
{
	"roomId": RoomId,
	"structure": Structure //omit the `id` and `creator` fields
}
```

Responses:
 - `201`: Structure was successfully created. Body contains the new [Structure](#structure).
Emits a `/rooms/structures/created` event to all other users in the room.
 - `400`: Invalid request
 - `409`: User not in a room containing the structure.

### `/rooms/structures/update`

Request: A [Structure](#structure) object containing `id` and any fields to be updated.

Responses:
 - `200`: Structure was successfully updated. Body contains the updated [Structure](#structure).
Emits a `/rooms/structures/updated` event to all other users in the room.
 - `400`: Invalid request
 - `409`: User not in a room containing the structure.

### `/rooms/cursor-recordings`

Request:
```typescript
{
	"roomId": RoomId,
	"cursorRecordingLimit": number?, //only get the n most recent recordings
	"format": "json" | "binary"     //specifies the response format
}
```

Responses:
 - `200`:
```typescript
{
	"cursorRecordings": {[id: CursorRecordingId]: CursorRecording}
}
```
 - `400`: Invalid request
