import { combineReducers, Reducer } from 'redux';
import { EnhanceState } from '../../../index';
import { reducers } from '../models';

declare global {
  type RootState = Readonly<ReturnType<typeof rootReducers>>;
}

export const rootReducers: Reducer<EnhanceState<typeof reducers>> = combineReducers(reducers);
