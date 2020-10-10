import { ComposeMeta, DEFAULT_META, IMetaAction, metaReducer } from '../reducers/MetaReducer';
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

export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseAsyncAction<Data> {
  protected readonly runner: Runner;

  constructor(model: BaseModel<Data>, runner: Runner, fromSubClass?: boolean) {
    super(model);
    this.runner = runner;

    return fromSubClass ? this : this.proxy();
  }

  /**
   * Information collected from service
   *
   * ```javascript
   * class TestModel extends Model {
   *   getUser = this.compose((id1: number, id2: number) => {
   *     const result1 = await $api.getAsync({
   *       uri: `/api/users/${id1}`,
   *     });
   *     const result2 = await $api.getAsync({
   *       uri: `/api/users/${id2}`,
   *     });
   *
   *     this.changeState((state) => {
   *       state[id1] = result1.response;
   *       state[id2] = result2.response;
   *     });
   *   });
   * }
   *
   * const testModel = new TestModel();
   *
   * // Get information
   * testModel.getUser.meta.message;
   * // Dispatch action
   * testModel.getUser();
   * ```
   */
  public get meta(): ComposeMeta {
    return metaReducer.getMeta(this.getName()) || DEFAULT_META;
  }

  /**
   * @see get meta()
   *
   * ```javascript
   * testModel.getUser.loading;
   * ```
   */
  public get loading(): boolean {
    return this.meta.loading;
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

  protected getters(): string[] {
    return super.getters().concat('meta', 'loading');
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

  /**
   * For model.subscriptions()
   */
  public onSuccess<CustomData>(changeState: NonNullable<ComposeSubscriber<CustomData>['then']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      then: changeState,
    };
  }

  /**
   * For model.subscriptions()
   */
  public afterSuccess<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['after']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      after: callback,
      duration: duration,
    };
  }

  /**
   * For model.subscriptions()
   */
  public onPrepare<CustomData>(changeState: NonNullable<ComposeSubscriber<CustomData>['then']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      then: changeState,
    };
  }

  /**
   * For model.subscriptions()
   */
  public afterPrepare<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['after']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      after: callback,
      duration: duration,
    };
  }

  /**
   * For model.subscriptions()
   */
  public onFail<CustomData>(changeState: NonNullable<ComposeSubscriber<CustomData>['then']>): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      then: changeState,
    };
  }

  /**
   * For model.subscriptions()
   */
  public afterFail<CustomData>(callback: NonNullable<ComposeSubscriber<CustomData>['after']>, duration?: number): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      after: callback,
      duration: duration,
    };
  }
}
