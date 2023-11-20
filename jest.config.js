import path from 'path';
console.log(path.resolve(`./test/setup.js`));
export default {
    testEnvironment: 'jest-environment-node',
    transform: {},
    setupFilesAfterEnv: path.resolve(`./test/setup.js`),
};