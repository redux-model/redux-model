import { combineReducers, Reducer } from 'redux';

type AnyFunctionReturnType<T> = T extends (...args: any) => infer R ? R : never;

// Useful for webStorm
type EnsureState<T> = {
    [key in keyof T]: AnyFunctionReturnType<T[key]>;
};

export const createReducers = <T extends any>(reducers: T): Reducer<EnsureState<T>> => {
    return combineReducers(reducers);
};
