import { BaseAction } from './BaseAction';
import { Meta, metaReducer } from '../reducers/MetaReducer';
import { setActionName } from '../utils/setActionName';
import { DEFAULT_META } from '../reducers/MetaReducer';

export abstract class BaseAsyncAction<Data> extends BaseAction<Data> {
  private _prepare?: string;
  private _fail?: string;

  public get meta(): Meta {
    return metaReducer.getMeta(this.getName()) || DEFAULT_META;
  }

  public get loading(): boolean {
    return this.meta.loading;
  }

  /**
   * @override
   */
  public/*protected*/ setName(name: string | number): void {
    super.setName(name);
    this._prepare = this._name + ' prepare';
    this._fail = this._name + ' fail';
  }

  public getPrepareType(): string {
    return this._prepare || setActionName(this)._prepare!;
  }

  public getFailType(): string {
    return this._fail || setActionName(this)._fail!;
  }

  protected methods(): string[] {
    return super.methods().concat('getPrepareType', 'getFailType');
  }

  protected getters(): string[] {
    return super.getters().concat('meta', 'loading');
  }
}
