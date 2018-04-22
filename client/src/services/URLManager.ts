import * as QueryString from 'query-string';
import { Models } from '../../../common/api/v1';

export default class URLManager {
    static ParseRoomId(): string | null {
        let urlParts = QueryString.parse(location.hash);
        return urlParts.room ? urlParts.room : null;
    }

    static UpdateRoomId(id: Models.Room.Id) {
        let urlParts = QueryString.parse(location.hash);
        urlParts.room = id;
        location.hash = QueryString.stringify(urlParts);
    }
}