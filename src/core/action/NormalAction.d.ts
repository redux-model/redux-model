import { BaseAction } from './BaseAction';
import { ActionNormal, NormalSubscriber } from '../utils/types';

export declare class NormalAction<Data, A extends (...args: any[]) => ActionNormal<Payload>, Payload> extends BaseAction<Data> {
    readonly action: A;

    onSuccess<CustomData>(effect: (state: CustomData, action: ActionNormal<Payload>) => CustomData): NormalSubscriber<CustomData, Payload>;
}
