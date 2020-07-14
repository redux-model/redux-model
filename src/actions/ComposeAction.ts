import { BaseAction, actionProxyKeys } from './BaseAction';
import { Meta, metaModel, DEFAULT_META, IMetaAction } from '../models/MetaModel';
import { BaseModel, State, StateReturn } from '../models/BaseModel';
import { setActionName } from '../utils/setActionName';
import { Action } from 'redux';
import { storeHelper } from '../stores/StoreHelper';

export interface IActionCompose extends Action<string>, IMetaAction {
  message?: string;
}

export interface ComposeSubscriber<CustomData>{
  when: string;
  effect: (state: State<CustomData>) => StateReturn<CustomData>;
}

export const composeActionProxyKeys: {
  methods: (keyof ComposeAction<any, any>)[];
  getters: (keyof ComposeAction<any, any>)[];
} = {
  methods: ['onSuccess', 'onPrepare', 'onFail', 'getPrepareType', 'getFailType', ...actionProxyKeys.methods],
  getters: ['meta', 'loading', ...actionProxyKeys.getters],
};

// FIXME: 这里的Meta是子集，也许有必要做一个ComposeMeta
export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseAction<Data> {
  protected readonly runner: Runner;
  private __prepareType?: string;
  private __failType?: string;

  public static proxyKeys: {
    methods: (keyof ComposeAction<any, any>)[];
    getters: (keyof ComposeAction<any, any>)[];
  } = {
    methods: ['onSuccess', 'onPrepare', 'onFail', 'getPrepareType', 'getFailType', ...actionProxyKeys.methods],
    getters: ['meta', 'loading', ...actionProxyKeys.getters],
  };

  constructor(model: BaseModel<Data>, runner: Runner, fromSubClass: boolean = false) {
    super(model);
    this.runner = runner;

    return fromSubClass ? this : this.proxy();
  }

  public get meta(): Meta {
    return metaModel.getMeta(this.instanceName) || DEFAULT_META;
  }

  public get loading(): boolean {
    return this.meta.loading;
  }

  /**
   * @override
   */
  protected getProxyMethods(): string[] {
    return composeActionProxyKeys.methods;
  }

  /**
   * @override
   */
  protected getProxyGetters(): string[] {
    return composeActionProxyKeys.getters;
  }

  protected getProxyFn(): Function {
    return async (...args: Parameters<Runner>) => {
      storeHelper.dispatch<IActionCompose>({
        type: this.getPrepareType(),
        metaKey: true,
        metaActionName: this.instanceName,
      });

      try {
        await this.runner(...args);

        storeHelper.dispatch<IActionCompose>({
          type: this.getSuccessType(),
          metaKey: true,
          metaActionName: this.instanceName,
        });
      } catch (e) {
        storeHelper.dispatch<IActionCompose>({
          type: this.getFailType(),
          metaKey: true,
          metaActionName: this.instanceName,
          message: e.message,
        });

        throw e;
      }
    };
  }

  /**
   * @override
   */
  public/*protected*/ setName(name: string | number): void {
    super.setName(name);
    this.__prepareType = this.instanceName + ' prepare';
    this.__failType = this.instanceName + ' fail';
  }

  public getPrepareType(): string {
    return this.__prepareType || setActionName(this).__prepareType!;
  }

  public getFailType(): string {
    return this.__failType || setActionName(this).__failType!;
  }

  public onSuccess<CustomData>(effect: ComposeSubscriber<CustomData>['effect']): ComposeSubscriber<CustomData> {
    return {
      when: this.getSuccessType(),
      effect,
    };
  }

  public onPrepare<CustomData>(effect: ComposeSubscriber<CustomData>['effect']): ComposeSubscriber<CustomData> {
    return {
      when: this.getPrepareType(),
      effect,
    };
  }

  public onFail<CustomData>(effect: ComposeSubscriber<CustomData>['effect']): ComposeSubscriber<CustomData> {
    return {
      when: this.getFailType(),
      effect,
    };
  }
}
