import { NormalAction } from './NormalAction';
import { useSelector } from 'react-redux';

const DEFAULT_META: RM.Meta = {
  actionType: '',
  loading: false,
};

type PayloadData = string | number | symbol;

export interface RequestActionParam<Data, Response, Payload, A extends (...args: any[]) => RM.FetchHandle<Response, Payload>> {
  action: A;
  meta?: boolean | string;
  onSuccess?: (state: Data, action: RM.ResponseAction<Response, Payload>) => Data;
  onPrepare?: (state: Data, action: RM.ResponseAction<Response, Payload>) => Data;
  onFail?: (state: Data, action: RM.ResponseAction<Response, Payload>) => Data;
}

type RequestSubscriber<CustomData, Response, Payload> = {
  when: string;
  effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData;
};

export class RequestAction<Data = any, Response = any, Payload = any, A extends (...args: any[]) => RM.FetchHandle<Response, Payload> = any>
  // @ts-ignore
  extends NormalAction<Data, Payload, A> {
  // Point to correct type definition.
  public readonly action: A;

  protected readonly meta: boolean | string;

  protected readonly prepareCallback?: any;

  protected readonly failCallback?: any;

  protected prepareType: string;

  protected failType: string;

  public constructor(config: RequestActionParam<Data, Response, Payload, A>, instanceName: string) {
    super({
      action: config.action,
      // @ts-ignore
      onSuccess: config.onSuccess,
    }, instanceName);
    // @ts-ignore
    this.action = (...args: any[]) => {
      const data = config.action(...args) as unknown as RM.RequestAction;

      data.type = {
        prepare: this.prepareType,
        success: this.successType,
        fail: this.failType,
      };

      return data;
    };

    this.meta = config.meta === undefined ? true : config.meta;
    this.prepareCallback = config.onPrepare;
    this.failCallback = config.onFail;
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;
  }

  public static createRequestData(options: Partial<RM.RequestAction> & Pick<RM.RequestAction, 'uri' | 'method' | 'middleware'>) {
    const data: Omit<RM.RequestAction, 'type'> = {
      middleware: options.middleware,
      payload: options.payload || {},
      uri: options.uri,
      method: options.method,
      body: options.body || {},
      query: options.query || {},
      successText: options.successText || '',
      hideError: options.hideError || false,
      requestOptions: options.requestOptions || {},
    };

    return data;
  }

  // @ts-ignore
  public onSuccess<CustomData>(
    effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData
  ): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }

  public onPrepare<CustomData>(
    effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData
  ): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.prepareType,
      effect,
    };
  }

  public onFail<CustomData>(
    effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData
  ): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.prepareType,
      effect,
    };
  }

  public collectEffects(): RM.Subscriber<Data> {
    const effects = super.collectEffects();

    if (this.prepareCallback) {
      effects.push({
        when: this.prepareType,
        effect: this.prepareCallback,
      });
    }

    if (this.failCallback) {
      effects.push({
        when: this.failType,
        effect: this.failCallback,
      });
    }

    return effects;
  }

  public collectReducers(): RM.Reducers {
    const obj = super.collectReducers();

    if (this.meta) {
      if (typeof this.meta === 'boolean') {
        obj[`${this.typePrefix}__meta`] = this.createMeta();
      } else {
        obj[`${this.typePrefix}__metas`] = this.createMetas(this.meta);
      }
    }

    return obj;
  }

  public getPrepareType(): string {
    return this.prepareType;
  }

  public getFailType(): string {
    return this.failType;
  }

  public useMeta<T = RM.Meta>(filter?: (meta: RM.Meta) => T): T {
    if (this.meta !== true) {
      if (this.meta === false) {
        throw new ReferenceError(`[${this.typePrefix}] You didn't set { meta: true } in action.`);
      } else {
        throw new ReferenceError(`[${this.typePrefix}] You had set { meta: "${this.meta}" } in action, Do you mean useMetas(...)?`);
      }
    }

    return useSelector((state: any) => {
      const customMeta = state[`${this.typePrefix}__meta`];

      return filter ? filter(customMeta) : customMeta;
    });
  }

  public useMetas<T = RM.Meta>(payloadData?: PayloadData, filter?: (meta: RM.Meta) => T): RM.Metas | T {
    if (typeof this.meta !== 'string') {
      if (this.meta) {
        throw new ReferenceError(`[${this.typePrefix}] You had set { meta: true } in action, Do you mean useMeta()?`);
      } else {
        throw new ReferenceError(`[${this.typePrefix}] You didn't set { meta: "Payload Key" } in action.`);
      }
    }

    if (payloadData === undefined) {
      filter = undefined;
    }

    return useSelector((state: any) => {
      const customMeta = payloadData === undefined
        ? state[`${this.typePrefix}__metas`]
        : state[`${this.typePrefix}__metas`][payloadData] || DEFAULT_META;

      return filter ? filter(customMeta) : customMeta;
    });
  }

  public useLoading(payloadData?: PayloadData, ...orUseLoading: boolean[]): boolean {
    if (typeof payloadData === 'boolean') {
      orUseLoading.push(payloadData);
      payloadData = undefined;
    }

    const isLoading = payloadData === undefined
      ? this.useMeta((meta) => meta.loading)
      : this.useMetas(payloadData, (meta) => meta.loading) as boolean;

    return isLoading || orUseLoading.some(Boolean);
  }

  public connectMeta(rootState: any): RM.Meta {
    if (this.meta !== true) {
      if (this.meta === false) {
        throw new ReferenceError(`[${this.typePrefix}] You didn't set { meta: true } in action.`);
      } else {
        throw new ReferenceError(`[${this.typePrefix}] You had set { meta: "${this.meta}" } in action, Do you mean connectMetas(...)?`);
      }
    }

    return rootState[`${this.typePrefix}__meta`];
  }

  public connectMetas(rootState: any, payloadData?: PayloadData): RM.Metas | RM.Meta {
    if (typeof this.meta !== 'string') {
      if (this.meta) {
        throw new ReferenceError(`[${this.typePrefix}] You had set { meta: true } in action, Do you mean connectMeta()?`);
      } else {
        throw new ReferenceError(`[${this.typePrefix}] You didn't set { meta: "Payload Key" } in action.`);
      }
    }

    return payloadData === undefined
      ? rootState[`${this.typePrefix}__metas`]
      : rootState[`${this.typePrefix}__metas`][payloadData] || DEFAULT_META;
  }

  public connectLoading(rootState: any, payloadData?: PayloadData): boolean {
    return payloadData === undefined
      ? this.connectMeta(rootState).loading
      : (this.connectMetas(rootState, payloadData) as RM.Meta).loading;
  }

  protected onTypePrefixChanged(): void {
    super.onTypePrefixChanged();
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;
  }

  protected createMeta(): (state: any, action: RM.ResponseAction) => RM.Meta {
    return (state, action) => {
      if (!state) {
        state = DEFAULT_META;
      }

      switch (action.type) {
        case this.prepareType:
          return {
            actionType: action.type,
            loading: true,
          };
        case this.successType:
          return {
            actionType: action.type,
            loading: false,
          };
        case this.failType:
          return {
            actionType: action.type,
            loading: false,
            errorMessage: action.errorMessage,
            httpStatus: action.httpStatus,
            businessCode: action.businessCode,
          };
        default:
          return state;
      }
    };
  }

  protected createMetas(payloadKey: string): (state: any, action: RM.ResponseAction) => RM.Metas {
    return (state, action) => {
      if (!state) {
        state = {};
      }

      switch (action.type) {
        case this.prepareType:
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: true,
            },
          };
        case this.successType:
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: false,
            },
          };
        case this.failType:
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: false,
              errorMessage: action.errorMessage,
              httpStatus: action.httpStatus,
              businessCode: action.businessCode,
            },
          };
        default:
          return state;
      }
    };
  }
}
