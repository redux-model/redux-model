import { BaseAction } from './BaseAction';

export interface NormalActionParam<Data, Payload, A extends (...args: any[]) => RM.NormalAction<Payload>> {
  action: A;
  onSuccess?: (state: Data, action: RM.NormalAction<Payload>) => Data;
}

type NormalSubscriber<CustomData, Payload> = {
  when: string;
  effect: (state: CustomData, action: RM.NormalAction<Payload>) => CustomData;
};

export class NormalAction<Data = any, Payload = any, A extends (...args: any[]) => RM.NormalAction<Payload> = any> extends BaseAction<Data> {
  public readonly action: A;

  protected readonly successCallback?: any;

  constructor(config: NormalActionParam<Data, Payload, A>, instanceName: string) {
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

  public static createNormalData<Payload = {}>(payload?: Payload): RM.NormalAction<Payload> {
    return {
      type: '',
      // @ts-ignore
      payload: payload || {},
    };
  }

  public onSuccess<CustomData>(
    effect: (state: CustomData, action: RM.NormalAction<Payload>) => CustomData
  ): NormalSubscriber<CustomData, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }

  public collectEffects(): RM.Subscriber<Data> {
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
