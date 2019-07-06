import { NormalAction } from './NormalAction';
import { useSelector } from 'react-redux';

const DEFAULT_META: RM.Meta = {
  actionType: '',
  loading: false,
};

type PayloadData = string | number | symbol;
type EnhanceResponse<A, Payload> = A extends (...args: any[]) => RM.FetchHandle<infer R, Payload> ? R : never;
type EnhancePayload<A, Response> = A extends (...args: any[]) => RM.FetchHandle<Response, infer R> ? R : never;

export interface RequestActionParam<Data, Response, Payload, A extends (...args: any[]) => RM.FetchHandle<Response, Payload>> {
  action: A;
  meta?: boolean | string;
  onSuccess?: (state: Data, action: RM.ResponseAction<EnhanceResponse<A, Payload>, EnhancePayload<A, Response>>) => Data;
  onPrepare?: (state: Data, action: RM.ResponseAction<EnhanceResponse<A, Payload>, EnhancePayload<A, Response>>) => Data;
  onFail?: (state: Data, action: RM.ResponseAction<EnhanceResponse<A, Payload>, EnhancePayload<A, Response>>) => Data;
}

export class RequestAction<Data = any, Response = {}, Payload = {}, A extends (...args: any[]) => RM.FetchHandle<Response, Payload> = any>
  // @ts-ignore
  extends NormalAction<Data, Payload, A> {
  // Point to correct type definition.
  public readonly action: A;

  protected readonly meta: boolean | string;

  protected readonly prepareCallback?: any;

  protected readonly failCallback?: any;

  protected readonly prepareType: string;

  protected readonly failType: string;

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

    this.meta = config.meta === undefined ? false : config.meta;
    this.prepareCallback = config.onPrepare;
    this.failCallback = config.onFail;
    this.prepareType = `${this.typePrefix}_prepare`;
    this.failType = `${this.typePrefix}_fail`;
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

  public collectEffects(): RM.Effects<Data> {
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

  public useMeta<T = RM.Meta>(payloadData?: PayloadData, filter?: (meta: RM.Meta) => T): T {
    if (this.meta === false) {
      throw new ReferenceError(`[${this.typePrefix}] It seems like you didn't set { meta: true } in action.`)
    }

    if (typeof payloadData === 'function') {
      filter = payloadData;
      payloadData = undefined;
    }

    return useSelector((state: {}) => {
      const customMeta = payloadData === undefined
        ? state[`${this.typePrefix}__meta`]
        : state[`${this.typePrefix}__metas`][payloadData] || DEFAULT_META;

      return filter ? filter(customMeta) : state[customMeta];
    });
  }

  public useLoading(payloadData?: PayloadData): boolean {
    return this.useMeta(payloadData, (meta) => meta.loading);
  }

  public connectMeta<T = RM.Meta>(rootState: any, payloadData?: PayloadData, filter?: (meta: RM.Meta) => T): T {
    if (this.meta === false) {
      throw new ReferenceError(`[${this.typePrefix}] It seems like you didn't set { meta: true } in action.`)
    }

    if (typeof payloadData === 'function') {
      filter = payloadData;
      payloadData = undefined;
    }

    const meta = payloadData === undefined
      ? rootState[`${this.typePrefix}__meta`]
      : rootState[`${this.typePrefix}__metas`][payloadData] || DEFAULT_META;

    return filter ? filter(meta) : meta;
  }

  public connectLoading(rootState: any, payloadData?: PayloadData): boolean {
    return this.connectMeta(rootState, payloadData, (meta) => meta.loading);
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
