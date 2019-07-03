import { combineReducers, Reducer } from 'redux';
import { EnhanceState } from '../../../index';

const reducers = {
  ok: (state = {}) => state,
};

declare global {
  type RootState = Readonly<ReturnType<typeof rootReducers>>;
}

export const rootReducers: Reducer<EnhanceState<typeof reducers>> = combineReducers(reducers);
