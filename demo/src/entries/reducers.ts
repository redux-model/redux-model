import { combineReducers, Reducer } from 'redux';
import { reducers } from '../models';
import { EnhanceState } from '../../../index';

declare global {
  type RootState = Readonly<ReturnType<typeof rootReducers>>;
}

export const rootReducers: Reducer<EnhanceState<typeof reducers>> = combineReducers(reducers);
