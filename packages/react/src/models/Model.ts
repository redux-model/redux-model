import { AxiosRequestConfig } from 'axios';
import { BaseModel } from '../core';
import * as ReactRedux from 'react-redux';
import { ComposeAction } from '../actions/ComposeAction';

export abstract class Model<Data = null> extends BaseModel<Data, AxiosRequestConfig> {
  public static useLoading(...actions: { useLoading(): boolean }[]): boolean {
    return actions.reduce((carry: boolean, action) => {
      // Hooks shouldn't be in condition statement
      const useLoading = action.useLoading();

      return carry || useLoading;
    }, false);
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
