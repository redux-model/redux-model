export class NoMetaError extends ReferenceError {
  constructor(instanceName: string) {
    super(`[${instanceName}] You have been disabled meta for this action?`);
  }
}
