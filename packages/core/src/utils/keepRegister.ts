import { BaseModel } from '../models/BaseModel';

const methodName = '_register';

/**
 * You want to run register method by yourself.
 * ```javascript
 * class TestModel extends Model {
 *   constructor() {
 *     const register = keepRegister(TestModel);
 *     super();
 *
 *     ...
 *     ...
 *
 *     register();
 *   }
 * }
 *
 * export const testModel = new TestModel();
 * ```
 */
export const keepRegister = (CustomModel: new (...args: any[]) => BaseModel<any>): () => void => {
  const proto = CustomModel.prototype;
  const originalRegister: Function = proto[methodName];
  let scope: BaseModel<any>;
  let called: boolean;

  // The model will always call _register()
  proto[methodName] = function() {
    scope = this;
    proto[methodName] = originalRegister;
  };

  return function() {
    if (called) {
      throw new Error(`[${CustomModel.name}] You are not allowed to call keeped register multiple times.`);
    }
    called = true;
    originalRegister.call(scope);
  };
};
