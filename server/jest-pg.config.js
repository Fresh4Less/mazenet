module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'**/test/**/*.test.ts'
	],
	testEnvironment: 'node',
	testEnvironmentOptions: {
		postgres: {
			connectionTimeoutMillis: 5000,
			database: 'mazenet',
			host: '127.0.0.1',
			max: 1,
			password: 'mz-db-pass',
			user: 'mazenet',
		}
	},
	testResultsProcessor: 'jest-junit'
};
