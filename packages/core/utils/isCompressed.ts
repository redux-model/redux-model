function CustomModel() {}

export const isCompressed = typeof CustomModel.name === 'string' && CustomModel.name !== 'CustomModel';
