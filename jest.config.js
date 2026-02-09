module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    transformIgnorePatterns: [
        "node_modules/(?!(uuid)/)"
    ],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
    },
};