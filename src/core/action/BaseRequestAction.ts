import {
  BaseActionRequest,
  Effects,
  Meta,
  Metas,
  Omit,
  PayloadData,
  PayloadKey,
  Reducers,
  RequestActionParamNoMeta,
  RequestSubscriber,
  UseSelector,
} from '../utils/types';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { getStore } from '../utils/createReduxStore';
import { BaseAction } from './BaseAction';
import { MetaReducer } from '../reducer/MetaReducer';

const DEFAULT_META: Meta = {
  actionType: '',
  loading: false,
};

const DEFAULT_METAS: Metas = {};

export abstract class BaseRequestAction<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends BaseAction<Data> {
  protected readonly meta: boolean | PayloadKey<A>;

  protected readonly prepareCallback?: any;

  protected readonly successCallback?: any;

  protected readonly failCallback?: any;

  protected prepareType: string;

  protected failType: string;

  public constructor(config: RequestActionParamNoMeta<Data, A, Response, Payload>, instanceName: string) {
    super(instanceName);

    this.meta = config.meta === undefined ? true : config.meta;
    this.prepareCallback = config.onPrepare;
    this.successCallback = config.onSuccess;
    this.failCallback = config.onFail;
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;

    // @ts-ignore
    return this.proxy((...args: any[]) => {
      const data = config.action(...args) as unknown as ActionRequest;

      data.type = {
        prepare: this.prepareType,
        success: this.successType,
        fail: this.failType,
      };

      return getStore().dispatch(data);
    }, [
      'onSuccess', 'onPrepare', 'onFail',
      'getPrepareType', 'getFailType',
      'useMeta', 'useMetas', 'useLoading',
      'connectMeta', 'connectMetas', 'connectLoading',
    ]);
  }

  public static createRequestData(options: Partial<BaseActionRequest> & Pick<BaseActionRequest, 'uri' | 'method' | 'middleware'>) {
    const data: Omit<BaseActionRequest, 'type'> = {
      middleware: options.middleware,
      payload: options.payload === undefined ? {} : options.payload,
      uri: options.uri,
      method: options.method,
      body: options.body || {},
      query: options.query || {},
      successText: options.successText || '',
      failText: options.failText || '',
      hideError: options.hideError || false,
      requestOptions: options.requestOptions || {},
      extraData: options.extraData || {},
    };

    return data;
  }

  public onSuccess<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.successType,
      effect,
    };
  }

  public onPrepare<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.prepareType,
      effect,
    };
  }

  public onFail<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload> {
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

    if (this.successCallback) {
      effects.push({
        when: this.successType,
        effect: this.successCallback,
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
    if (this.meta !== false) {
      const types = {
        prepare: this.prepareType,
        success: this.successType,
        fail: this.failType,
      };

      if (this.meta === true) {
        MetaReducer.addCase(this.typePrefix, types, false, '');
      } else {
        MetaReducer.addCase(this.typePrefix, types, true, this.meta);
      }
    }

    return MetaReducer.createData();
  }

  public getPrepareType(): string {
    return this.prepareType;
  }

  public getFailType(): string {
    return this.failType;
  }

  public useMeta<T = Meta>(filter?: (meta: Meta) => T): T {
    return this.switchReduxSelector()((state: any) => {
      let customMeta = state[MetaReducer.getName()][this.typePrefix];

      if (customMeta === undefined) {
        customMeta = DEFAULT_META;
      }

      return filter ? filter(customMeta) : customMeta;
    });
  }

  public useMetas<T = Meta>(payloadData?: PayloadData, filter?: (meta: Meta) => T): Metas | T {
    if (payloadData === undefined) {
      filter = undefined;
    }

    return this.switchReduxSelector()((state: any) => {
      let customMetas = state[MetaReducer.getName()][this.typePrefix];

      if (customMetas === undefined) {
        customMetas = DEFAULT_METAS;
      }

      const customMeta = payloadData === undefined ? customMetas : customMetas[payloadData] || DEFAULT_META;

      return filter ? filter(customMeta) : customMeta;
    });
  }

  public useLoading(payloadData?: PayloadData): boolean {
    return payloadData === undefined
      ? this.useMeta((meta) => meta.loading)
      : this.useMetas(payloadData, (meta) => meta.loading) as boolean;
  }

  public connectMeta(): Meta {
    return MetaReducer.getData<Meta>(this.typePrefix) || DEFAULT_META;
  }

  public connectMetas(payloadData?: PayloadData): Metas | Meta {
    const reducer = MetaReducer.getData<Metas>(this.typePrefix);

    return payloadData === undefined
      ? reducer || DEFAULT_METAS
      : reducer && reducer[payloadData] || DEFAULT_META;
  }

  public connectLoading(payloadData?: PayloadData): boolean {
    return payloadData === undefined
      ? this.connectMeta().loading
      : (this.connectMetas(payloadData) as Meta).loading;
  }

  protected onTypePrefixChanged(): void {
    super.onTypePrefixChanged();
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;
  }

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
