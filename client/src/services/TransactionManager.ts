import Socket = SocketIOClient.Socket;
import { WebResponse } from '../models/freshIO/WebResponse';
import { ErrorService } from './ErrorService';

export default class TransactionManager {

    private requestResponseMap: { [id: string]: (response: WebResponse) => void};
    private event: string;

    constructor(socket: Socket, event: string) {
        this.requestResponseMap = {};
        this.event = event;

        socket.on(event, this.responseHandler.bind(this));
    }

    public AddTransactionListener(xFreshId: string, callback: (response: WebResponse) => void): void {
        if (this.requestResponseMap[xFreshId]) {
            ErrorService.Fatal(
                `Transaction Manager Attempted to create a transaction listener for x-fresh-id twice: ${xFreshId}`);
            return;
        }
        this.requestResponseMap[xFreshId] = callback;
    }

    private responseHandler(webResponse: WebResponse): void {
        const xFreshId = webResponse.headers['X-Fresh-Request-Id'];
        if (xFreshId && this.requestResponseMap[xFreshId]) {
            const cb = this.requestResponseMap[xFreshId];
            delete this.requestResponseMap[xFreshId];
            cb(webResponse);
        } else {
            ErrorService.Warning(
                `Transaction Manager for '${this.event}' received a web response it was not expecting: ${
                    xFreshId}`, webResponse);
        }
    }

}