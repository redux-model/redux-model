import { Middleware, compose, MiddlewareAPI, Dispatch } from 'redux';

export class DynamicMiddleware {
  protected readonly items: Record<string, Middleware> = {};
  protected dispatch?: any;

  create(): Middleware {
    this.resetCache();

    return (api) => (next) => (action) => {
      return this.getDispatch(api, next)(action);
    };
  }

  use(id: number | string, middleware: Middleware): this {
    this.resetCache();
    this.items[id] = middleware;

    return this;
  }

  protected resetCache() {
    this.dispatch = undefined;
  }

  protected getDispatch(api: MiddlewareAPI, next: Dispatch): Function {
    if (!this.dispatch) {
      const chain = Object.keys(this.items).map((key) => {
        return this.items[key](api);
      });
      this.dispatch = compose(...chain)(next);
    }

    return this.dispatch;
  }
}
