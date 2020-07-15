function CustomModel() {}

const compressed = typeof CustomModel.name === 'string' && CustomModel.name !== 'CustomModel';

export const isCompressed = () => compressed;
