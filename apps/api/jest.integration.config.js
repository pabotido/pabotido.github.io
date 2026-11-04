const base = require('./jest.config.js');

module.exports = {
  ...base,
  testRegex: 'test/integration/.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/'],
};
