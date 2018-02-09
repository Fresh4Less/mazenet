import { Observable } from 'rxjs/Observable';
import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { DataStore } from './datastore';
import { User, ActiveUser } from './models';

export class Service {
    dataStore: DataStore;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;
    }

    createUser(userBlueprint: Api.v1.Routes.Users.Create.Post.Request) {
        let user = new User({
            id: Uuid(),
            username: userBlueprint.username
        });

        return this.dataStore.insertUser(user);
    }

    createActiveUser(sessionId: string, user: Api.v1.Models.User, platformData: Api.v1.Models.PlatformData) {
        let activeUser = new ActiveUser({
            id: Uuid(),
            userId: user.id,
            username: user.username,
            platformData: platformData
        });

        return this.dataStore.insertActiveUser(activeUser)
            .map((activeUser: ActiveUser) => {
                return this.dataStore.insertActiveUserFromSession(sessionId, activeUser);
            });
    }

    getActiveUserFromSession(sessionId: string): ActiveUser | undefined {
        return this.dataStore.getActiveUserFromSession(sessionId);
    }

    onUserDisconnect(sessionId: string): void {
        this.dataStore.deleteActiveUserFromSession(sessionId);
    }
}
