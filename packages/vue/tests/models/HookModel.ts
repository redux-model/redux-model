import { TestModel } from '../libs/TestModel';
import { $api } from '../libs/ApiService';

interface Data {
  count: number;
}

export class HookModel  extends TestModel<Data> {
  increase = this.action((state) => {
    state.count += 1;
  });

  fetch = $api.action(() => {
    return this.get<Data>('/');
  });

  multipleFetch = $api.action((id: number) => {
    return this.get('/').metas(id);
  });

  mixFetch = this.compose(async (id: number) => {
    const { response } = await this.fetch();
    await this.multipleFetch(id);

    this.changeState((state) => {
      state.count = response.count;
    });
  });

  protected initialState(): Data {
    return {
      count: 0,
    };
  }
}
