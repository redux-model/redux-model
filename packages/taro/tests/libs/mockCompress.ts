jest.mock('@redux-model/core/src/utils/isCompressed');

const dev: { isCompressed: jest.MockInstance<boolean, any[]> } = require('@redux-model/core/src/utils/isCompressed');
dev.isCompressed.mockImplementation(() => true);

export const restoreCompressed = () => {
  jest.unmock('@redux-model/core/src/utils/isCompressed');
};
