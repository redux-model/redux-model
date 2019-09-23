export class Uri<Response> {
  private readonly uri: string;
  // @ts-ignore
  private response: Response | undefined = undefined;

  constructor(uri: string) {
    this.uri = uri;
  }

  public getUri(): string {
    return this.uri;
  }
}
