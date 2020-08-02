import * as Validator from '../common/util/validator';

//TODO: test Optional, test functions

class Primitives {
    @Validator.validate()
    enabled!: boolean;
    @Validator.validate()
    count!: number;
    @Validator.validate()
    name!: string;

}

class PrimitivesArray {
    @Validator.validate(false, Boolean)
    flags!: boolean[];
    @Validator.validate({arrayType: Number, arrayOptional:true})
    counts!: number[];
    @Validator.validate(false, String)
    names!: string[];
}

class Degree {
    @Validator.validate()
    subject!: string;
    @Validator.validate()
    year!: number;
}

class Librarian {
    @Validator.validate()
    name!: string;
    @Validator.validate(false, Degree)
    degrees!: Degree[];
}

class Library {
    @Validator.validate()
    name!: string;
    @Validator.validate(false, String)
    librarian!: Librarian;
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

        inputs.forEach((input, index) => {
            expect(() => {
                Validator.validateData(input, Primitives, `input-${index}`);
            }).toThrow(TypeError);
        });
    });

    describe('arrays', () => {
        test('valid array input is accepted', () => {
            let inputs = [
                {flags: [true, false, true], counts: [0, 1], names: ['elliot']},
                {flags: [], counts: [0, null, undefined], names: []},
            ];

            inputs.forEach((input, index) => {
                let primitivesArray: PrimitivesArray = Validator.validateData(input, PrimitivesArray, `input-${index}`);
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

            inputs.forEach((input, index) => {
                expect(() => {
                    Validator.validateData(input, Primitives, `input-${index}`);
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

            inputs.forEach((input, index) => {
                let library: Library = Validator.validateData(input, Library, `input-${index}`);
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
                        name: [], degrees: [
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

            inputs.forEach((input, index) => {
                expect(() => {
                    Validator.validateData(input, Library, `input-${index}`);
                }).toThrow(TypeError);
            });
        });
    });
});

class Apple {
    @Validator.validate()
    kind!: 'apple';
    @Validator.validate()
    name!: string;
}

class Banana {
    @Validator.validate()
    kind!: 'banana';
    @Validator.validate()
    count!: number;
}

class Coconut {
    @Validator.validate()
    kind!: 'coconut';
    @Validator.validate()
    cracked!: boolean;
}

type Fruit = Apple | Banana | Coconut;

class FruitBasket {
    @Validator.validate()
    color!: string;
    @Validator.validate({union: {discriminant: 'kind', types: {
        'apple': Apple,
        'banana': Banana,
        'coconut': Coconut,
    }}})
    fruit!: Fruit;
}

describe('discriminated union', () => {
    test('valid union types are accepted', () => {
        let inputs = [
            {color: 'red', fruit: {kind: 'apple', name: 'granny smith'}},
            {color: 'yellow', fruit: {kind: 'banana', count: 4}},
            {color: 'brown', fruit: {kind: 'coconut', cracked: false}},
        ];

        inputs.forEach((input, index) => {
            let fruitBasket: FruitBasket = Validator.validateData(input, FruitBasket, `input-${index}`);
            expect(fruitBasket).toBe(input);
        });
    });

    test('invalid union types', () => {
        let inputs = [
            {color: 'red', fruit: {kind: 'apple', name: 123}},
            {color: 'yellow', fruit: {kind: 'apple', count: 4}},
            {color: 'brown', fruit: {cracked: false}},
            {color: null, fruit: {kind: 'apple', name: 'granny smith'}},
            {color: 'orange', fruit: undefined},
            {color: 'green', fruit: {kind: 'lettuce'}},
        ];

        inputs.forEach((input, index) => {
            expect(() => {
                Validator.validateData(input, FruitBasket, `input-${index}`);
            }).toThrow(TypeError);
        });
    });
});

class Grandparent {
    @Validator.validate()
    name!: string;
}

class Parent extends Grandparent {
    @Validator.validate(true)
    job?: string;
}

class Child extends Parent {
    @Validator.validate()
    toys!: number;
}
type PersonConstructor = Validator.Constructor<Grandparent | Parent | Child>;

describe('inheritance', () => {
    test('valid objects are accepted', () => {
        let inputs: Array<[any, Grandparent | Parent | Child]> = [
            [{name: 'alice'}, Grandparent],
            [{name: 'alpha', job: 123, toys: 'matches'}, Grandparent],
            [{name: 'beth'}, Parent],
            [{name: 'beth2', job: 'farmer'}, Parent],
            [{name: 'carol', job: 'miner', toys: 5}, Child],
            [{name: 'dan', toys: 5}, Child],
        ];

        inputs.forEach(([input, inputConstructor], index) => {
            let validatedInput = Validator.validateData(input, inputConstructor as PersonConstructor, `input-${index}`);
            expect(validatedInput).toBe(input);
        });
    });

    test('invalid objects', () => {
        let inputs = [
            [{name: false}, Grandparent],
            [{job: 'farmer'}, Parent],
            [{name: 'beth', job: 123}, Parent],
            [{name: 'carol', job: 'miner', toys: null}, Child],
            [{name: 666, toys: 5}, Child],
        ];

        inputs.forEach(([input, inputConstructor], index) => {
            expect(() => {
                Validator.validateData(input, inputConstructor as PersonConstructor, `input-${index}`);
            }).toThrow(TypeError);
        });
    });
});
