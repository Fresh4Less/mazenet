# mazenet
social web spelunking
 - [Server Reference](#server-reference)
 - [General API Reference](#general-api-reference)
    - [Pages](#pages)
    - [Elements](#elements)
 - [REST API Reference](#rest-api-reference)
 - [Socket API Reference](#socket-api-reference)


# Server Reference

## Command line arguments

### `--logLevel=[level]`
Highest level the access logger should print to stdout (in JSON form). Thrown errors will always
be printed to stderr, regardless of this value.

Allowed values:
 - `info`
 - `error`
 - `none`

It can be useful to set this to `none` while debugging.

# General API Reference

## Pages

Response parameters:
 - `_id` [pageId]: The page id
 - `creator` [userId]: The id of the user who created the page
 - `permissions` [string]: Permissions level of the page. Allowed values:
                           `all`, `links`, `none`
 - `title` [string]: Page title
 - `background` [object]
    - `bType`: The type of background: Allowed values: `color`
    - `data`: Type-specific background data
 - `owners` [array of userId]: an array of users who are owners of this page
 - `elements` [array of [elements](#elements)]: an array of elements on the page
 - `cursors` [array of [cursors](#cursors)]: an array of cursors on this page

## Elements

Create parameters:
 - `eType` [string]: element type
 - `pos` [object]: position of element on the page, in percent
    - `x` [number]
    - `y` [number]
 - `data` [object]: Data specific to the element type. See [Element Types](#element-types).

Response parameters:
 - `_id` [elementId]: element id
 - `eType` [string]: element type
 - `creator` [userId]: id of the user who created the element
 - `pos` [object]: position of element on the page, in percent
    - `x` [number]
    - `y` [number]
 - `data` [object]: Data specific to the element type. See [Element Types](#element-types).

## Element Types
### link

Request fields: 
 - `text` [string]: hyperlink text, and the name of the new page to be created

Response fields:
 - `text` [string]: hyperlink text
 - `pId` [pageId]: the page this link points to

## Cursors

 - `uId` [userId]: id of the user this cursor belongs to
 - `frames [array of frames]: each frame is an object with the following properties:
    - `pos` [object]: position of cursor on the page, in percent
       - `x` [number]
       - `y` [number]
    - `t` [number]: time step this frame occurred on


# REST API Reference

## `GET pages/:pageId`
Get a page.

Responses:
 - `200`: The requested [page](#pages).
 - `400`: Invalid pageId
 - `404`: Page not found.

## `POST pages/:pageId/elements`
Create an element on a page

Url parameters:
 - `pageId` [pageId]: The page to add an element onto

Body parameters:
 - `eType` [string]: name of the element type
 - `creator` [userId]
 - `pos` [object]
    - `x` [number]
    - `y` [number]
 - `data` [object]: data specific to the element type

Responses:
 - `201`: The created [element](#elements).
 - `400`: Invalid request
 - `404`: Page not found

# Socket API Reference
The Socket API is separated into two types of interactions--transactions and events.  
Transactions have the format described in [fresh-socketio-router](https://github.com/elliothatch/fresh-socketio-router). The
client emits requests with a specific format and recieves exactly one response from the server, emitted to the same route the
request was made on.

Events are subdivided into Receivable Events and Emittable Events. They have no predefined format, and tend to be "realtime" events, such as mouse movements.  

All routes not defined as events or transactions are treated as transaction routes, and will respond with `404 Not Found`.

The body for all transactions and events is a JSON object.

## Receivable Events

### `/pages/userEntered`
Emitted when a user enters the client's current page

Parameters:
 - `uId` [userId]: the user's id
 - `pos` [object]: the position the user has entered at
    - `x` [number]
    - `y` [number]

### `/pages/userLeft`
Emitted when a user leaves the client's current page.

Parameters:
 - `uId` [userId]

### `/pages/updated`
Emitted when the page data was updated.

Parameters: A [page](#pages) object, containing only fields that were updated.

### `/pages/elements/created`
Emitted when an element is created on the client's current page.

Parameters: The newly created [element](#elements).

### `/pages/cursors/moved`
Emitted when another user in the client's page moves their cursor.

Parameters:
 - `uId` [userId]
 - `pos` [object]
    - `x` [number]
    - `y` [number]

## Emittable Events
### `/pages/cursors/moved`
Should be emitted whenever the client moves their cursor.

Parameters:
 - `pos` [object]
    - `x` [number]
    - `y` [number]
 - `t` [number]: the current frame tick (1/30 seconds since entering the page
                 (temporary, will be set by server in the future)

## Transactions
Clients should issue each request with a unique value for the `X-Fresh-Request-Id` header, which will be present in the
response headers so responses to the same multiple requests on the same route can be differentiated.

### `/users/connect`
Should be the first event emitted to the server on connection. Contains information about
the client's user account, as well as the root page id.

Request parameters: none

Responses:
 - `200`: Object containing user info:
    - `uId` [userId]: the client's user id
    - `rootPageId` [pageId]: the pageId of the root page for all of mazenet

### `/pages/enter`
Enter a page.

Request parameters:
 - `pId` [pageId]: the page to enter
 - `pos` [object]: the position the client is entering at
    - `x` [number]
    - `y` [number]

Responses:
 - `200`: Successfully entered page. Body contains relevant data:
    - `page` [[page](#pages)]
    - `users` [array]: a list of users in the page
       - `uId`: the users's id
       - `pos` [object]: current cursor position
          - `x` [number]
          - `y` [number]
 - `400`: Invalid request
 - `404`: Page not found

### `/pages/update`
Update current page data.

Request parameters (all optional):
 - `permissions` [string]: Permissions level of the page. Allowed values:
                           `all`, `links`, `none`
 - `title` [string]: Page title
 - `background` [object]
    - `bType`: The type of background: Allowed values: `color`
    - `data`: Type-specific background data
 - `owners` [array of userId]: an array of users who are owners of this page

Responses:
 - `200`: Page successfully updated. Responds with a [page](#pages) object, containing only fields that were updated.
Additionally, a `/pages/updated` event is emitted to all other users in the page.
 - `400`: Invalid request
 - `409`: User not on a page.

### `/pages/elements/create`

Request parameters:
Element object. See [Element API Reference](#element).

Responses:
 - `200`: Element was successfully created. Responds with the newly created [element](#elements).
Emits a `/pages/elements/created` event to all other users in the page.
 - `400`: Invalid request
 - `409`: User not on a page.

