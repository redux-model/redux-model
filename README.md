
Redux模型是对原生redux的一次面向对象封装，OOP方案可以实现隐藏重复代码、提高工作效率以及减少开发时间的效果。你只需要花半个小时，就能完全了解模型的用法，并从中受益。

![Travis (.com)](https://img.shields.io/travis/com/fwh1990/redux-model)
![Coveralls github](https://img.shields.io/coveralls/github/fwh1990/redux-model)
![](https://img.shields.io/github/license/fwh1990/redux-model)

[![](https://img.shields.io/npm/dt/@redux-model/web.svg?label=@redux-model/web)](https://www.npmjs.com/package/@redux-model/web)
[![](https://img.shields.io/npm/dt/@redux-model/react-native.svg?label=@redux-model/react-native)](https://www.npmjs.com/package/@redux-model/react-native)
[![](https://img.shields.io/npm/dt/@redux-model/taro.svg?label=@redux-model/taro)](https://www.npmjs.com/package/@redux-model/taro)

# 特性

* 代码量极简，超高效率开发
* 使用mvvm更改reducer，拒绝繁琐
* 完美支持typescript，拥有100%无死角的**业务**代码类型提示
* 请求操作自带loading状态

# 支持平台
| 平台 | NPM |
| ---- | ---- |
| React H5 | @redux-model/web |
| React Native | @redux-model/react-native |
| Taro | @redux-model/taro |

# ES6语法
```javascript
class TestModel extends Model {
    increase = this.action((state) => {
        state.counter += 1;
    });

    getUser = $api.action((id) => {
        return this
            .get('/api/user/' + id)
            .onSuccess((state, action) => {
                state.counter += 1;
                state.users[id] = action.response;
            });
    });

    deleteUser = $api.action((id) => {
        return this
            .delete('/api/user' + id)
            .onSuccess((state) => {
                state.counter -= 1;
                state.users[id] = null;
            });
    });

    initReducer() {
        return {
            counter: 0,
            users: {},
        };
    }
}
```

# TypeScript写法
一次注入，各处100%无死角提示。
```typescript
interface Response {
  id: number;
  name: string;
}

interface Data {
  counter: number;
  users: Partial<{
    [key: string]: Response;
  }>;
}

class TestModel extends Model<Data> {
    increase = this.action((state) => {
        state.counter += 1;
    });

    getUser = $api.action((id) => {
        return this
            .get<Response>('/api/user/' + id)
            .onSuccess((state, action) => {
                state.counter += 1;
                state.users[id] = action.response;
            });
    });

    deleteUser = $api.action((id) => {
        return this
            .delete('/api/user' + id)
            .onSuccess((state) => {
                state.counter -= 1;
                state.users[id] = null;
            });
    });

    protected initReducer(): Data {
        return {
            counter: 0,
            users: {},
        };
    }
}
```

# 文档

点击查看[在线文档](https://fwh1990.github.io/redux-model)

---------------------

欢迎您自由使用并随时创建issue和PR。
