export class StoreNotFoundError extends ReferenceError {
  constructor() {
    super('Store is not found. Did you forget to use createReduxStore instead of createStore');
  }
}
