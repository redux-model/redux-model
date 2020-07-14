export class StateReturnRequiredError extends TypeError {
  constructor(type: string) {
    super(`[${type}] New state is required to respond due to mvvm is unavailable.`);
  }
}
