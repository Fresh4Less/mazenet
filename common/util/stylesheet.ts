import * as Css from 'css';
import * as SelectorParser from 'postcss-selector-parser';
import * as ValueParser from 'postcss-values-parser';
import * as CssWhitelist from './css-whitelist';
import * as Api from '../api';

import Stylesheet = Api.v1.Models.Stylesheet;
import StylesheetRule = Api.v1.Models.StylesheetRule;

/** A stylesheet we trust does not have malicious CSS */
export type SafeStylesheet = Stylesheet;

/** stringify a stylesheet
 * @argument stylesheet
 * @argument compact - if true, each rule will only take up a single line
 */
export function stylesheetToString(stylesheet: Stylesheet, compact?: boolean): string {
    return stylesheet.rules.map((rule) => stylesheetRuleToString(rule, compact))
        .join('\n');
}

/** stringify a stylesheet rule.
 * @argument rule
 * @argument compact - if true, the output will be a single line.
 */
export function stylesheetRuleToString(rule: StylesheetRule, compact?: boolean): string {
    const propertyStrings = Object.keys(rule.properties).map((propName: string) => {
        return `${propName}: ${rule.properties[propName]};`;
    });
    if(compact) {
        return `${rule.selectors.join(', ')} {${propertyStrings.join(' ')}}`;
    } else {
        return `${rule.selectors.join(', ')} {\n\t${propertyStrings.join('\n\t')}\n}`;
    }

}

/** remove selectors and properties that aren't whitelisted. prune empty rules
 * rules:
 *    don't allow at-rules like @media, @keyframe
 * selectors:
 *    only allow .classes and a subset of tags
 *    never allow ids, wildcards, attribute selectors, or pseudo-elements like ::before
 * only allow whitelisted properties
 * only allow whitelisted functions in property values, no at-values
 */
export function cleanStylesheet (stylesheet: Stylesheet): SafeStylesheet {
    const cleanStylesheet: Stylesheet = {
        rules: stylesheet.rules.reduce((safeRules: StylesheetRule[], rule: StylesheetRule) => {
            const safeSelectors = rule.selectors.reduce((safeSelectors: string[], selector: string) => {
                return safeSelectors.concat(cleanSelector(selector));
            }, []);

            const safeProperties = Object.keys(rule.properties).reduce((safeProps: {[name: string]:string}, propName: string) => {
                const value = rule.properties[propName];
                if(CssWhitelist.safeProperties.indexOf(propName.toLowerCase()) !== -1 && validatePropertyValue(value)) {
                    safeProps[propName] = value;
                }
                return safeProps;
            }, {});

            if(safeSelectors.length > 0 && Object.keys(safeProperties).length > 0) {
                safeRules.push({
                    selectors: safeSelectors,
                    properties: safeProperties
                });
            }
            return safeRules;
        }, [])
    };
    return cleanStylesheet;
}

export function validatePropertyValue(value: string): boolean {
    let ast: any;
    try {
        ast = ValueParser(value).parse();
    }
    catch(error) {
        return false;
    }

    let valid = true;
    // don't allow banned functions or at-words
    ast.walk((node: any) => {
        if(node.type === 'func') {
            if(CssWhitelist.safeFunctions.indexOf(node.value.toLowerCase()) === -1) {
                valid = false;
            }
        } else if(node.type === 'atword') {
            valid = false;
        }
    });
    ast.walkAtWords((node: any) => {
        valid = false;
    });

    return valid;
}

/** remove invalid and banned selectors, split up comma separated selectors
 * @returns Array of valid selectors
 */
export function cleanSelector(selector: string): string[] {
    const transform = (selectors: any) => {
        // only keep whitelisted tags
        selectors.walkTags((tag: any) => {
            if(CssWhitelist.safeSelectorTags.indexOf(tag.value) === -1) {
                tag.parent.remove();
            }
        });

        // delete forbidden selectors
        // - pseudo elements
        selectors.walkPseudos((pseudo: any) => {
            if(pseudo.value.startsWith('::')) {
                pseudo.parent.remove();
            }
        });
        // - attributes
        selectors.walkAttributes((attribute: any) => {
            attribute.parent.remove();
        });

        // - ids
        selectors.walkIds((id: any) => {
            id.parent.remove();
        });

        // - universals (*)
        selectors.walkUniversals((universal: any) => {
            universal.parent.remove();
        });
    }

    try {
        return SelectorParser(transform).processSync(selector as never /*@types broken*/).split(',').filter((css: string) => css.length > 0);
    }
    catch(error) {
        return [];
    }
}

export function parseCss(css: string): Stylesheet {
    const ast = Css.parse(css);
    return {
        rules: ast.stylesheet!.rules.filter((node) => ['rule'].indexOf(node.type!) !== -1)
        .map((rule: Css.Rule) => {
            return {
                selectors: rule.selectors!.filter((selector?: string) => (selector != null)),
                properties: rule.declarations!.reduce((props: {[name:string]: string}, declaration: Css.Declaration) => {
                    if(declaration.type === 'declaration') {
                        props[declaration.property!] = declaration.value!;
                    }
                    return props;
                }, {}),
            };
        })
    };
}
