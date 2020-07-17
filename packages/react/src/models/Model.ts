import { AxiosRequestConfig } from 'axios';
import { BaseModel } from '@redux-model/core';
import * as ReactRedux from 'react-redux';
import { ComposeAction } from '../actions/ComposeAction';

export abstract class Model<Data = null> extends BaseModel<Data, AxiosRequestConfig> {
  // Hooks can't be used in condition statement like: x.useLoading() || y.useLoading()
  // So we provide a quick way to combine all loading values.
  public static useLoading(...useLoading: boolean[]): boolean {
    return useLoading.some((is) => is);
  }

  public useData(): Data;
  public useData<T>(filter: (data: Data) => T): T;
  public useData(filter?: (data: Data) => any): any {
    return ReactRedux.useSelector(() => {
      return filter ? filter(this.data) : this.data;
    });
  }

  protected compose<Fn extends (...args: any[]) => Promise<any>>(fn: Fn): Fn & ComposeAction<Data, Fn> {
    const action = new ComposeAction<Data, Fn>(this, fn);

    return action as Fn & typeof action;
  }
}
