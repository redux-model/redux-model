import {
  Effects,
  IsPayload,
  Meta, MetasLoading,
  Metas,
  PayloadData,
  PayloadKey,
  RequestActionParamNoMeta,
  RequestSubscriber,
  UseSelector,
} from '../utils/types';
import { BaseAction } from './BaseAction';
import { MetaReducer } from '../reducer/MetaReducer';
import { isDebug } from '../../libs/dev';
import { isProxyEnable } from '../utils/dev';
import { HttpServiceHandle } from '../service/HttpServiceHandle';
import { DEFAULT_META, DEFAULT_METAS } from '../utils/meta';
import { NoMetaError } from '../exceptions/NoMetaError';

export abstract class BaseRequestAction<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload, M extends IsPayload<Payload>> extends BaseAction<Data> {
  protected readonly metaKey: boolean | PayloadKey<A>;

  protected readonly prepareCallback?: any;

  protected readonly successCallback?: any;

  protected readonly failCallback?: any;

  protected prepareType: string;

  protected failType: string;

  // Avoid re-render component even if reducer data doesn't change.
  protected loadingsCache?: [Metas, MetasLoading<Payload, M>];

  public constructor(config: RequestActionParamNoMeta<Data, A, Response, Payload>, instanceName: string) {
    super(instanceName);

    this.metaKey = config.metaKey === undefined ? true : config.metaKey;
    this.prepareCallback = config.onPrepare;
    this.successCallback = config.onSuccess;
    this.failCallback = config.onFail;
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;

    if (!isDebug() || !isProxyEnable()) {
      this.registerMetas();
    }

    // @ts-ignore
    return this.proxy((...args: Parameters<A>) => {
      return (config.fetch(...args) as unknown as HttpServiceHandle<Response, Payload>)
        .setTypes({
          prepare: this.prepareType,
          success: this.successType,
          fail: this.failType,
        })
        .runAction();
    }, [
      'onSuccess', 'onPrepare', 'onFail',
      'getPrepareType', 'getFailType',
      'useMeta', 'useMetas', 'useLoading', 'useLoadings',
    ], [
      'meta', 'metas', 'loading', 'loadings',
    ]);
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
      when: this.failType,
      effect,
    };
  }

  public collectEffects(): Effects<Data> {
    const effects = [
      ...super.collectEffects(),
    ];

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

  public getPrepareType(): string {
    return this.prepareType;
  }

  public getFailType(): string {
    return this.failType;
  }

  public useMeta<T extends keyof Meta>(key?: T): Meta | Meta[T] {
    if (this.metaKey === false) {
      throw new NoMetaError(this.instanceName);
    }

    return this.switchReduxSelector()((state: any) => {
      let customMeta: Meta | undefined = state[MetaReducer.getName()][this.typePrefix];

      if (customMeta === undefined) {
        customMeta = DEFAULT_META;
      }

      return key ? customMeta[key] : customMeta;
    });
  }

  public useMetas<T extends keyof Meta>(payload?: PayloadData<Payload, M>, key?: T): Metas<Payload, M> | Meta[T] {
    if (this.metaKey === false) {
      throw new NoMetaError(this.instanceName);
    }

    if (payload === undefined) {
      key = undefined;
    }

    return this.switchReduxSelector()((state: any) => {
      let customMetas = state[MetaReducer.getName()][this.typePrefix];

      if (customMetas === undefined) {
        customMetas = DEFAULT_METAS;
      }

      const customMeta: Metas = payload === undefined ? customMetas : customMetas[payload] || DEFAULT_META;

      return key
        ? customMeta[key]
        : customMeta;
    });
  }

  public useLoading(): boolean {
    return this.useMeta('loading') as boolean;
  }

  public useLoadings(payload?: PayloadData<Payload, M>): boolean | MetasLoading<Payload, M> {
    return payload === undefined
      ? this.getLoadingHandle(<Metas>this.useMetas())
      : this.useMetas(payload, 'loading') as boolean;
  }

  public get meta(): Meta {
    if (this.metaKey === false) {
      throw new NoMetaError(this.instanceName);
    }

    return MetaReducer.getData<Meta>(this.typePrefix) || DEFAULT_META;
  }

  public get metas(): Metas<Payload, M> {
    if (this.metaKey === false) {
      throw new NoMetaError(this.instanceName);
    }

    return MetaReducer.getData<Metas>(this.typePrefix) || DEFAULT_METAS;
  }

  public get loading(): boolean {
    return this.meta.loading;
  }

  public get loadings(): MetasLoading<Payload, M> {
    return this.getLoadingHandle(this.metas);
  }

  protected getLoadingHandle(metas: Metas): MetasLoading<Payload, M> {
    if (!this.loadingsCache || this.loadingsCache[0] !== metas) {
      this.loadingsCache = [metas, {
        pick: (payload) => {
          return metas.pick(payload).loading;
        },
      }];
    }

    return this.loadingsCache[1];
  }

  protected onTypePrefixChanged(): void {
    super.onTypePrefixChanged();
    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;

    if (isDebug() && isProxyEnable()) {
      this.registerMetas();
    }
  }

  protected registerMetas() {
    if (this.metaKey !== false) {
      const types = {
        prepare: this.prepareType,
        success: this.successType,
        fail: this.failType,
      };

      if (this.metaKey === true) {
        MetaReducer.addCase(this.typePrefix, types, false, '');
      } else {
        MetaReducer.addCase(this.typePrefix, types, true, this.metaKey);
      }
    }
  }

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
