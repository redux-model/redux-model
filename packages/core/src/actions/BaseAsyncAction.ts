import { BaseAction } from './BaseAction';

export abstract class BaseAsyncAction<Data> extends BaseAction<Data> {
  private _prepare?: string;
  private _fail?: string;

  /**
   * @override
   */
  public/*protected*/ setName(name: string | number): void {
    super.setName(name);
    this._prepare = this._name + ' prepare';
    this._fail = this._name + ' fail';
  }

  public getPrepareType(): string {
    return this._prepare || this.assignName()._prepare!;
  }

  public getFailType(): string {
    return this._fail || this.assignName()._fail!;
  }

  protected methods(): string[] {
    return super.methods().concat('getPrepareType', 'getFailType');
  }
}
