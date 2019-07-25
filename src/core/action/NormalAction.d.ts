import { BaseAction } from './BaseAction';
import { ActionNormal, NormalSubscriber } from '../utils/types';

export declare class NormalAction<Data, A extends (...args: any[]) => ActionNormal<Payload>, Payload> extends BaseAction<Data> {
    readonly action: A;

    onSuccess<CustomData>(effect: NormalSubscriber<CustomData, Payload>['effect']): NormalSubscriber<CustomData, Payload>;
}
