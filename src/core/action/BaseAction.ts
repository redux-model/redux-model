export abstract class BaseAction {
  protected readonly instanceName: string;

  protected successType: string;

  protected typePrefix: string;

  protected constructor(instanceName: string) {
    this.instanceName = instanceName;
    this.typePrefix = instanceName;
    this.successType = `${this.typePrefix} success`;
  }

  public getSuccessType(): string {
    return this.successType;
  }

  public setActionName(actionName: string | number) {
    this.typePrefix += `_${actionName}`;
    this.onTypePrefixChanged();
  }

  // Only public method is required.
  protected proxy(fn: Function, publicMethods: string[], publicProperties: string[]) {
    const handles = {};
    const methodNames = publicMethods.concat(['getSuccessType', 'setActionName']);

    for (const method of methodNames) {
      handles[method] = this[method].bind(this);

      Object.defineProperty(fn, method, {
        get: () => handles[method],
      });
    }

    for (const property of publicProperties) {
      Object.defineProperty(fn, property, {
        get: () => this[property],
      });
    }

    // Used for Proxy in BaseModel
    fn['__isAction__'] = true;

    return fn;
  }

  protected onTypePrefixChanged(): void {
    this.successType = `${this.typePrefix} success`;
  }
}
