export class MazenetUtils {

    public static GetColorsForUUIDv4(uuid: string): string[] {
        let hex = uuid.split('-').join('');
        const out: string[] = [];
        while (hex.length > 0) {
            let col = hex.slice(0, 6);
            while (col.length < 6) {
                col = (col + col).slice(0, 6);
            }
            out.push('#' + col);
            hex = hex.substr(6);
        }
        return out;
    }
}