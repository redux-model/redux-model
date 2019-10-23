import { BaseAction } from './BaseAction';
import { ActionNormalHandle, NormalSubscriber } from '../utils/types';
import { getStore } from '../utils/createReduxStore';

export class NormalAction<Data, A extends (...args: any[]) => ActionNormalHandle<Data, Payload>, Payload> extends BaseAction {
  private effect: ReturnType<A>['effect'] | undefined = undefined;

  constructor(action: A, instanceName: string) {
    super(instanceName);

    // @ts-ignore
    return this.proxy((...args: any[]) => {
      const normal: ActionNormalHandle<Data, Payload> = action(...args);

      normal.type = this.successType;

      if (this.effect) {
        normal.effect = this.effect;
      }

      return getStore().dispatch(normal);
    }, ['onSuccess', 'changeEffect'], []);
  }

  public changeEffect(effect: ReturnType<A>['effect']) {
    this.effect = effect;
  }

  public onSuccess<CustomData>(effect: NormalSubscriber<CustomData, Payload>['effect']): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }
}
