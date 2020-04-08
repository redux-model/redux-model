import { BaseTestModel } from './BaseTestModel';
import { basicModel } from './BasicModel';
import { requestModel } from './RequestModel';

interface Response {
  id: number;
  name: string;
}

type Data = Response;

export class SubDispatchModel extends BaseTestModel<Data> {
  resetMe = this.action(() => {
    return {
      id: 1,
      name: 'KK',
    };
  });

  changeId = this.action((state, payload: number) => {
    state.id = payload;
  });

  changeName = this.action((state, payload: string) => {
    state.name = payload;
  });

  subDispatch = this.action((state, payload: number) => {
    this.changeName('Kite');
    state.id = payload;
  });

  notAllowNewObject = this.action((state) => {
    this.resetMe();
    state.name = 'ccc';
  });

  changeBeforeSubAction = this.action((state) => {
    state.id = 100;
    this.changeName('Jim');
  });

  requestActionInNormalAction = this.action((_, id: number) => {
    requestModel.getProfileById(id);
  });

  multiSubAction = this.action(() => {
    this.changeId(15);
    this.changeName('YoYo');
  });

  callOtherModelAction = this.action((state, id: number) => {
    state.id = id;

    basicModel.modify({
      id,
    });
  });

  callMultiOtherModelAction = this.action((state, id: number) => {
    state.id = id;

    basicModel.modify({ id });
    requestModel.getProfileById(id);
  });

  onlyCallOtherModelAction = this.action((_, id: number) => {
    basicModel.modify({ id });
    requestModel.getProfileById(id);
  });

  protected initReducer(): Data {
    return {
      id: 0,
      name: 'TT',
    };
  }
}

export const subDispatchModel = new SubDispatchModel();
