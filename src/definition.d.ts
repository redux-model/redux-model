import { AxiosError, AxiosRequestConfig, Canceler } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI, Reducer } from 'redux';

interface Action<T = any> {
    type: T
}

type AnyFunctionReturnType<T> = T extends (...args: any) => infer R ? R : never;

type EnsureState<T> = {
    [key in keyof T]: AnyFunctionReturnType<T[key]>;
};

export declare const createReducers: <T extends any>(reducers: T) => Reducer<EnsureState<T>>;

export declare enum METHOD {
    get = "GET",
    post = "POST",
    put = "PUT",
    delete = "DELETE",
    head = "HEAD",
    patch = "PATCH"
}

export declare enum HTTP_STATUS_CODE {
    ok = 200,
    created = 201,
    accepted = 202,
    noContent = 204,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    unProcessableEntity = 422,
    serviceError = 500,
    badGateWay = 502,
    serviceUnavailable = 503
}

export declare abstract class Model<Data> {
    private static COUNTER;
    protected readonly successType: string;
    private readonly instanceCounter;
    constructor(name?: string);
    getSuccessType(): string;
    createData(): (state: Data | undefined, action: any) => Data;
    protected getEffects(): ReducerEffects<Data>;
    protected getTypePrefix(): string;
    protected abstract getInitValue(): Data;
    protected abstract onSuccess(state: Data, action: any): Data;
}

interface DenyData {
    DO_NOT_USE_REDUCER: true;
}

export declare abstract class ReducerModel<Data = {}> extends Model<Data> {
    protected onSuccess(): Data & DenyData;
}

export declare abstract class NormalModel<Data = {}, Payload extends AnyObject = {}> extends Model<Data> {
    constructor(name?: string);
    abstract action(...args: any[]): NormalAction<Payload>;
    dispatch(dispatch: Dispatch, action: NormalAction<Payload>): NormalAction<Payload>;
    protected createAction(payload: Payload): NormalAction<Payload>;
    protected abstract onSuccess(state: Data, action: NormalAction<Payload>): Data;
}

export declare abstract class NormalActionModel<Payload extends AnyObject = {}> extends NormalModel<DenyData, Payload> {
    protected getInitValue(): DenyData;
    protected onSuccess(): DenyData;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare type CreateActionOption<Payload = AnyObject> = Partial<Omit<RequestAction<Payload>, 'type' | 'middleware' | 'uri' | 'method'>>;

export declare abstract class RequestModel<Data = {}, Response = {}, Payload extends AnyObject = {}> extends Model<Data> {
    protected readonly prepareType: string;
    protected readonly failType: string;
    constructor(name?: string);
    getPrepareType(): string;
    getFailType(): string;
    createMeta(): (state: ReducerMeta | undefined, action: ResponseAction) => ReducerMeta;
    createMetas(payloadKey: string): (state: ReducerMetas | undefined, action: ResponseAction<{}, Payload>) => ReducerMetas;
    dispatch(dispatch: Dispatch, action: MiddlewareReturnObject<Response, Payload>): MiddlewareReturnObject<Response, Payload>;
    abstract action(...args: any[]): MiddlewareReturnObject<Response, Payload>;
    protected get(uri: string, options?: CreateActionOption<Payload>): MiddlewareReturnObject<Response, Payload>;
    protected post(uri: string, options?: CreateActionOption<Payload>): MiddlewareReturnObject<Response, Payload>;
    protected put(uri: string, options?: CreateActionOption<Payload>): MiddlewareReturnObject<Response, Payload>;
    protected patch(uri: string, options?: CreateActionOption<Payload>): MiddlewareReturnObject<Response, Payload>;
    protected delete(uri: string, options?: CreateActionOption<Payload>): MiddlewareReturnObject<Response, Payload>;
    protected abstract onSuccess(state: Data, action: ResponseAction<Response, Payload>): Data;
    protected abstract getMiddlewareName(): string;
    private createAction;
}

export declare abstract class SocketModel<Payload extends AnyObject = {}> extends NormalModel<DenyData, Payload> {
    dispatch(dispatch: Dispatch, action: SocketAction<Payload>): SocketAction<Payload>;
    abstract action(...args: any[]): SocketAction<Payload>;
    protected createAction(payload: Payload): SocketAction<Payload>;
    protected getInitValue(): DenyData;
    protected onSuccess(): DenyData;
    protected abstract getMiddlewareName(): string;
}

interface FailTransform {
    httpStatus?: HTTP_STATUS_CODE;
    errorMessage?: string;
    businessCode?: string;
}

export declare const createRequestMiddleware: <State extends AnyObject>(config: {
    id: string;
    baseUrl: string;
    axiosConfig?: AxiosRequestConfig | undefined;
    onInit?: ((api: MiddlewareAPI<Dispatch, State>, action: RequestAction<AnyObject, RequestTypes>) => void) | undefined;
    getHeaders: (api: MiddlewareAPI<Dispatch, State>) => AnyObject;
    onFail: (error: AxiosError, transform: FailTransform) => void;
    onShowSuccess: (message: string) => void;
    onShowError: (message: string) => void;
}) => Middleware<{}, State, Dispatch>;

declare global {
    interface AnyObject {
        [key: string]: any;
    }

    type ReducerEffects<Data> = Array<{
        when: string;
        effect: (state: Data, action: any) => Data;
    }>;

    interface ReducerMeta {
        actionType: string;
        loading: boolean;
        errorMessage?: string;
        httpStatus?: number;
        businessCode?: string | number;
    }

    type ReducerMetas = Partial<{
        [key: string]: ReducerMeta;
    }>;

    interface RequestTypes {
        prepare: string;
        success: string;
        fail: string;
    }

    interface MiddlewareReturnObject<Response = {}, Payload = {}> {
        promise: Promise<ResponseAction<Response, Payload>>;
        cancel: Canceler;
    }

    interface NormalAction<Payload = AnyObject, Type = string> extends Action<Type> {
        payload: Payload;
    }

    interface SocketAction<Payload = AnyObject, Type = string> extends NormalAction<Payload, Type> {
        middleware: string;
    }

    interface RequestAction<Payload = AnyObject, Type = RequestTypes> extends NormalAction<Payload, Type> {
        middleware: string;
        method: METHOD;
        uri: string;
        requestOptions: AxiosRequestConfig;
        body: AnyObject;
        // queryString
        query: AnyObject;
        successText: string;
        hideError: boolean | ((response: ResponseAction<any>) => boolean);
    }

    interface ResponseAction<Response = {}, Payload = AnyObject> extends RequestAction<Payload, string> {
        response: Response;
        errorMessage?: string;
        httpStatus?: HTTP_STATUS_CODE;
        businessCode?: string;
    }
}
