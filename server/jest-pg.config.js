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
            database: 'mazenet',
            host: '127.0.0.1',
            password: 'mz-db-pass',
            timeout: 2000,
            user: 'mazenet',
        }
    }
};
