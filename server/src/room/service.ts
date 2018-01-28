import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import * as Uuid from 'uuid/v4';

import * as Api from '../api';

import {NotFoundError} from '../common'
import {DataStore} from './datastore';
import {Room, Structure} from './models';
import {User} from '../user/models';

export class Service {
	dataStore: DataStore;

	constructor(dataStore: DataStore) {
		this.dataStore = dataStore;
	}

	initRootRoom(): Observable<Room> {
		let rootUser = {
			id: Uuid(),
			username: 'mazenet'
		};

		return this.createRoom(rootUser, {title: 'mazenet'})
		.mergeMap((room: Room) => {
			return Observable.forkJoin(Observable.of(room), this.dataStore.setRootRoomId(room.id));
		}).mergeMap(([room]: [Room, null]) => {
			return Observable.of(room);
		});
	}

	getRootRoom(): Observable<Room> {
		return this.dataStore.getRootRoom()
		.catch((err: Error) => {
			if(err instanceof NotFoundError) {
				return this.initRootRoom();
			}
			throw err;
		});
	}

	createRoom(user: User, roomBlueprint: Api.v1.Routes.Rooms.Create.Post.Request): Observable<Room> {
		let room = new Room({
			id: Uuid(),
			creator: user.id,
			title: roomBlueprint.title,
			owners: {[user.id]: user},
			structures: {},
			stylesheet: ''
		});

		return this.dataStore.insertRoom(room);
	}
	
	createStructure(user: User, roomId: Api.v1.Models.Room.Id, structureBlueprint: Api.v1.Routes.Rooms.Structures.Create.Post.StructureBlueprint): Observable<Structure> {
		return this.dataStore.getRoom(roomId).mergeMap((room: Room) => {
			let structure = new Structure({
				id: Uuid(),
				creator: user.id,
				pos: structureBlueprint.pos,
				data: structureBlueprint.data,
			});

			room.structures[structure.id] = structure;
			return Observable.forkJoin(this.dataStore.insertStructure(structure), Observable.of(room));
		}).mergeMap(([structure, room]: [Structure, Room]) => {
			return Observable.forkJoin(Observable.of(structure), this.dataStore.updateRoom(room));
		}).mergeMap(([structure, room]: [Structure, Room]) => {
			return Observable.of(structure);
		});
	}
}
