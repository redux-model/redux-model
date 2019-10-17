import {
  Meta, MetasLoading,
  Metas,
  PayloadData,
  RequestSubscriber,
  UseSelector,
} from '../utils/types';
import { BaseAction } from './BaseAction';
import { MetaReducer } from '../reducer/MetaReducer';
import { HttpServiceHandle } from '../service/HttpServiceHandle';
import { DEFAULT_META, DEFAULT_METAS } from '../utils/meta';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { isDebug } from '../../libs/dev';
import { isProxyEnable } from '../utils/dev';

export abstract class BaseRequestAction<Data, A extends (...args: any[]) => HttpServiceHandle<Data, Response, Payload, M>, Response, Payload, M> extends BaseAction<Data> {
  protected prepareType: string;

  protected failType: string;

  // Avoid re-render component even if reducer data doesn't change.
  protected loadingsCache?: [Metas, MetasLoading<Payload, M>];

  public constructor(request: A, instanceName: string, runAction: (action: ActionRequest) => FetchHandle<Response, Payload>) {
    super(instanceName);

    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;

    if (!isDebug() || !isProxyEnable()) {
      this.registerMetas();
    }

    // @ts-ignore
    return this.proxy((...args: Parameters<A>) => {
      const action = (request(...args) as unknown as HttpServiceHandle<Data, Response, Payload, M>)
        .collect({
          prepare: this.prepareType,
          success: this.successType,
          fail: this.failType,
        });

      return runAction(action);
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

  public getPrepareType(): string {
    return this.prepareType;
  }

  public getFailType(): string {
    return this.failType;
  }

  public useMeta<T extends keyof Meta>(key?: T): Meta | Meta[T] {
    return this.switchReduxSelector()((state: any) => {
      let customMeta: Meta | undefined = state[MetaReducer.getName()][this.typePrefix];

      if (customMeta === undefined) {
        customMeta = DEFAULT_META;
      }

      return key ? customMeta[key] : customMeta;
    });
  }

  public useMetas<T extends keyof Meta>(payload?: PayloadData<Payload, M>, key?: T): Metas<Payload, M> | Meta[T] {
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
    return MetaReducer.getData<Meta>(this.typePrefix) || DEFAULT_META;
  }

  public get metas(): Metas<Payload, M> {
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
    const types = {
      prepare: this.prepareType,
      success: this.successType,
      fail: this.failType,
    };

    MetaReducer.addCase(this.typePrefix, types);
  }

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
