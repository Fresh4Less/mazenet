import {Logger} from '../../src/util/logger';


test('log message', () => {
	let logs = [];
	let target = {name: 'test', write: (serializedData: string) => {
		logs.push(serializedData);
	}};
	let logger = new Logger({target, includeTimestamp: false});
	logger.info('hello');
	expect(logs.length).toBe(1);
	expect(JSON.parse(logs[0])).toEqual({level: 'info', message: 'hello'});
});
