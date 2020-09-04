/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

/**
 * Wrapper for console errors, alerting, and potentially forwarding errors back
 * to the server.
 **/
export class ErrorService {

    public static Warning(message: string, data?: any) {
        console.error('WARNING: ', message, data);
        if (data) {
            
        } else {
            console.error('WARNING: ', message);
        }
    }

    public static Fatal(message: string, data?: any) {
        alert('FATAL ERROR! Check console.');
        console.error('FATAL: ', message, data);
    }
}