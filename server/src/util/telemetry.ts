/**
 * Telemetry
 * record execution time and behavior by tagging class methods
 * ```
 *    class Client {
 *      // track execution time only
 *      @Record()
 *      calculate() {}
 *
 *      // async observables
 *      @Record()
 *      connect() {return Observable.of(10).delay(1);}
 *
 *      // Record function arguments and return value
 *      @Record({args: true, returnValue: true})
 *      add(a, b) {return a+b;}
 *
 *      // returnValue works asynchronously too
 *      @Record({returnValue: true})
 *      addAsync(a, b) {return Observable.of(a+b);}
 *    }
 *  ```
 */

import * as Path from 'path';
import { performance } from 'perf_hooks';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { GlobalLogger } from './logger';

export interface RecordOptions {
    args: boolean;
    // TODO: accept a transformation function
    returnValue: boolean;

    name?: string;
    tags?: string[];

    recordFunc: (name: string, reading: Reading) => void;
}

/** mutate this object to change global settings */
export const GlobalTelemetryOptions: { enabled: boolean; defaultRecordOptions: RecordOptions; } = {
    defaultRecordOptions: {
        args: false,
        returnValue: false,

        recordFunc: (name, reading) => { GlobalLogger.telem(name, reading); },
    },
    enabled: false,
};

/** Describes one function call */
export interface Reading {
    /** milliseconds from invocation until completion
     * if the function returned an observable, time until an event is observed
     */
    duration: number;
    /** milliseconds between invocation and function return */
    syncDuration: number;
    /** semantic tags can be used to annotate and group recorings */
    tags: string[];

    /** arguments passed to the fuunction call */
    args?: any[];
    /** if the function returned an observable, the first event observed (non-recursive) */
    returnValue?: any;
}

export function Record(options?: Partial<RecordOptions>) {
    const opts = Object.assign(Object.create(GlobalTelemetryOptions.defaultRecordOptions), options);
    return (proto: any, propertyKey: string, descriptor: any) => {
        const name = opts.name || [proto.constructor.name, propertyKey].join('.');

        const originalFunc = descriptor.value;
        descriptor.value = function(...args: any[]) {
            if(!GlobalTelemetryOptions.enabled) {
                return originalFunc.apply(this, arguments);
            }

            const startTime = performance.now();
            let returnValue = originalFunc.apply(this, arguments);
            const syncEndTime = performance.now();

            const syncDuration = syncEndTime - startTime;

            const writeRecord = (duration: number, retVal: any) => {
                const reading: Reading = {
                    duration,
                    syncDuration,
                    tags: opts.tags,
                };
                if(opts.args) {
                    reading.args = args;
                }
                if(opts.returnValue) {
                    reading.returnValue = retVal;
                }

                opts.recordFunc(name, reading);
            };

            if(returnValue instanceof Observable) {
                returnValue = returnValue.pipe(
                    tap((n) => {
                        const asyncEndTime = performance.now();
                        writeRecord(asyncEndTime - startTime, n);
                    })
                );
            } else {
                writeRecord(syncDuration, returnValue);
            }

            return returnValue;
        };

        return descriptor;
    };
}
