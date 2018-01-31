import * as Validator from '../../src/util/validator';

//TODO: test Optional, test functions

class Primitives {
    @Validator.validate()
    enabled: boolean;
    @Validator.validate()
    count: number;
    @Validator.validate()
    name: string;

}

class PrimitivesArray {
    @Validator.validate(false, Boolean)
    flags: boolean[];
    @Validator.validate(false, Number, true)
    counts: number[];
    @Validator.validate(false, String)
    names: string[];
}

class Degree {
    @Validator.validate()
    subject: string;
    @Validator.validate()
    year: number;
}

class Librarian {
    @Validator.validate()
    name: string;
    @Validator.validate(false, Degree)
    degrees: Degree[];
}

class Library {
    @Validator.validate()
    name: string;
    @Validator.validate(false, String)
    librarian: Librarian;
}

class Optional {
    @Validator.validate(true)
    enabled?: boolean;
    @Validator.validate(true)
    count?: number;
    @Validator.validate(true)
    name?: string;
}

describe('validate primitives', () => {
    test('valid input is accepted', () => {
        let input = {enabled: true, count: 10, name: 'elliot'};
        let primitives: Primitives = Validator.validateData(input, Primitives, 'input');
        expect(primitives).toBe(input);
    });

    test('invalid input is rejected', () => {
        //let validInput = {enabled: true, count: 10, name: 'elliot'};
        let inputs = [
            // missing required properties
            {enabled: true},
            {enabled: true, count: 10},
            {enabled: true, name: 'elliot'},
            {count: 10},
            {count: 10, name: 'elliot'},

            // wrong types
            {enabled: 'a', count: 10, name: 'elliot'},
            {enabled: true, count: false, name: 'elliot'},
            {enabled: true, count: 10, name: 1},
        ];

        inputs.forEach((input) => {
            expect(() => {
                Validator.validateData(input, Primitives, 'input');
            }).toThrow(TypeError);
        });
    });

    describe('arrays', () => {
        test('valid array input is accepted', () => {
            let inputs = [
                {flags: [true, false, true], counts: [0, 1], names: ['elliot']},
                {flags: [], counts: [0, null, undefined], names: []},
            ];

            inputs.forEach((input) => {
                let primitivesArray: PrimitivesArray = Validator.validateData(input, PrimitivesArray, 'input');
                expect(primitivesArray).toBe(input);
            });
        });

        test('invalid array input is rejected', () => {
            let inputs = [
                // incorrect types
                {flags: [true, 1, 'hi'], counts: [0, 1], names: ['elliot']},
                {flags: [true, false, true], counts: [false, 1], names: ['elliot']},
                {flags: [true, false, true], counts: [0, 1], names: [false]},
                // null values
                {flags: [true, null, true], counts: [0, 1], names: [false]},
                {flags: [true, false, true], counts: [0, 1], names: [undefined]},
            ];

            inputs.forEach((input) => {
                expect(() => {
                    Validator.validateData(input, Primitives, 'input');
                }).toThrow(TypeError);
            });
        });
    });

    describe('objects', () => {
        test('valid nested objects', () => {
            let inputs = [
                {
                    name: 'montlake', librarian: {
                        name: 'sam', degrees: [
                            {subject: 'cs', year: 2017}, {subject: 'mba', year: 2024}]
                    }
                },
            ];

            inputs.forEach((input) => {
                let library: Library = Validator.validateData(input, Library, 'input');
                expect(library).toBe(input);
            });
        });

        test('invalid nested objects', () => {
            let inputs = [
                {
                    name: 2, librarian: {
                        name: 'sam', degrees: [
                            {subject: 'cs', year: 2017}, {subject: 'mba', year: 2024}]
                    }
                },
                {
                    name: 'montlake', librarian: {
                        name: [] degrees: [
                            {subject: 'cs', year: 2017}, {subject: 'mba', year: 2024}]
                    }
                },
                {
                    name: 'montlake', librarian: {
                        name: 'sam', degrees: [
                            {subject: null, year: 2017}, {subject: 'mba', year: 2024}]
                    }
                },
                {
                    name: 'montlake', librarian: {
                        name: 'sam', degrees: [
                            {subject: 'cs', year: 2017}, {subject: 'mba', year: '0 ad'}]
                    }
                },
                {name: 'montlake', librarian: {name: 'sam', degrees: null}},
                {name: 'montlake', librarian: [1, 2, 3]},
            ];

            inputs.forEach((input) => {
                expect(() => {
                    Validator.validateData(input, Library, 'input');
                }).toThrow(TypeError);
            });
        });
    });
});
