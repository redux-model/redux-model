Redux默认都是处理Restful接口，现在我们赋予它支持Graphql的能力
### 安装
```bash
yarn add @redux-model/graphql
```
您也可以访问[这个仓库](https://github.com/redux-model/graphql)以获得全部信息

### 原始模板
我们知道，原始模板不仅枯燥，而且写完就是一串字符串，根本没有类型提示。在TS项目，如果再手写一遍类型，这个是无法忍受的。如果您通过cli自动生成类型，也会面临维护不及时的困扰，而且这不符合懒人的气质。
```
query getUser {
  getUser {
    id
    name
    bankAccount {
      id
      branch
    }
  }
}
```

### 生成模板
```typescript
import { type, graphql } from '@redux-model/graphql';

const tpl = graphql.query({
  getUser: {
    id: type.number,   // number
    name: type.string, // string
    bankAccount: {     // object
      id: type.number,
      branch: type.string.number,   // string | number
    },
  }
});
```

### 获取类型
```typescript
type Response = {
  data: typeof tpl.type,
}

type Data = {
  list?: Response['data'],
}
```
### 使用
```typescript
class TestModel extends Model<Data> {
  getUser = $api.action(() => {
    return this
      .post<Response>('/graphql')
      .graphql(tpl)
      .onSuccess((state, action) => {
        state.list = action.response.data;
      });
  });

  protected initialState(): Data {
    return {};
  }
}
```
