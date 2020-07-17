import { BaseAction, IActionPayload, actionProxyKeys } from './BaseAction';
import { State, StateReturn, BaseModel } from '../models/BaseModel';
import { storeHelper } from '../stores/StoreHelper';

export interface IActionNormal<Data = any, Payload = any> extends IActionPayload<Payload> {
  modelName: string;
  effect: (state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>;
}

export interface NormalSubscriber<CustomData, Payload>{
  when: string;
  effect: (state: State<CustomData>, action: IActionPayload<Payload>) => StateReturn<CustomData>;
}

export const normalActionProxyKeys: {
  methods: (keyof NormalAction<any, any, any>)[];
} = {
  methods: ['onSuccess', 'changeCallback', ...actionProxyKeys.methods],
};

export class NormalAction<Data, Callback extends (state: State<Data>, payload: Payload) => StateReturn<Data>, Payload> extends BaseAction<Data> {
  private callback: Callback;

  constructor(model: BaseModel<Data>, changeFn: Callback, fromSubClass: boolean = false) {
    super(model);
    this.callback = changeFn;

    return fromSubClass ? this : this.proxy();
  }

  /**
   * @override
   */
  protected getProxyMethods(): string[] {
    return normalActionProxyKeys.methods;
  }

  public/*protected*/ changeCallback(fn: Callback) {
    this.callback = fn;
  }

  public onSuccess<CustomData>(effect: NormalSubscriber<CustomData, Payload>['effect']): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.getSuccessType(),
      effect,
    };
  }

  protected getProxyFn(): Function {
    const modelName = this.model.getReducerName();

    return (payload: Payload) => {
      return storeHelper.dispatch<IActionNormal<Data, Payload>>({
        type: this.getSuccessType(),
        payload: payload,
        modelName: modelName,
        effect: (state, action) => {
          return this.callback(state, action.payload);
        },
      });
    };
  }
}
