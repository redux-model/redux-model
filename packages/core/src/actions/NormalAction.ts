import { BaseAction, IActionPayload } from './BaseAction';
import { State, StateReturn, BaseModel } from '../models/BaseModel';
import { storeHelper } from '../stores/StoreHelper';

export interface IActionNormal<Data = any, Payload = any> extends IActionPayload<Payload> {
  modelName: string;
  effect: (state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>;
  after: null | ((action: IActionPayload<Payload>) => void);
  afterDuration?: number;
}

export interface NormalSubscriber<CustomData, Payload> {
  when: string;
  then?: (state: State<CustomData>, action: IActionPayload<Payload>) => StateReturn<CustomData>;
  after?: (action: IActionPayload<Payload>) => void;
  duration?: number;
}

export class NormalAction<Data, ChangeReducer extends (state: State<Data>, payload: Payload) => StateReturn<Data>, Payload, After extends (action: IActionPayload<Payload>) => void> extends BaseAction<Data> {
  private effect: ChangeReducer;
  private readonly after?: After;
  private readonly afterDuration?: number;

  constructor(model: BaseModel<Data>, effect: ChangeReducer, after?: After, afterDuration?: number, fromSubClass: boolean = false) {
    super(model);
    this.effect = effect;
    this.after = after;
    this.afterDuration = afterDuration;

    return fromSubClass ? this : this.proxy();
  }

  public/*protected*/ setEffect(fn: ChangeReducer) {
    this.effect = fn;
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
          return this.effect(state, action.payload);
        },
        after: this.after || null,
        afterDuration: this.afterDuration,
      });
    };
  }

  /**
   * @override
   */
  protected methods(): string[] {
    return super.methods().concat('onSuccess', 'afterSuccess', 'setEffect');
  }
}
