jest.mock('@redux-model/core/src/utils/isCrushed');

const dev: { isCrushed: jest.MockInstance<boolean, any[]> } = require('@redux-model/core/src/utils/isCrushed');
dev.isCrushed.mockImplementation(() => true);

export const restoreCompressed = () => {
  jest.unmock('@redux-model/core/src/utils/isCrushed');
};
