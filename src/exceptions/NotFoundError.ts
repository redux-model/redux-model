export class NotFoundError extends ReferenceError {
  constructor(instanceName: string) {
    super(`[${instanceName}] Did you forget to register reducer to store?`);
  }
}
