import { BaseAction } from './BaseAction';

export interface NormalActionParam<Data, A extends (...args: any[]) => RM.ActionNormal<Payload>, Payload> {
  action: A;
  onSuccess?: (state: Data, action: RM.ActionNormal<Payload>) => Data;
}

type NormalSubscriber<CustomData, Payload> = {
  when: string;
  effect: (state: CustomData, action: RM.ActionNormal<Payload>) => CustomData;
};

export class NormalAction<Data, A extends (...args: any[]) => RM.ActionNormal<Payload>, Payload> extends BaseAction<Data> {
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

  public static createNormalData<Payload = {}>(payload?: Payload): RM.ActionNormal<Payload> {
    return {
      type: '',
      // @ts-ignore
      payload: payload || {},
    };
  }

  public onSuccess<CustomData>(
    effect: (state: CustomData, action: RM.ActionNormal<Payload>) => CustomData
  ): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }

  public collectEffects(): RM.Effects<Data> {
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
