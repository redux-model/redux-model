import { BaseAction, IActionPayload } from './BaseAction';
import { State, StateReturn, BaseModel } from '../models/BaseModel';
import { storeHelper } from '../stores/StoreHelper';

export interface IActionNormal<Data = any, Payload = any> extends IActionPayload<Payload> {
  modelName: string;
  effect: (state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>;
  effectCallback: null;
}

export interface NormalSubscriber<CustomData, Payload> {
  when: string;
  then?: (state: State<CustomData>, action: IActionPayload<Payload>) => StateReturn<CustomData>;
  after?: (action: IActionPayload<Payload>) => void;
  duration?: number;
}

export class NormalAction<Data, Callback extends (state: State<Data>, payload: Payload) => StateReturn<Data>, Payload> extends BaseAction<Data> {
  private callback: Callback;

  constructor(model: BaseModel<Data>, changeFn: Callback, fromSubClass: boolean = false) {
    super(model);
    this.callback = changeFn;

    return fromSubClass ? this : this.proxy();
  }

  public/*protected*/ changeCallback(fn: Callback) {
    this.callback = fn;
  }

  public onSuccess<CustomData>(changeReducer: NonNullable<NormalSubscriber<CustomData, Payload>['then']>): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.getSuccessType(),
      then: changeReducer,
    };
  }

  public afterSuccess<CustomData>(callback: NonNullable<NormalSubscriber<CustomData, Payload>['after']>, duration?: number): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.getSuccessType(),
      after: callback,
      duration: duration,
    };
  }

  protected action(): Function {
    const modelName = this.model.getReducerName();

    return (payload: Payload) => {
      return storeHelper.dispatch<IActionNormal<Data, Payload>>({
        type: this.getSuccessType(),
        payload: payload,
        modelName: modelName,
        effect: (state, action) => {
          return this.callback(state, action.payload);
        },
        effectCallback: null,
      });
    };
  }

  /**
   * @override
   */
  protected methods(): string[] {
    return super.methods().concat('onSuccess', 'afterSuccess', 'changeCallback');
  }
}
