import { Styles } from '../components/styles/styles';

export class StylesService {
    private static _instance: StylesService;

    private stylePaneInstance: Styles | null = null;

    private constructor() {}

    public SetStructureWorkshopComponent(sp: Styles) {
        this.stylePaneInstance = sp;
    }

    public ActivateStylePane() {
        if (this.stylePaneInstance) {
            this.stylePaneInstance.Activate();
        }
    }

    public static get Instance(): StylesService {
        return this._instance || (this._instance = new StylesService());
    }
}