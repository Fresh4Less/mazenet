/**
 * Method decorator to validate the type of a value and its properties at runtime
 * validateData(data, Class) throws a TypeError if the runtime types of any properties
 * annotated with @validate() do not match their Typescript types
 * Uses emitDecoratorMetadata to provide Typescript type information at runtime
 *
 * Caveats:
 *  - Does not work with `extends`. Properties on the prototype chain are not checked
 *  - Optional types must be indicated by passing `true` as the first argument to @validate
 *  - Array element type must be passed as the second argument to @validate
 *
 * Usage:
 * ```
 * class A {
 *    @validate()
 *    count: number;
 *
 *    @validate()
 *    options: MyClass;
 *
 *    @validate() //only validates if add is a function (no param checking)
 *    add: (a: number, b: number) => number;
 *
 *    @validate(true) // optional
 *    name?: string;
 *
 *    @validate(false, string) // array element type must be passed
 *    names: string[];
 *
 *    @validate(false, number, true) // array elements may be unefined/null
 *    sums: number[];
 * }
 *
 * let a:A = validateData({count: 10, ...}, A);
 * ```
 */
import 'reflect-metadata';

/** store a map of property names that need to be validated */
const validateProps = Symbol('_validateProps');

interface Constructor<T> {
    new(): T;
}

export interface TypeInfo {
    typeConstructor: Constructor<any>;
    optional?: boolean;
    arrayType?: Constructor<any>;
    /** allow null elements in the array */
    arrayOptional?: boolean;
}

/**
 * Method decorator factory
 * @param optional - if true, null/undefined values will not throw a TypeError
 * @param arrayType - if annotating an array, this must be the array element type
 * @param arrayOptional - if annotating an array and this argument is true, null/undefined elements of the array will not throw a TypeError
 */
export function validate(optional?: boolean, arrayType?: Constructor<any>, arrayOptional?: boolean) {
    return (target: any, propertyKey: string) => {
        let typeConstructor = Reflect.getMetadata('design:type', target, propertyKey);
        if (!target[validateProps]) {
            target[validateProps] = new Map<string, TypeInfo>();
        }

        target[validateProps].set(propertyKey, {typeConstructor, optional, arrayType, arrayOptional});
    };
}

/**
 * Validate that a value matches the expected type.
 * Objects and arrays are recursively validated
 * @param data - The value to validate
 * @param expected - the expected type, or a TypeInfo object with the expected type and extra type information
 * @param variableName - name used in TypeError messages
 * @return - The data parameter that succeeded validation, cast to the expected type
 */
export function validateData<T, C extends Constructor<T>>(data: any, expected: C | TypeInfo, variableName: string): T {
    // if expected is missing typeConstructor, is must be of  type C--create a TypeInfo based on it
    if (data == null) {
        if (expected && (<any>expected).optional) {
            return data;
        }

        let expectedTypeName = (<C>expected).name || ((<TypeInfo>expected).typeConstructor && (<TypeInfo>expected).typeConstructor.name);
        throw new TypeError(`required property ${variableName} is null; expected ${expectedTypeName}`);
    }

    let expectedTypeData: TypeInfo = (<any>expected).typeConstructor ? <TypeInfo>expected : {typeConstructor: <C>expected};

    switch (typeof data) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'function':
            if (data.constructor !== expectedTypeData.typeConstructor) {
                throw new TypeError(`property ${variableName} is ${data.constructor.name}; expected ${expectedTypeData.typeConstructor.name}`);
            }
            break;
        case 'object':
            if (data.constructor === Array) {
                if (data.constructor !== expectedTypeData.typeConstructor) {
                    throw new TypeError(`property ${variableName} is ${data.constructor.name}; expected ${expectedTypeData.typeConstructor.name}`);
                }

                // check array elements
                if (!expectedTypeData.arrayType) {
                    throw new MissingTypeDataError(`property ${variableName} is an array, but no array type data was provided (to fix this error, add the expected type of the array to the @validate decorator. array of 'any' is not currently supported).`);
                }

                data.forEach((element: any, i: number) => {
                    validateData(element, {
                        typeConstructor: expectedTypeData.arrayType!,
                        optional: expectedTypeData.arrayOptional
                    }, `${variableName}[${i}]`);
                });
            }
            else {
                let propertyTypeMap: Map<string, TypeInfo> = expectedTypeData.typeConstructor.prototype[validateProps];
                if (!propertyTypeMap) {
                    // no @validate properties
                    return data;
                }

                for (let [pName, pTypeData] of propertyTypeMap) {
                    validateData(data[pName], pTypeData, `${variableName}.${pName}`);
                }
            }
            break;
        default:
            throw new TypeError(`unrecognized typeof ${variableName}: ${typeof data}`);
    }
    return data;
}

/** The validator was missing type information required to fully validate the type.
 * Fix this error by passing needed information to the decotrator for the type you are trying to validate.
 */
export class MissingTypeDataError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, MissingTypeDataError.prototype);
    }
}
