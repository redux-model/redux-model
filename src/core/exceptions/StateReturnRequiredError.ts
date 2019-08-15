export class StateReturnRequiredError extends TypeError {
  constructor(type: string) {
    super(`[${type}] You must return new state due to you have disabled immer reducer in this model, or the reducer data is unable to transform to immer type.`);
  }
}
