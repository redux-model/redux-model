export class NullReducerError extends ReferenceError {
  constructor(instanceName: string) {
    super(`[${instanceName}] It seems like this model has no reducer data.`);
  }
}
