import {Observable} from 'rxjs/Observable';
import * as Express from 'express';
import * as Uuid from 'uuid/v4';

import * as Validator from '../util/validator';
import FreshSocketIO = require('../types/fresh-socketio-router');
import * as Api from '../api';

import {Position, NotFoundError} from '../common'
import {User} from '../user/user'

type Request = Express.Request | FreshSocketIO.Request;
type Response = Express.Response | FreshSocketIO.Response;

export class Room {
	id: Room.Id;
	creator: User.Id;
	title: string;
	owners: {[userId: string]: User};
	structures: {[structureId: string]: Structure};
	stylesheet: string;

	constructor(v1: Api.v1.Models.Room) {
		this.id = Uuid();
		this.creator = v1.creator;
		this.title = v1.title;
		this.owners = v1.owners;
		this.structures = Object.keys(v1.structures).reduce((o: {[structureId: string]: Structure}, s) => {
			o[s] = new Structure(v1.structures[s]);
			return o;
		}, {});
		this.stylesheet = v1.stylesheet;
	}
}
export namespace Room {
	export type Id = string;
}

export class Structure {
	id: Structure.Id;
	creator: User.Id;
	pos: Position;
	data: Structure.Data;

	constructor(v1: Api.v1.Models.Structure) {
		this.id = v1.id;
		this.creator = v1.creator;
		this.pos = v1.pos;
		this.data = v1.data;
	}

	toV1(): Api.v1.Models.Structure {
		return {
			id: this.id,
			creator: this.creator,
			pos: this.pos,
			data: this.data
		};
	}
}
export namespace Structure {
	export type Id = string;
	export type Data = Tunnel;

	export class Tunnel {
		sType: 'tunnel';
		sourceId: Room.Id;
		targetId: Room.Id;
		sourceText: string;
		targetText: string;
	}

}

export interface Options {
}

export class Middleware {
	static readonly defaultOptions = {};

	options: Options;
	service: Service;
	/** Universal router that can be used in express or fresh-socketio-router */
	router: Express.Router;

	constructor(service: Service, options?: Partial<Options>) {
		this.options = Object.assign({}, Middleware.defaultOptions, options);

		this.service = service;
		this.router = this.makeRouter(service);
	}

	makeRouter(service: Service): Express.Router {
		let router = Express.Router();
		router.post('enter', (req: Request, res: Response) => {
			let body = Validator.validateData(req.body, Api.v1.Routes.Rooms.Enter.Post.Request, 'body');
			return res.status(200).json({userId: 'user', rootRoomId: 'room'});
		});

		router.post('strutures/create', (req: Request, res: Response) => {
			let body: Api.v1.Routes.Rooms.Structures.Create.Post.Request = Validator.validateData(req.body, Api.v1.Routes.Rooms.Structures.Create.Post.Request, 'body');
			//TODO: get user from req (middleware)
			let user = new User({id: Uuid(), username: 'test'});
			service.createStructure(user, body.roomId, body.structure).subscribe((structure: Structure) => {
				return res.status(201).json(structure.toV1());
			});
		});

		return router;
	}
}

export interface Service {
	//enterRoom(user Api.Models.

	createRoom: (user: User, room: Api.v1.Routes.Rooms.Create.Post.Request) => Observable<Room>;
	createStructure: (user: User, roomId: Api.v1.Models.Room.Id, structure: Api.v1.Routes.Rooms.Structures.Create.Post.StructureBlueprint) => Observable<Structure>;
}

export class InMemoryService implements Service {
	rooms: Map<Room.Id, Room>;
	structures: Map<Structure.Id, Structure>;
	constructor() {
		this.rooms = new Map<Room.Id, Room>();
		this.structures = new Map<Structure.Id, Structure>();
	}

	createRoom(user: User, roomBlueprint: Api.v1.Routes.Rooms.Create.Post.Request) {
		let room = new Room({
			id: Uuid(),
			creator: user.id,
			title: roomBlueprint.title,
			owners: {[user.id]: user},
			structures: {},
			stylesheet: ''
		});
		this.rooms.set(room.id, room);
		return Observable.create(room);
	}
	
	createStructure(user: User, roomId: Api.v1.Models.Room.Id, structureBlueprint: Api.v1.Routes.Rooms.Structures.Create.Post.StructureBlueprint) {
		let room = this.rooms.get(roomId);
		if(!room) {
			throw new NotFoundError(`Room '${roomId}' not found`);
		}

		let structure = new Structure({
			id: Uuid(),
			creator: user.id,
			pos: structureBlueprint.pos,
			data: structureBlueprint.data,
		});
		this.structures.set(structure.id, structure);
		room.structures[structure.id] = structure;

		return Observable.create(structure);
	}
}
