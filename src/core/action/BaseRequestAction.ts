import { NormalAction } from './NormalAction';
import { BaseReducer } from '../reducer/BaseReducer';
import { NotFoundError } from '../exceptions/NotFoundError';
import {
  ActionResponse,
  BaseActionRequest,
  Effects,
  Meta,
  Metas, PayloadData,
  PayloadKey,
  Reducers, RequestActionParam, RequestSubscriber,
  UseSelector
} from '../utils/types';
import { ActionRequest, FetchHandle } from '../../web/types';

const DEFAULT_META: Meta = {
  actionType: '',
  loading: false,
};

// export interface RequestActionParam<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> {
//   action: A;
//   meta?: boolean | PayloadKey<A>;
//   onSuccess?: (state: Data, action: ActionResponse<Response, Payload>) => Data;
//   onPrepare?: (state: Data, action: ActionResponse<Response, Payload>) => Data;
//   onFail?: (state: Data, action: ActionResponse<Response, Payload>) => Data;
// }

export abstract class BaseRequestAction<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload>
  // @ts-ignore
  extends NormalAction<Data, A, Payload> {
  // Point to correct type definition.
  public readonly action: A;

  protected readonly meta: boolean | PayloadKey<A>;

  protected readonly prepareCallback?: any;

  protected readonly failCallback?: any;

  protected prepareType: string;

  protected failType: string;

  protected metaInstance: BaseReducer<Meta> | null = null;

  protected metasInstance: BaseReducer<Metas> | null = null;

  public constructor(config: RequestActionParam<Data, A, Response, Payload>, instanceName: string) {
    super({
      action: config.action,
      // @ts-ignore
      onSuccess: config.onSuccess,
    }, instanceName);
    // @ts-ignore
    this.action = (...args: any[]) => {
      const data = config.action(...args) as unknown as ActionRequest;

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

  public static createRequestData(options: Partial<BaseActionRequest> & Pick<BaseActionRequest, 'uri' | 'method' | 'middleware'>) {
    const data: Omit<BaseActionRequest, 'type'> = {
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
    effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData
  ): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }

  public onPrepare<CustomData>(
    effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData
  ): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.prepareType,
      effect,
    };
  }

  public onFail<CustomData>(
    effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData
  ): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.prepareType,
      effect,
    };
  }

  public collectEffects(): Effects<Data> {
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

  public collectReducers(): Reducers {
    let obj = super.collectReducers();

    if (this.meta) {
      if (typeof this.meta === 'boolean') {
        obj = { ...obj, ...this.createMeta().createData() };
      } else {
        obj = { ...obj, ...this.createMetas(this.meta).createData() };
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

  public useMeta<T = Meta>(filter?: (meta: Meta) => T): T {
    if (!this.metaInstance) {
      throw new NotFoundError(this.instanceName);
    }

    const reducerName = this.metaInstance.getReducerName();

    return this.switchReduxSelector()((state: any) => {
      const customMeta = state[reducerName];

      return filter ? filter(customMeta) : customMeta;
    });
  }

  public useMetas<T = Meta>(payloadData?: PayloadData, filter?: (meta: Meta) => T): Metas | T {
    if (!this.metasInstance) {
      throw new NotFoundError(this.instanceName);
    }

    if (payloadData === undefined) {
      filter = undefined;
    }

    return this.switchReduxSelector()((state: any) => {
      const reducerName = this.metasInstance!.getReducerName();
      const customMeta = payloadData === undefined
        ? state[reducerName]
        : state[reducerName][payloadData] || DEFAULT_META;

      return filter ? filter(customMeta) : customMeta;
    });
  }

  public useLoading(payloadData?: PayloadData): boolean {
    return payloadData === undefined
      ? this.useMeta((meta) => meta.loading)
      : this.useMetas(payloadData, (meta) => meta.loading) as boolean;
  }

  public connectMeta(rootState: any): Meta {
    if (!this.metaInstance) {
      throw new NotFoundError(this.instanceName);
    }

    return rootState[this.metaInstance.getReducerName()];
  }

  public connectMetas(rootState: any, payloadData?: PayloadData): Metas | Meta {
    if (!this.metasInstance) {
      throw new NotFoundError(this.instanceName);
    }

    const reducerName = this.metasInstance.getReducerName();

    return payloadData === undefined
      ? rootState[reducerName]
      : rootState[reducerName][payloadData] || DEFAULT_META;
  }

  public connectLoading(rootState: any, payloadData?: PayloadData): boolean {
    return payloadData === undefined
      ? this.connectMeta(rootState).loading
      : (this.connectMetas(rootState, payloadData) as Meta).loading;
  }

  protected onTypePrefixChanged(): void {
    super.onTypePrefixChanged();
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;
  }

  protected createMeta(): BaseReducer<Meta> {
    this.metaInstance = new BaseReducer<Meta>(DEFAULT_META, this.typePrefix, 'meta');
    this.metaInstance.addCase(
      {
        when: this.prepareType,
        effect: () => {
          return {
            actionType: this.prepareType,
            loading: true,
          };
        }
      },
      {
        when: this.successType,
        effect: () => {
          return {
            actionType: this.successType,
            loading: false,
          };
        },
      },
      {
        when: this.failType,
        effect: (_, action: ActionResponse) => {
          return {
            actionType: this.failType,
            loading: false,
            errorMessage: action.errorMessage,
            httpStatus: action.httpStatus,
            businessCode: action.businessCode,
          };
        },
      },
    );

    return this.metaInstance;
  }

  protected createMetas(payloadKey: any): BaseReducer<Metas> {
    this.metasInstance = new BaseReducer<Metas>({}, this.instanceName, 'metas');
    this.metasInstance.addCase(
      {
        when: this.prepareType,
        effect: (state, action: ActionResponse) => {
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: true,
            },
          };
        },
      },
      {
        when: this.successType,
        effect: (state, action: ActionResponse) => {
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: false,
            },
          };
        },
      },
      {
        when: this.failType,
        effect: (state, action: ActionResponse) => {
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
        },
      },
    );

    return this.metasInstance;
  }

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
