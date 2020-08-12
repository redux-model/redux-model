业务场景中有一个尴尬的问题，就是页面展示了一组数据，然后您还有一个弹窗模块，弹窗里的数据来自同一个接口，但是因为参数原因弹窗内容与页面上的不一致。而且弹窗关闭后，页面的数据要求不能变。

在原生Redux中，您可能会考虑复制一套新的 action + type + reducer 来存储弹窗里的数据。或者在原来的action里增加一个key来判断属于哪个业务场景，这样reducer的数据结构变得更复杂。

在模型里，最简单的方法就是再实例化一个模型：
```typescript
type Response = Array<{}>;

type Data = Partial<{
  [key: string]: Response;
}>;

class MyModel extends Model<Data> {
  manage = $api.action((page: number, query: object) => {
    return this
      .get<Response>('/api')
      .query({
        page: page,
        pageSize: 10,
        ...query,
      })
      .onSuccess((state, action) => {
        state[page] = action.response;
      });
  });

  protected initialState(): Data {
    return {};
  }
}

export const pageModel = new MyModel();
export const popupModel = new MyModel();
```
您可以无限实例化模型，虽然拥有相同的action，但它们的数据是独立的。对于页面，使用`pageModel`来管理；对于弹窗，使用`popupModel`来管理，各司其职。

这种处理方式还有一个便利就是可以直接使用`useLoading()`方法。

如果您只实例化一个模型，那无疑要增加type来区分数据了，增加了数据复杂度的同时，也增加了操作难度。对于状态追踪，必须在action中加入`.metas(type)`，并在组件中配合`useLoadings(type)`方法使用。

```typescript
type Response = Array<{}>;

interface Data {
  page: Partial<{
    [key: string]: Response;
  }>;
  popup: Partial<{
    [key: string]: Response;
  }>
}

class MyModel extends Model<Data> {
  manage = $api.action((type: keyof Data, page: number, query: object) => {
    return this
      .get<Response>('/api')
      .query(...)
      .metas(type)
      .onSuccess((state, action) => {
        state[type][page] = action.response;
      });
  });

  protected initialState() {
    return {
      page: {},
      popup: {},
    };
  }
}

const model = new MyModel();
```
