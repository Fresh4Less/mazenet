/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class ErrorService {

    public static Warning(message: string, data?: any) {
        if (data) {
            console.error('WARNING: ', message, data);
        } else {
            console.error('WARNING: ', message);
        }
    }

    public static Fatal(message: string, data?: any) {
        if (data) {
            console.error('FATAL: ', message, data);
        } else {
            console.error('FATAL: ', message);
        }
    }
}