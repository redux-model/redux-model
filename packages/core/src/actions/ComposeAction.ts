import { IMetaAction } from '../reducers/MetaReducer';
import { BaseModel, State, StateReturn } from '../models/BaseModel';
import { Action } from 'redux';
import { storeHelper } from '../stores/StoreHelper';
import { BaseAsyncAction } from './BaseAsyncAction';

export interface IActionCompose extends Action<string>, IMetaAction {
  message?: string;
  loading: boolean;
}

export interface ComposeSubscriber<CustomData> {
  when: string;
  then?: (state: State<CustomData>) => StateReturn<CustomData>;
  after?: () => void;
  duration?: number;
}

// FIXME: 这里的Meta是子集，也许有必要做一个ComposeMeta
export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseAsyncAction<Data> {
  protected readonly runner: Runner;

  constructor(model: BaseModel<Data>, runner: Runner, fromSubClass?: boolean) {
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
    const self = this;

    return function (): Promise<any> {
      const actionName = self.getName();

      storeHelper.dispatch<IActionCompose>({
        type: self.getPrepareType(),
        metaKey: true,
        actionName,
        loading: true,
      });

      return self
        .runner.apply(null, arguments as unknown as any[])
        .then((result) => {
          storeHelper.dispatch<IActionCompose>({
            type: self.getSuccessType(),
            metaKey: true,
            actionName,
            loading: false,
          });

          return result;
        })
        .catch((e: Error) => {
          storeHelper.dispatch<IActionCompose>({
            type: self.getFailType(),
            metaKey: true,
            actionName,
            message: e.message,
            loading: false,
          });

          return Promise.reject(e);
        });
    }
  }

  public onSuccess<CustomData>(changeState: NonNullable<ComposeSubscriber<CustomData>['then']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      then: changeState,
    };
  }

  public afterSuccess<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['after']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      after: callback,
      duration: duration,
    };
  }

  public onPrepare<CustomData>(changeState: NonNullable<ComposeSubscriber<CustomData>['then']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      then: changeState,
    };
  }

  public afterPrepare<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['after']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      after: callback,
      duration: duration,
    };
  }

  public onFail<CustomData>(changeState: NonNullable<ComposeSubscriber<CustomData>['then']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      then: changeState,
    };
  }

  public afterFail<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['after']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      after: callback,
      duration: duration,
    };
  }
}
