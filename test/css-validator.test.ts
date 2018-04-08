import { cleanStylesheet, parseCss, SafeStylesheet, stylesheetToString } from '../common/util/stylesheet';
import * as Api from '../common/api';
import Stylesheet = Api.v1.Models.Stylesheet;

interface TestData<I,O> {
    name: string;
    input: I;
    expected: O;
}

type CleanTestData = TestData<Stylesheet, SafeStylesheet | undefined>;
type ParseTestData = TestData<string, Stylesheet>;

describe('clean', () => {
    describe('valid input is unaffected', () => {
        const inputs: Stylesheet[] = [{
            rules: [{
                selectors: ['a'],
                properties: {
                    'background': 'linear-gradient(#f00, #0f0)',
                    'color': 'rgb(0,0,255)',
                }
            }],
        }, {
            rules: [{
                selectors: ['div', 'div:hover', 'div a', 'span>span>span', '.myclass', '.a .b'],
                properties: {
                    'color': 'blue',
                }
            }],
        }];
        inputs.forEach((input) => {
            test(stylesheetToString(input, true), () => {
                const output = cleanStylesheet(input);
                expect(output).toEqual(input);
            });
        });
    });

    describe('invalid input is cleaned up', () => {
        const inputs: CleanTestData[] = [{
            name: 'a',
            input: {
                rules: [{
                    selectors: ['a', 'li:hover', 'bad', '#id', '*'],
                    properties: {
                        'color': 'blue',
                        'padding': '10px',

                        'x': '-1000px',
                        'flex': '1 20px',
                        'margin': 'eval("abc")',
                    }
                }]
            },
            expected: {
                rules: [{
                    selectors: ['a', 'li:hover'],
                    properties: {
                        'color': 'blue',
                        'padding': '10px',
                    }
                }]
            }
        }, {
            name: 'selectors',
            input: {
                rules: [{
                    selectors: ['bad', '#id', '*', 'p::after', 'a[href="/hi"]', ',', '"'],
                    properties: {
                        'color': 'blue',
                    }
                }]
            },
            expected: {rules: []}
        }, {
            name: 'properties',
            input: {
                rules: [{
                    selectors: ['a'],
                    properties: {
                        'left': '0px',
                        'background': 'url("https://bad")',
                        'color': '@red',
                        'border': '"',
                    }
                }]
            },
            expected: {rules: []}
        }];
        inputs.forEach(({name, input, expected}) => {
            test(name, () => {
                const output = cleanStylesheet(input);
                expect(output).toEqual(expected);
            });
        });
    });

    describe('invalid input is cleaned up', () => {
        const inputs: Stylesheet[] = [{
            rules: [{
                selectors: ['bad', '#id', '*', 'p::after', 'a[href="/hi"]', ',', '"'],
                properties: {
                    'color': 'blue',
                }
            }]
        }, {
            rules: [{
                selectors: ['a'],
                properties: {
                    'left': '0px',
                    'background': 'url("https://bad")',
                    'color': '@red',
                    'border': '"',
                }
            }]
        }];

        inputs.forEach((input) => {
            const output = cleanStylesheet(input);
            expect(output).toEqual({rules: []});
        });
    });
});

describe('parse', () => {
    describe('valid input is accepted', () => {
        const inputs: ParseTestData[] = [{
            name: 'body',
            input: 'body { font-size: 12px; }',
            expected: {
                rules: [{
                    selectors: ['body'],
                    properties: {'font-size': '12px'},
                }]
            }
        }];
        inputs.forEach(({name, input, expected}) => {
            test(name, () => {
                const output = parseCss(input);
                expect(output).toEqual(expected);
            });
        });
    });
});
