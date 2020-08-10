/** Mazenet API v1 */
/**
 * NOTE: sometimes we want to use a model as a response, but aliasing classes doesn't fully work
 * we work around this limitation by extending the class we want to alias
 *        export class Response201 extends Models.User {};
 * see issue: https://github.com/Microsoft/TypeScript/issues/2559
 */
import { validate } from 'fresh-validation';

export class ErrorResponse {
    /** HTTP status code */
    @validate()
    code!: number;
    /** A short message describing the error */
    @validate()
    message!: string;

    data?: Error.Data;
}

export namespace Error {
    export type Data = any;
}

export namespace Models {
    /** Absolute position on the page in range [0,1] */
    export class Position {
        @validate()
        x!: number;
        @validate()
        y!: number;
    }

    /** A standarized set of profile information used for authentication
     */
    export class Profile {
        /** provider that the user authenticates with, e.g. email, google, facebook */
        @validate()
        provider!: string;
        /** a unique id identifying the user. in mazenet scheme, this is username
         * otherwise, it is an id provided by the provider */
        @validate()
        id!: string;
        @validate(true)
        displayName?: string;
    }

    export class User {
        @validate()
        id!: User.Id;
        @validate()
        username!: string;
        /** email used for password recovery, notifications */
        @validate(true)
        email?: string;
    }

    export namespace User {
        /** 128-bit UUID/v4 */
        export type Id = string;
    }

    /** Describes the user client's platform */
    export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

    export namespace PlatformData {
        export class Desktop {
            @validate()
            pType!: 'desktop';
            @validate()
            cursorPos!: Position;
        }
        export namespace Desktop {
            export class Patch {
                @validate(true)
                cursorPos?: Position;
            }
        }

        export class Mobile {
            @validate()
            pType!: 'mobile';
        }
    }

    /** Client session of a user */
    export class ActiveUser {
        @validate()
        id!: ActiveUser.Id;
        @validate()
        userId!: User.Id;
        @validate()
        username!: string;
        @validate({union: {discriminant: 'pType', types: {
            'desktop': PlatformData.Desktop,
            'mobile': PlatformData.Mobile,
        }}})
        platformData!: PlatformData;
    }

    export namespace ActiveUser {
        /** 128-bit UUID/v4 */
        export type Id = string;
    }

    /** A single rule in a stylesheet. e.g. 'a { color: blue; }' */
    export class StylesheetRule {
        @validate(false, String)
        selectors!: string[];
        @validate()
        /** maps css property names to values */
        properties!: { [name: string]: string };
    }

    /** css AST */
    export class Stylesheet {
        @validate(false, StylesheetRule)
        rules!: StylesheetRule[];
    }

    /** Room that users can create and occupy */
    export class Room {
        @validate()
        id!: Room.Id;
        /** Id of the user who created the room */
        @validate()
        creator!: User.Id;
        @validate()
        title!: string;
        /** set of owners of this room */
        @validate(false, String)
        owners!: User.Id[];
        /** map of structures in the room */
        @validate()
        structures!: { [structureId: string]: Structure };
        /** sanitized CSS for the room */
        @validate()
        stylesheet!: Stylesheet;
    }

    export namespace Room {
        /** 128-bit UUID/v4 */
        export type Id = string;
        export class Patch {
            @validate(true)
            title?: string;
            @validate(true, String)
            owners?: User.Id[];
            @validate(true)
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
            @validate()
            sType!: 'tunnel';
            /** Id of the room that created the tunnel */
            @validate()
            sourceId!: Room.Id;
            /** Id of the room this tunnel leads to */
            @validate()
            targetId!: Room.Id;
            /** display text when viewed from the source room */
            @validate()
            sourceText!: string;
            /** display text when viewed from the target room */
            @validate()
            targetText!: string;
        }

        export namespace Tunnel {
            export class Patch {
                @validate(true)
                sourceText?: string;
                @validate(true)
                targetText?: string;
            }
        }

        export class Text {
            @validate()
            sType!: 'text';
            /** id of the room where text is displayed */
            @validate()
            roomId!: Room.Id;
            /** text contents of the textbox */
            @validate()
            text!: string;
            /** percent width of the view */
            @validate()
            width!: number;
        }

        export namespace Text {
            export class Patch {
                @validate(true)
                text?: string;
                @validate(true)
                width?: number;
            }
        }
    }

    export type StructureDataBlueprint = StructureDataBlueprint.Tunnel | StructureDataBlueprint.Text;

    export namespace StructureDataBlueprint {
        export class Tunnel {
            @validate()
            sType!: 'tunnel';
            /** Id of the room that created the tunnel */
            @validate()
            sourceText!: string;
            /** display text when viewed from the target room */
            @validate()
            targetText!: string;
        }

        export class Text {
            @validate()
            sType!: 'text';
            @validate()
            text!: string;
            @validate()
            width!: number;
        }
    }

    /* Structures like links and images that can be placed in a room */
    export class Structure {
        @validate()
        id!: Structure.Id;
        /** Id of the user who created the structure */
        @validate()
        creator!: User.Id;
        @validate()
        pos!: Position;
        @validate({union: {discriminant: 'sType', types: {
            'tunnel': StructureData.Tunnel,
            'text': StructureData.Text,
        }}})
        data!: StructureData;
    }

    export namespace Structure {
        /** 128-bit UUID/v4 */
        export type Id = string;

        export class Blueprint {
            @validate()
            pos!: Models.Position;
            @validate()
            data!: Models.StructureDataBlueprint;
        }
        export class Patch {
            @validate(true)
            pos?: Position;
            @validate({union: {types: {
                'tunnel': StructureData.Tunnel.Patch,
                'text': StructureData.Text.Patch,
            }}})
            data!: StructureData.Patch;
        }
    }

    /* One frame of a cursor recording */
    export class CursorRecordingFrame {
        @validate()
        pos!: Position;
        /** time step this frame occured on */
        @validate()
        t!: number;
    }

    export class CursorRecording {
        @validate()
        id!: CursorRecording.Id;
        /** id of the ActiveUser the cursor belongs to */
        @validate()
        activeUserId!: ActiveUser.Id;
        @validate(false, CursorRecordingFrame)
        frames!: CursorRecordingFrame[];
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
         * route: '/users/register'
         */
        export namespace Register {
            export const Route = '/users/register';
            /** Register a new user with an email and password. HTTP only */
            export namespace Post {
                export class Request {
                    @validate()
                    username!: string;
                    @validate()
                    password!: string;
                }

                export class Response201 extends Models.User {}
                export class Response409 extends ErrorResponse {}
            }
        }

        export namespace Login {
            export const Route = '/users/login';
            /** authenticate the user with username and password
             * only valid over HTTP (no websockets)
             * on successful login, sets "authorizationToken" cookie
             */
            export namespace Post {
                export class Request {
                    @validate()
                    username!: string;
                    @validate()
                    password!: string;
                }

                export class Response200 extends Models.User {}
                export class Response401 extends ErrorResponse {}
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
                // TODO: check if this union type @validates correctly
                export class Request {
                    @validate({union: {discriminant: 'pType', types: {
                        'desktop': Models.PlatformData.Desktop,
                        'mobile': Models.PlatformData.Mobile,
                    }}})
                    platformData!: Models.PlatformData;
                }

                /** Information about the client's user account and the root room id. */
                export class Response200 {
                    @validate()
                    user!: Models.User;
                    @validate()
                    activeUser!: Models.ActiveUser;
                    @validate()
                    rootRoomId!: Models.Room.Id;
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
                    @validate()
                    id!: Models.Room.Id;
                    @validate()
                    patch!: Models.Room.Patch;
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
                    @validate()
                    id!: Models.Room.Id;
                }

                /** Successfully entered the room */
                export class Response200 {
                    @validate()
                    room!: Models.Room;
                    @validate()
                    users!: { [activeUserId: string]: Models.ActiveUser };
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
                        @validate()
                        roomId!: Models.Room.Id;
                        @validate()
                        structure!: Models.Structure.Blueprint;
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
                        @validate()
                        id!: Models.Structure.Id;
                        @validate()
                        patch!: Models.Structure.Patch;
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
                    @validate()
                    roomId!: Models.Room.Id;
                    /** Only get the n most recent recordings. If 0, get all recordings */
                    @validate(true)
                    limit?: number;
                    /** Specifies the response format */
                    @validate(true)
                    format?: 'json' | 'binary'; // TODO: test this @validates correctly
                }

                export class Response200 {
                    @validate()
                    cursorRecordings!: { [cursorRecordingId: string]: Models.CursorRecording };
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

                    @validate()
                    roomId!: Models.Room.Id;
                    @validate()
                    structure!: Models.Structure;
                }

                /**
                 * A structure was updated in the client's current room
                 */
                export class Updated {
                    static Route = '/rooms/structures/updated';

                    @validate()
                    roomId!: Models.Room.Id;
                    @validate()
                    structure!: Models.Structure;
                }
            }

            export namespace ActiveUsers {
                /** An ActiveUser entered the client's current room */
                export class Entered {
                    static Route = '/rooms/active-users/entered';

                    @validate()
                    roomId!: Models.Room.Id;
                    @validate()
                    activeUser!: Models.ActiveUser;
                }

                /** An ActiveUser exited the client's current room */
                export class Exited {
                    static Route = '/rooms/active-users/exited';

                    @validate()
                    roomId!: Models.Room.Id;
                    @validate()
                    activeUserId!: Models.ActiveUser.Id;
                }

                export namespace Desktop {
                    /** An ActiveUser moved their cursor in the client's current room */
                    export class CursorMoved {
                        static Route = '/rooms/active-users/desktop/cursor-moved';

                        @validate()
                        roomId!: Models.Room.Id;
                        @validate()
                        activeUserId!: Models.ActiveUser.Id;
                        @validate()
                        pos!: Models.Position;
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

                @validate()
                pos!: Models.Position;
            }
        }
    }
}
