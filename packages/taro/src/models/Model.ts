import * as ReactRedux from 'react-redux';
import { BaseModel, HttpServiceBuilderWithMeta } from '@redux-model/core';
import { ComposeAction } from '../actions/ComposeAction';
import { TaroRequestConfig } from '../services/HttpService';

export abstract class Model<Data = null> extends BaseModel<Data, TaroRequestConfig> {
  // Hooks can't be used in condition statement like: x.useLoading() || y.useLoading()
  // So we provide a quick way to combine all loading values.
  public static useLoading(...useLoading: boolean[]): boolean {
    return useLoading.some((is) => is);
  }

  /**
   * @deprecated
   * Taro doesn't support request method `patch`, actually, it's limited by mini-program.
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
   */
  protected patch<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, TaroRequestConfig> {
    return super.patch(uri);
  }

  /**
   * Use selector to pick minimum collection to against re-render
   * ```typescript
   * const counter = model.useData((state) => {
   *   return state.counter;
   * });
   * ```
   * Set shallowEqual `true` when you respond a new object.
   * ```typescript
   * const { counter } = model.useData((state) => {
   *   return { counter: state.counter };
   * }, true);
   * ```
   */
  public useData(): Data;
  public useData<T>(selector: (data: Data) => T, shallowEqual?: boolean): T;
  public useData(selector?: (data: Data) => any, shallowEqual?: boolean): any {
    return ReactRedux.useSelector(() => {
      return selector ? selector(this.data) : this.data;
    }, shallowEqual ? ReactRedux.shallowEqual : undefined);
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
