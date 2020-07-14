export class WrongImmerUsageError extends TypeError {
  constructor(type: string) {
    super(`[${type}] It's not allowed to mix proxy and plain object. You have to either modify state directly or just return plain object.`);
  }
}
