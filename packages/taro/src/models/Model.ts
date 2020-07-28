import * as ReactRedux from 'react-redux';
import { BaseModel } from '@redux-model/core';
import { ComposeAction } from '../actions/ComposeAction';
import { TaroRequestConfig } from '../services/HttpService';

export abstract class Model<Data = null> extends BaseModel<Data, TaroRequestConfig> {
  // Hooks can't be used in condition statement like: x.useLoading() || y.useLoading()
  // So we provide a quick way to combine all loading values.
  public static useLoading(...useLoading: boolean[]): boolean {
    return useLoading.some((is) => is);
  }

  public useData(): Data;
  public useData<T>(selector: (data: Data) => T, shallowEqual?: boolean): T;
  public useData(selector?: (data: Data) => any, shallowEqual?: boolean): any {
    return ReactRedux.useSelector(() => {
      return selector ? selector(this.data) : this.data;
    }, shallowEqual ? ReactRedux.shallowEqual : undefined);
  }

  protected compose<Fn extends (...args: any[]) => Promise<any>>(fn: Fn): Fn & ComposeAction<Data, Fn> {
    const action = new ComposeAction<Data, Fn>(this, fn);

    return action as Fn & typeof action;
  }
}
