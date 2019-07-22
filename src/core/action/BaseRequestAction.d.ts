import { ActionResponse, RequestSubscriber } from '../utils/types';
import { FetchHandle } from '../../libs/types';
import { NormalAction } from './NormalAction';

// @ts-ignore
export declare abstract class BaseRequestAction<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends NormalAction<Data, A, Payload> {
    readonly action: A;

    // @ts-ignore
    onSuccess<CustomData>(effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;
    onPrepare<CustomData>(effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;
    onFail<CustomData>(effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;

    getPrepareType(): string;
    getFailType(): string;
}
