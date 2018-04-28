import { StylePane } from '../components/stylePane/stylePane';

export class StylePaneService {
    private static _instance: StylePaneService;

    private stylePaneInstance: StylePane | null = null;

    private constructor() {}

    public SetStructureWorkshopComponent(sp: StylePane) {
        this.stylePaneInstance = sp;
    }

    public ActivateStylePane() {
        if (this.stylePaneInstance) {
            this.stylePaneInstance.Activate();
        }
    }

    public static get Instance(): StylePaneService {
        return this._instance || (this._instance = new StylePaneService());
    }
}