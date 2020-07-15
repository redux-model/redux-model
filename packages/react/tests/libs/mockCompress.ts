jest.mock('../../src/core/utils/isCompressed');

const dev: { isCompressed: jest.MockInstance<boolean, any[]> } = require('../../src/core/utils/isCompressed');
dev.isCompressed.mockImplementation(() => true);

export const restoreCompressed = () => {
  jest.unmock('../../src/core/utils/isCompressed');
};
