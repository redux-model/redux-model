import { AxiosRequestConfig } from 'axios';
import { BaseModel, shallowEqual } from '@redux-model/core';
import * as ReactRedux from 'react-redux';
import { ComposeAction } from '../actions/ComposeAction';

export abstract class Model<Data = null> extends BaseModel<Data, AxiosRequestConfig> {
  // Hooks can't be used in condition statement like: x.useLoading() || y.useLoading()
  // So we provide a quick way to combine all loading values.
  public static useLoading(...useLoading: boolean[]): boolean {
    return useLoading.some((is) => is);
  }

  /**
   * Use selector to pick minimum collection to against re-render
   * ```typescript
   * const counter = model.useData((state) => {
   *   return state.counter;
   * });
   * ```
   */
  public useData(): Data;
  public useData<T>(selector: (data: Data) => T): T;
  public useData(selector?: (data: Data) => any): any {
    return ReactRedux.useSelector(() => {
      return selector ? selector(this.data) : this.data;
    }, shallowEqual);
  }

  /**
   * The action which compose aysnchorize program and hold loading.
   * ```
   * class TestModel extends Model {
   *   updateRoom = this.compose(async (id: number) => {
   *     const roomId = await getRoomId(id);
   *     const userId = await getUserId(roomId);
   *
   *     this.changeState((state) => {
   *       state.push([userId, roomId]);
   *     });
   *   });
   * }
   *
   * const testModel = new TestModel();
   *
   * -------------
   *
   * // Hold loading
   * const loading = testModel.updateRoom.useLoading();
   * // Dispatch action
   * const promise = testModel.updateRoom(10);
   * ```
   */
  protected compose<Fn extends (...args: any[]) => Promise<any>>(fn: Fn): Fn & ComposeAction<Data, Fn> {
    const action = new ComposeAction<Data, Fn>(this, fn);

    return action as Fn & typeof action;
  }
}
