# mazenet
social web spelunking

 - [General API Reference](#general-api-reference)
    - [Pages](#pages)
    - [Elements](#elements)
 - [REST API Reference](#rest-api-reference)
 - [Socket API Reference](#socket-api-reference)


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

## Elements

Create parameters:
 - `eType` [string]: element type
 - `pos` [object]: position of element on the page, in percent
    - `x` [number]
    - `y` [number]
 - `data` [object]: Data specific to the element type. See [Element Types](#element-types).

Response parameters:
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
This API is separated into two sections--emittable events and receivable events.
Emittable events are events that the client can send to the server, while
receivable events are events that are sent to the client from the server.
Some emitted events have a corresponding "response" event, which is only
documented in the "emittable events" entry for the event.

Response events take the form `path:response`, where `path` is the path of the
emitted event, and `response` is the type of response. Common response types are
`success` and `failure`.

Every `failure` response is an object guaranteed to have the following fields:
 - `status`: An HTTP error code
 - `message`: A message describing the error

## Emittable Events

### `/pages/enter`
Enter a page.

Parameters:
 - `pId` [pageId]: the page to enter
 - `pos` [object]: the position the client is entering at
    - `x` [number]
    - `y` [number]

Responses:

`pages/enter:success`

Parameters:
 - `page` [[page](#pages)]
 - `users` [array]: a list of users in the page
    - `uId`: the users's id
    - `pos` [object]: current cursor position
       - `x` [number]
       - `y` [number]

`pages/enter:failure`

### `pages/update`
Update page data.

Parameters (all optional):
 - `permissions` [string]: Permissions level of the page. Allowed values:
                           `all`, `links`, `none`
 - `title` [string]: Page title
 - `background` [object]
    - `bType`: The type of background: Allowed values: `color`
    - `data`: Type-specific background data
 - `owners` [array of userId]: an array of users who are owners of this page

Responses:
`pages/update:failure`

### `pages/elements/create`

Parameters:
Element object. See [Element API Reference](#element).

Responses:

If the element was successfully created, a `pages/elements/created` event is
emitted to all users in the page. See [Receivable Events](#receivable-events).

`pages/elements/create:failure`

### `pages/cursors/moved`
Should be emitted whenever the client moves their cursor.

Parameters:
 - `pos` [object]
    - `x` [number]
    - `y` [number]
 - `t` [number]: the current frame tick (1/30 seconds since entering the page
                 (temporary, will be set by server in the future)

## Receivable Events

### `users/connected`
Emitted when the client has been assigned a userId. Contains information about
the client's user account, as well as the root page id.

Parameters:
 - `uId` [userId]: the client's user id
 - `rootPageId` [pageId]: the pageId of the root page for all of mazenet

### `users/connected:failure`
Emitted when the user fails to connect and recieve a userId

### `pages/userEntered`
Emitted when a user enters the client's current page

Parameters:
 - `uId` [userId]: the user's id
 - `pos` [object]: the position the user has entered at
    - `x` [number]
    - `y` [number]

### `pages/userLeft`
Emitted when a user leaves the client's current page

Parameters:
 - `uId` [userId]

### `pages/updated`
Emitted when the page data was upedated.

Parameters: A [page](#pages) object, containing only fields that were updated.

### `pages/elements/created`
Emitted when an element is created on the client's current page

Parameters: The newly created [element](#elements).

### `pages/cursors/moved`
Emitted when another user in the client's page moves their cursor.

Parameters:
 - `uId` [userId]
 - `pos` [object]
    - `x` [number]
    - `y` [number]
