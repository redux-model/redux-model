import { BaseAction } from './BaseAction';
import { ActionNormal, Effects, NormalActionParam, NormalSubscriber } from '../utils/types';

export class NormalAction<Data, A extends (...args: any[]) => ActionNormal<Payload>, Payload> extends BaseAction<Data> {
  public readonly action: A;

  protected readonly successCallback?: any;

  constructor(config: NormalActionParam<Data, A, Payload>, instanceName: string) {
    super(instanceName);
    // @ts-ignore
    this.action = (...args: any[]) => {
      return {
        ...config.action(...args),
        type: this.successType,
      };
    };
    this.successCallback = config.onSuccess;
  }

  public static createNormalData<Payload = {}>(payload?: Payload): ActionNormal<Payload> {
    return {
      type: '',
      // @ts-ignore
      payload: payload || {},
    };
  }

  public onSuccess<CustomData>(
    effect: (state: CustomData, action: ActionNormal<Payload>) => CustomData
  ): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }

  public collectEffects(): Effects<Data> {
    const effects = super.collectEffects();

    if (this.successCallback) {
      effects.push({
        when: this.successType,
        effect: this.successCallback,
      });
    }

    return effects;
  }
}
