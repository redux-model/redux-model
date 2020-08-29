function CustomModel() {}

// The browsers which don't support Function.name should be considered as compressed.
const name = CustomModel.name;
const crushed = typeof name !== 'string' || name !== 'CustomModel';

export const isCrushed = () => crushed;
