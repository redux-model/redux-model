import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { NormalAction } from './action/NormalAction';
import { ActionNormal, Effects, NormalActionParam, Reducers, RequestActionNoMeta, RequestActionParam, RequestActionParamWithMeta, RequestActionParamWithMetas, RequestActionWithMeta, RequestActionWithMetas, RequestOptions } from './utils/types';
import { FetchHandle } from '../libs/types';

type EnhanceResponse<A> = A extends (...args: any[]) => FetchHandle<infer R, any> ? R : never;
type EnhancePayload<A> = A extends (...args: any[]) => FetchHandle<any, infer P> ? P : never;
type EnhanceNormalPayload<A> = A extends (...args: any[]) => ActionNormal<infer P> ? P : never;

export declare abstract class BaseModel<Data = null> {
    static middlewareName: string;
    static isLoading(...fromUseLoading: boolean[]): boolean;

    constructor(instanceName?: string);

    register(): Reducers;

    useData<T = Data>(filter?: (data: Data) => T): T;
    connectData(rootState: any): Data;

    protected actionNormal<A extends (...args: any[]) => ActionNormal<Payload>, Payload = EnhanceNormalPayload<A>>(config: NormalActionParam<Data, A, Payload>): NormalAction<Data, A, Payload>;

    protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(config: RequestActionParam<Data, A, Response, Payload>): RequestActionNoMeta<Data, A, Response, Payload>;
    protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(config: RequestActionParamWithMeta<Data, A, Response, Payload>): RequestActionWithMeta<Data, A, Response, Payload>;
    protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(config: RequestActionParamWithMetas<Data, A, Response, Payload>): RequestActionWithMetas<Data, A, Response, Payload>;

    protected actionThunk<A extends (...args: any[]) => ThunkAction<any, any, any, Action>>(action: A): (...args: Parameters<A>) => ReturnType<ReturnType<A>>;

    protected emit<Payload = undefined>(payload?: Payload): ActionNormal<Payload>;

    protected get<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload>;
    protected post<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload>;
    protected put<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload>;
    protected delete<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload>;

    protected effects(): Effects<Data>;
    protected getMiddlewareName(): string;
    protected abstract initReducer(): Data;
}
