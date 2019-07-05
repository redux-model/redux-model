import { BaseAction } from './BaseAction';

export interface NormalActionParam<Data, A> {
  action: A;
  onSuccess?: (state: Data, action: RM.NormalAction) => Data;
}

export class NormalAction<Data, A extends (...args: any[]) => RM.NormalAction = any> extends BaseAction<Data> {
  public readonly action: A;

  protected readonly successCallback?: (state: Data, action: any) => Data;

  constructor(config: NormalActionParam<Data, A>, instanceName: string) {
    super(instanceName);
    // @ts-ignore
    this.action = (...args: any[]) => {
      return {
        ...config.action(...args) as unknown as RM.NormalAction,
        type: this.successType,
      };
    };
    this.successCallback = config.onSuccess;
  }

  public static createNormalData<Payload = {}>(payload: Payload): RM.NormalAction<Payload> {
    return {
      type: '',
      payload,
    };
  }

  collectEffects(): RM.ReducerEffects<Data> {
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
