/*
 * The browsers which don't support Function.name should be considered as compressed.
 *
 * @link https://github.com/terser/terser
 * toplevel (default false) - set to true if you wish to enable top level variable
 * and function name mangling and to drop unused variables and functions.
 *
 * For ESM, don't put CustomModel to toplevel.
 */
const name = (() => {
  function CustomModel() {}
  return CustomModel.name;
});

const crushed = typeof name !== 'string' || name !== 'CustomModel';

export const isCrushed = () => crushed;
