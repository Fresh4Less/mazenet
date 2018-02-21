/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class ErrorService {

    public static Warning(message: string, data?: any) {
        if (data) {
            console.error('WARNING ERROR: ', message, data);
        } else {
            console.error('WARNING ERROR: ', message);
        }
    }

    public static Fatal(message: string, data?: any) {
        if (data) {
            console.error('FATAL ERROR: ', message, data);
        } else {
            console.error('FATAL ERROR: ', message);
        }
    }
}