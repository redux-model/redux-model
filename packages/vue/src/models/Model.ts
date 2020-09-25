import * as Vue from 'vue';
import { AxiosRequestConfig } from 'axios';
import { BaseModel } from '@redux-model/core';
import { ComposeAction } from '../actions/ComposeAction';

export abstract class Model<Data = null> extends BaseModel<Data, AxiosRequestConfig> {
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
  public useData(): Vue.ComputedRef<Data>;
  public useData<T>(selector: (data: Data) => T): Vue.ComputedRef<T>;
  public useData(selector?: (data: Data) => any): any {
    return Vue.computed(() => {
      return selector ? selector(this.data) : this.data;
    });
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
