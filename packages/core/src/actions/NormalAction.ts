import { BaseAction, IActionPayload } from './BaseAction';
import { State, StateReturn, BaseModel } from '../models/BaseModel';
import { storeHelper } from '../stores/StoreHelper';

export interface IActionNormal<Data = any, Payload = any> extends IActionPayload<Payload> {
  modelName: string;
  effect: (state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>;
  effectCallback: null;
}

export interface NormalSubscriber<CustomData, Payload>{
  when: string;
  effect?: (state: State<CustomData>, action: IActionPayload<Payload>) => StateReturn<CustomData>;
  effectCallback?: (action: IActionPayload<Payload>) => void;
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

  public onSuccess<CustomData>(effect: NonNullable<NormalSubscriber<CustomData, Payload>['effect']>): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.getSuccessType(),
      effect,
    };
  }

  public afterSuccess<CustomData>(callback: NonNullable<NormalSubscriber<CustomData, Payload>['effectCallback']>): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.getSuccessType(),
      effectCallback: callback,
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
