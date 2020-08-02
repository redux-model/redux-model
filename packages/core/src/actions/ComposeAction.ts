import { IMetaAction } from '../reducers/MetaReducer';
import { BaseModel, State, StateReturn } from '../models/BaseModel';
import { Action } from 'redux';
import { storeHelper } from '../stores/StoreHelper';
import { BaseAsyncAction } from './BaseAsyncAction';

export interface IActionCompose extends Action<string>, IMetaAction {
  message?: string;
  loading: boolean;
}

export interface ComposeSubscriber<CustomData>{
  when: string;
  effect?: (state: State<CustomData>) => StateReturn<CustomData>;
  effectCallback?: () => void;
  duration?: number;
}

// FIXME: 这里的Meta是子集，也许有必要做一个ComposeMeta
export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseAsyncAction<Data> {
  protected readonly runner: Runner;

  constructor(model: BaseModel<Data>, runner: Runner, fromSubClass: boolean = false) {
    super(model);
    this.runner = runner;

    return fromSubClass ? this : this.proxy();
  }

  /**
   * @override
   */
  protected methods(): string[] {
    return super.methods().concat(
      'onSuccess', 'onPrepare', 'onFail',
      'afterSuccess', 'afterPrepare', 'afterFail',
    );
  }

  protected action(): Function {
    return (...args: Parameters<Runner>): Promise<any> => {
      const actionName = this.getName();

      storeHelper.dispatch<IActionCompose>({
        type: this.getPrepareType(),
        metaKey: true,
        metaActionName: actionName,
        loading: true,
      });

      return this
        .runner(...args)
        .then((result) => {
          storeHelper.dispatch<IActionCompose>({
            type: this.getSuccessType(),
            metaKey: true,
            metaActionName: actionName,
            loading: false,
          });

          return result;
        })
        .catch((e: Error) => {
          storeHelper.dispatch<IActionCompose>({
            type: this.getFailType(),
            metaKey: true,
            metaActionName: actionName,
            message: e.message,
            loading: false,
          });

          return Promise.reject(e);
        });
    };
  }

  public onSuccess<CustomData>(effect: NonNullable<ComposeSubscriber<CustomData>['effect']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      effect,
    };
  }

  public afterSuccess<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['effectCallback']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      effectCallback: callback,
      duration: duration,
    };
  }

  public onPrepare<CustomData>(effect: NonNullable<ComposeSubscriber<CustomData>['effect']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      effect,
    };
  }

  public afterPrepare<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['effectCallback']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      effectCallback: callback,
      duration: duration,
    };
  }

  public onFail<CustomData>(effect: NonNullable<ComposeSubscriber<CustomData>['effect']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      effect,
    };
  }

  public afterFail<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['effectCallback']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      effectCallback: callback,
      duration: duration,
    };
  }
}
