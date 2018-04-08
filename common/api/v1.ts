/** Mazenet API v1 */
/**
 * NOTE: sometimes we want to use a model as a response, but aliasing classes doesn't fully work
 * we work around this limitation by extending the class we want to alias
 *        export class Response201 extends Models.User {};
 * see issue: https://github.com/Microsoft/TypeScript/issues/2559
 */
import * as Validator from '../util/validator';

export class ErrorResponse {
    /** HTTP status code */
    @Validator.validate()
    code: number;
    /** A short message describing the error */
    @Validator.validate()
    message: string;

    data?: Error.Data;
}

export namespace Error {
    export type Data = any;
}

export namespace Models {
    /** Absolute position on the page in range [0,1] */
    export class Position {
        @Validator.validate()
        x: number;
        @Validator.validate()
        y: number;
    }

    /** Mazenet user */
    export class User {
        @Validator.validate()
        id: User.Id;

        @Validator.validate()
        username: string;
    }

    export namespace User {
        /** 128-bit UUID/v4 */
        export type Id = string;
    }

    /** Describes the user client's platform */
    export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

    export namespace PlatformData {
        export class Desktop {
            @Validator.validate()
            pType: 'desktop';
            @Validator.validate()
            cursorPos: Position;
        }
        export namespace Desktop {
            export class Patch {
                @Validator.validate(true)
                cursorPos?: Position;
            }
        }

        export class Mobile {
            @Validator.validate()
            pType: 'mobile';
        }
    }

    /** Client session of a user */
    export class ActiveUser {
        @Validator.validate()
        id: ActiveUser.Id;
        @Validator.validate()
        userId: User.Id;
        @Validator.validate()
        username: string;
        @Validator.validate({union: {discriminant: 'pType', types: {
            'desktop': PlatformData.Desktop,
            'mobile': PlatformData.Mobile,
        }}})
        platformData: PlatformData;
    }

    export namespace ActiveUser {
        /** 128-bit UUID/v4 */
        export type Id = string;
    }

    /** A single rule in a stylesheet. e.g. 'a { color: blue; }' */
    export class StylesheetRule {
        @Validator.validate(false, String)
        selectors: string[];
        @Validator.validate()
        /** maps css property names to values */
        properties: { [name: string]: string };
    }

    /** css AST */
    export class Stylesheet {
        @Validator.validate(false, StylesheetRule)
        rules: StylesheetRule[];
    }

    /** Room that users can create and occupy */
    export class Room {
        @Validator.validate()
        id: Room.Id;
        /** Id of the user who created the room */
        @Validator.validate()
        creator: User.Id;
        @Validator.validate()
        title: string;
        /** set of owners of this room */
        @Validator.validate(false, String)
        owners: User.Id[];
        /** map of structures in the room */
        @Validator.validate()
        structures: { [structureId: string]: Structure };
        /** sanitized CSS for the room */
        @Validator.validate()
        stylesheet: Stylesheet;
    }

    export namespace Room {
        /** 128-bit UUID/v4 */
        export type Id = string;
        export class Patch {
            @Validator.validate(true)
            title?: string;
            @Validator.validate(true, String)
            owners?: User.Id[];
            @Validator.validate(true)
            stylesheet?: Stylesheet;
        }
    }

    /** Data specific to each type of structure */
    export type StructureData = StructureData.Tunnel | StructureData.Text;
    export namespace StructureData {
        export type Patch = StructureData.Tunnel.Patch | StructureData.Text.Patch;
    }

    export namespace StructureData {
        export class Tunnel {
            @Validator.validate()
            sType: 'tunnel';
            /** Id of the room that created the tunnel */
            @Validator.validate()
            sourceId: Room.Id;
            /** Id of the room this tunnel leads to */
            @Validator.validate()
            targetId: Room.Id;
            /** display text when viewed from the source room */
            @Validator.validate()
            sourceText: string;
            /** display text when viewed from the target room */
            @Validator.validate()
            targetText: string;
        }

        export namespace Tunnel {
            export class Patch {
                @Validator.validate(true)
                sourceText?: string;
                @Validator.validate(true)
                targetText?: string;
            }
        }

        export class Text {
            @Validator.validate()
            sType: 'text';
            /** id of the room where text is displayed */
            @Validator.validate()
            roomId: Room.Id;
            /** text contents of the textbox */
            @Validator.validate()
            text: string;
            /** percent width of the view */
            @Validator.validate()
            width: number;
        }

        export namespace Text {
            export class Patch {
                @Validator.validate(true)
                text?: string;
                @Validator.validate(true)
                width?: number;
            }
        }
    }

    export type StructureDataBlueprint = StructureDataBlueprint.Tunnel | StructureDataBlueprint.Text;

    export namespace StructureDataBlueprint {
        export class Tunnel {
            @Validator.validate()
            sType: 'tunnel';
            /** Id of the room that created the tunnel */
            @Validator.validate()
            sourceText: string;
            /** display text when viewed from the target room */
            @Validator.validate()
            targetText: string;
        }

        export class Text {
            @Validator.validate()
            sType: 'text';
            @Validator.validate()
            text: string;
            @Validator.validate()
            width: number;
        }
    }

    /* Structures like links and images that can be placed in a room */
    export class Structure {
        @Validator.validate()
        id: Structure.Id;
        /** Id of the user who created the structure */
        @Validator.validate()
        creator: User.Id;
        @Validator.validate()
        pos: Position;
        @Validator.validate({union: {discriminant: 'sType', types: {
            'tunnel': StructureData.Tunnel,
            'text': StructureData.Text,
        }}})
        data: StructureData;
    }

    export namespace Structure {
        /** 128-bit UUID/v4 */
        export type Id = string;

        export class Blueprint {
            @Validator.validate()
            pos: Models.Position;
            @Validator.validate()
            data: Models.StructureDataBlueprint;
        }
        export class Patch {
            @Validator.validate(true)
            pos?: Position;
            @Validator.validate({union: {types: {
                'tunnel': StructureData.Tunnel.Patch,
                'text': StructureData.Text.Patch,
            }}})
            data: StructureData.Patch;
        }
    }

    /* One frame of a cursor recording */
    export class CursorRecordingFrame {
        @Validator.validate()
        pos: Position;
        /** time step this frame occured on */
        @Validator.validate()
        t: number;
    }

    export class CursorRecording {
        @Validator.validate()
        id: CursorRecording.Id;
        /** id of the ActiveUser the cursor belongs to */
        @Validator.validate()
        activeUserId: ActiveUser.Id;
        @Validator.validate(false, CursorRecordingFrame)
        frames: CursorRecordingFrame[];
    }

    export namespace CursorRecording {
        /** 128-bit UUID/v4 */
        export type Id = string;
    }
}

export namespace Routes {
    /**
     * route: '/users'
     */
    export namespace Users {
        /**
         * route: '/users/create'
         */
        export namespace Create {
            /** Create a new user */
            export namespace Post {
                export class Request {
                    @Validator.validate()
                    username: string;
                }

                /** Information about the client's user account and the root room id. */
                export class Response201 extends Models.User {}
            }
        }
        /**
         * route: '/users/connect'
         */
        export namespace Connect {
            export const Route = '/users/connect';
            /** Connect to the mazenet and initiate a session.
             * Returns data about the user's account and the mazenet.
             * Should be the first event emitted to the server on connection.
             */
            export namespace Post {
                // TODO: check if this union type validates correctly
                export const Request = Models.PlatformData;

                /** Information about the client's user account and the root room id. */
                export class Response200 {
                    @Validator.validate()
                    activeUser: Models.ActiveUser;
                    @Validator.validate()
                    rootRoomId: Models.Room.Id;
                }
            }
        }
    }

    /**
     * route: '/rooms'
     */
    export namespace Rooms {
        /**
         * route: '/rooms/update'
         */
        export namespace Update {
            export const Route = '/rooms/update';
            export namespace Post {
                /** A Room containing `id` and any fields to be updated */
                export class Request {
                    @Validator.validate()
                    id: Models.Room.Id;
                    @Validator.validate()
                    patch: Models.Room.Patch;
                }

                /** Room succesfully updated. Emits a `/rooms/updated` event to all other users in the room. */
                export class Response200 extends Models.Room {}
                export type Response400 = any;
            }
        }
        /**
         * route: '/rooms/enter'
         */
        export namespace Enter {
            export const Route = '/rooms/enter';
            export namespace Post {
                export class Request {
                    @Validator.validate()
                    id: Models.Room.Id;
                }

                /** Successfully entered the room */
                export class Response200 {
                    @Validator.validate()
                    room: Models.Room;
                    @Validator.validate()
                    users: { [activeUserId: string]: Models.ActiveUser };
                }

                export type Response400 = any;
                export type Response404 = any;
            }
        }

        /**
         * route: '/rooms/structures'
         */
        export namespace Structures {
            /**
             * route: '/rooms/structures/create'
             */
            export namespace Create {
                export const Route = '/rooms/structures/create';
                export namespace Post {
                    export class Request {
                        @Validator.validate()
                        roomId: Models.Room.Id;
                        @Validator.validate()
                        structure: Models.Structure.Blueprint;
                    }

                    /**
                     * Structure successfully created. Emits a `/rooms/structures/created event to all other users in
                     * the room
                     */
                    export class Response201 extends Models.Structure {}
                    export type Response400 = any;
                }
            }
            /**
             * route: '/rooms/structures/update'
             */
            export namespace Update {
                export const Route = '/rooms/structures/update';
                export namespace Post {
                    /** A Structure containing `id` and any fields to be updated */
                    export class Request {
                        @Validator.validate()
                        id: Models.Structure.Id;
                        @Validator.validate()
                        patch: Models.Structure.Patch;
                    }

                    export class Response200 extends Models.Structure {}
                    export type Response400 = any;
                }
            }
        }

        /**
         * route: '/rooms/cursor-recordings'
         */
        export namespace CursorRecordings {
            export const Route = '/rooms/cursor-recordings';
            export namespace Get {
                export class Request {
                    @Validator.validate()
                    roomId: Models.Room.Id;
                    /** Only get the n most recent recordings */
                    @Validator.validate(true)
                    limit?: number;
                    /** Specifies the response format */
                    @Validator.validate(true)
                    format?: 'json' | 'binary'; // TODO: test this validates correctly
                }

                export class Response200 {
                    @Validator.validate()
                    cursorRecordings: { [cursorRecordingId: string]: Models.CursorRecording };
                }

                export class Response400 extends ErrorResponse {}
            }
        }
    }
}

export namespace Events {
    /** Events that are emitted by the server */
    export namespace Server {
        /**
         * route: '/rooms'
         */
        export namespace Rooms {
            /**
             * The room data was updated.
             */
            export class Updated extends Models.Room {
                static Route = '/rooms/updated';
            }
            export namespace Structures {
                /** A structure was created in the client's current room */
                export class Created {
                    static Route = '/rooms/structures/created';

                    @Validator.validate()
                    roomId: Models.Room.Id;
                    @Validator.validate()
                    structure: Models.Structure;
                }

                /**
                 * A structure was updated in the client's current room
                 */
                export class Updated {
                    static Route = '/rooms/structures/updated';

                    @Validator.validate()
                    roomId: Models.Room.Id;
                    @Validator.validate()
                    structure: Models.Structure;
                }
            }

            export namespace ActiveUsers {
                /** An ActiveUser entered the client's current room */
                export class Entered {
                    static Route = '/rooms/active-users/entered';

                    @Validator.validate()
                    roomId: Models.Room.Id;
                    @Validator.validate()
                    activeUser: Models.ActiveUser;
                }

                /** An ActiveUser exited the client's current room */
                export class Exited {
                    static Route = '/rooms/active-users/exited';

                    @Validator.validate()
                    roomId: Models.Room.Id;
                    @Validator.validate()
                    activeUserId: Models.ActiveUser.Id;
                }

                export namespace Desktop {
                    /** An ActiveUser moved their cursor in the client's current room */
                    export class CursorMoved {
                        static Route = '/rooms/active-users/desktop/cursor-moved';

                        @Validator.validate()
                        roomId: Models.Room.Id;
                        @Validator.validate()
                        activeUserId: Models.ActiveUser.Id;
                        @Validator.validate()
                        pos: Models.Position;
                    }
                }
            }
        }
    }

    /** Events that are emitted by the client */
    export namespace Client {
        export namespace Rooms.ActiveUsers.Desktop {
            /** Should be emitted whenever the client updates moves their cursor */
            export class CursorMoved {
                static Route = '/rooms/active-users/desktop/cursor-moved';

                @Validator.validate()
                pos: Models.Position;
            }
        }
    }
}
