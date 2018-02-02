import * as Validator from '../util/validator';

export namespace Models {
    /** Absolute position on the page in range [0,1] */
    export class Position {
        @Validator.validate()
        x: number;
        @Validator.validate()
        y: number;
    };

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

    /** Client session of a user */
    export class ActiveUser {
        @Validator.validate()
        id: ActiveUser.Id;
        @Validator.validate()
        userId: User.Id;
        @Validator.validate()
        username: string;
        @Validator.validate()
        platformData: ActiveUser.PlatformData;
    }

    export namespace ActiveUser {
        /** 128-bit UUID/v4 */
        export type Id = string;

        /** Describes the user client's platform */
        export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

        export enum PlatformDataTypes {
            Desktop = 'desktop',
            Mobile = 'mobile'
        };

        export namespace PlatformData {
            export class Desktop {
                @Validator.validate()
                pType: 'desktop';
                @Validator.validate()
                cursorPos: Position;
            }

            export class Mobile {
                @Validator.validate()
                pType: 'mobile';
            }
        }
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
        /** map of users who are owners of this room */
        @Validator.validate()
        owners: { [userId: string]: User };
        /** map of structures in the room */
        @Validator.validate()
        structures: { [structureId: string]: Structure };
        /** sanitized CSS for the room */
        @Validator.validate()
        stylesheet: string;
    }

    export namespace Room {
        /** 128-bit UUID/v4 */
        export type Id = string;
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
        @Validator.validate()
        data: Structure.Data;
    }

    export namespace Structure {
        /** 128-bit UUID/v4 */
        export type Id = string;
        /** Data specific to each type of structure */
        export type Data = Data.Tunnel;


        export namespace Data {
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
                export let Response201 = Models.User;
            }
        }
        /**
         * route: '/users/connect'
         */
        export namespace Connect {
            /** Connect to the mazenet and initiate a session.
             * Returns data about the user's account and the mazenet.
             * Should be the first event emitted to the server on connection.
             */
            export namespace Post {
                export let Request = Models.ActiveUser.PlatformData;

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
         * route: '/rooms/create'
         */
        export namespace Create {
            export namespace Post {
                /** Room blueprint  */
                export class Request {
                    @Validator.validate()
                    title: string;
                }

                /** Room succesfully updated. Emits a `/rooms/updated` event to all other users in the room. */
                export let Response200 = Models.Room;
                export let Response400 = {};
            }
        }

        /**
         * route: '/rooms/update'
         */
        export namespace Update {
            export namespace Post {
                /** A Room containing `id` and any fields to be updated */
                export class Request {
                    @Validator.validate()
                    id: Models.Room.Id;
                    @Validator.validate(true)
                    title?: string;
                    @Validator.validate(true)
                    owners?: { [userId: string]: Models.User };
                    @Validator.validate(true)
                    stylesheet?: string;
                }

                /** Room succesfully updated. Emits a `/rooms/updated` event to all other users in the room. */
                export let Response200 = Models.Room;
                export let Response400 = {};
            }
        }
        /**
         * route: '/rooms/enter'
         */
        export namespace Enter {
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
                    users: { [userId: string]: Models.ActiveUser };
                }

                export let Response400 = {};
                export let Response404 = {};
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
                export namespace Post {
                    export class StructureBlueprint {
                        @Validator.validate()
                        pos: Models.Position;
                        @Validator.validate()
                        data: Models.Structure.Data;
                    }

                    export class Request {
                        @Validator.validate()
                        roomId: Models.Room.Id;
                        @Validator.validate()
                        structure: StructureBlueprint;
                    }

                    /** Structure successfully created. Emits a `/rooms/structures/created event to all other users in the room */
                        //export type Response201 = Models.Structure;
                    export let Response201 = Models.Structure;
                    //export type Response201 = {};
                    export let Response400 = {};
                }
            }
            /**
             * route: '/rooms/structures/update'
             */
            export namespace Update {
                export namespace Post {
                    /** A Structure containing `id` and any fields to be updated */
                    export class Request {
                        @Validator.validate()
                        id: Models.Structure.Id;
                        @Validator.validate(true)
                        pos?: Models.Position;
                        //@Validator.validate()
                        // TODO: add validator support to allow all child properties to be optional
                        data?: Models.Structure.Data;
                    }

                    export let Response200 = Models.Structure;
                    export let Response400 = {};
                }
            }
        }

        /**
         * route: '/rooms/cursor-recordings'
         */
        export namespace CursorRecordings {
            export namespace Get {
                export class Request {
                    @Validator.validate()
                    roomId: Models.Room.Id;
                    /** Only get the n most recent recordings */
                    @Validator.validate(true)
                    cursorRecordingLimit?: number;
                    /** Specifies the response format */
                    @Validator.validate()
                    format: 'json' | 'binary'; //TODO: test this validates correctly
                }

                export class Response200 {
                    @Validator.validate()
                    cursorRecordings: { [cursorRecordingId: string]: Models.CursorRecording };
                }

                export let Response400 = {};
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
             * route: '/rooms/updated'
             * The room data was updated.
             */
            export let Updated = Models.Room;
            /**
             * route: '/rooms/structures'
             */
            export namespace Structures {
                /**
                 * route: '/rooms/structures/created'
                 * A structure was created in the client's current room
                 */
                export let Created = Models.Room;
                /**
                 * route: '/rooms/structures/updated'
                 * A structure was updated in the client's current room
                 */
                export let Updated = Models.Room;
            }

            /**
             * route: '/rooms/active-users'
             */
            export namespace ActiveUsers {
                /**
                 * route: '/rooms/active-users/entered'
                 * An ActiveUser entered the client's current room
                 */
                export let Entered = Models.ActiveUser;
                /**
                 * route: '/rooms/active-users/exited'
                 * An ActiveUser exited the client's current room
                 */
                export let Exited = Models.ActiveUser;
                /**
                 * route: '/rooms/active-users/desktop'
                 */
                export namespace Desktop {
                    /**
                     * route: '/rooms/active-users/desktop/cursor-moved'
                     * An ActiveUser moved their cursor in the client's current room
                     */
                    export class CursorMoved {
                        @Validator.validate()
                        userId: Models.User.Id;
                        @Validator.validate()
                        pos: Models.Position;
                    }
                }
            }
        }
    }

    /** Events that are emitted by the client */
    export namespace Client {
        /**
         * route: '/rooms/active-users/desktop'
         */
        export namespace Rooms.ActiveUsers.Desktop {
            /**
             * route: '/rooms/active-users/desktop/cursor-moved'
             * Should be emitted whenever the client updates moves their cursor
             */
            export class CursorMoved {
                @Validator.validate()
                pos: Models.Position;
            }
        }
    }
}

export class Error {
    /** HTTP status code */
    @Validator.validate()
    code: number;
    /** A short message describing the error */
    @Validator.validate()
    message: string;
    @Validator.validate(true)
    data?: Error.Data;
}

export namespace Error {
    export type Data = object;
}
