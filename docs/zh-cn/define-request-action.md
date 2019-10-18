# 定义Request Action
请求Action本质也是一个action，唯一区别就是它是异步的。

```typescript
import { Model } from '@redux-model/web';
import { $api } from './ApiService';

interface Response {
    id: number;
    name: string;
}

type Data = Partial<Response>;

class ThirdModel extends Model<Data> {
    getProfile = $api.action((userId: number) => {
        return this
            .get<Response>('/profile')
            .query({
                userId,
            })
            // 请求成功时，变更reducer
            .onSuccess((state, action) => {
                return action.response;
            })
    });

    protected initReducer(): Data {
        return {};
    }
}

export const thirdModel = new ThirdModel();
```

我们定义了一个名为`getProfile`的请求Action，并在请求成功时，把获取到的数据直接作为reducer的新数据。

```typescript
console.log(thirdModel.data.id)   // id === undefined
console.log(thirdModel.data.name) // name === undefined

await thirdModel.getProfile(2);   // 假设请求成功

console.log(thirdModel.data.id)   // id === 2
console.log(thirdModel.data.name) // name === 'peter'
```

------

### Reducer事件

并不是只有请求成功才能变更reducer，你也可以选择在请求之前和请求失败的时候更改Reducer

```typescript
getProfile = $api.action(() => {
    return this
        .get(...)

        // 当准备请求
        .onPrepare((state, action) => {
             state.id = 0;
             state.name = 'unknown';
        })

        // 当请求成功
        .onSuccess((state, action) => {
             return action.response;
        })
    
        // 请求失败
        .onFail((state, action) => {
            return {};
        })
});
```

# Promise
Request Action支持正常的promise事件，你可以在组件中轻松拿到最新的数据而无需通过react-redux.connect()或者hooks.useData()

```typescript
thirdModel.getProfile(2).then(({ response }) => {
    console.log(response.id) // id === 2
});
```

# 终止请求
有时候，当前的请求已经没有意义，你想立即取消这次请求。你可以这么做：

```typescript
const promise = thirdModel.getProfile(2);

promise.cancel(); // 取消成功
```
