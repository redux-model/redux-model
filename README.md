<h1 align="center">
  <a href="https://fwh1990.github.io/redux-model">
    Redux Model
  </a>
</h1>

Redux Model的存在是为了弥补原生Redux繁琐的开发流程，开发者生产力低下，代码量臃肿，以及因action和reducer文件分散造成代码追踪困难的问题。

Redux Model同时弥补了在typescript项目中，每个地方都需要类型注入，而且异步请求和middleware的关系难以使用类型定义的问题，让业务代码以最少的类型注入得到最大化的智能提示。

![License](https://img.shields.io/github/license/fwh1990/redux-model?color=blue)
![Travis (.com)](https://img.shields.io/travis/com/fwh1990/redux-model)
![Coveralls github](https://img.shields.io/coveralls/github/fwh1990/redux-model)

[![](https://img.shields.io/npm/dt/@redux-model/web.svg?label=@redux-model/web)](https://www.npmjs.com/package/@redux-model/web)
[![](https://img.shields.io/npm/dt/@redux-model/react-native.svg?label=@redux-model/react-native)](https://www.npmjs.com/package/@redux-model/react-native)
[![](https://img.shields.io/npm/dt/@redux-model/taro.svg?label=@redux-model/taro)](https://www.npmjs.com/package/@redux-model/taro)

# 特性

* 代码量极简，超高开发效率
* 使用mvvm更改reducer，一步到位
* 基于typescript定制，拥有200%无死角的**业务**代码类型提示
* 每个请求的action都自带loading状态记录
* 支持React Hooks

# 下载
| 平台 | NPM |
| ---- | ---- |
| React Web | @redux-model/web |
| React Native | @redux-model/react-native |
| Taro | @redux-model/taro |

# 定义模型
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

export const testModel = new TestModel();
```

# React Hooks
```typescript
import React, { FC } from 'react';

const App: FC = () => {
    const counter = testModel.useData((data) => data.counter);
    const loading = testModel.getUser.useLoading();

    const increase = () => {
        testModel.increase();
        testModel.getUser(3);
    };

    return (
        <button onClick={increase}>
            {loading ? 'Waiting...' : `You clicked ${counter} times`}
        </button>
    );
};

export default App;
```

# Redux connect
```typescript
import React, { FC } from 'react';

type Props = ReturnType<typeof mapStateToProps>;

const App: FC<Props> = (props) => {
    const { loading, counter } = props;

    const increase = () => {
        testModel.increase();
        testModel.getUser(3);
    };

    return (
        <button onClick={increase}>
            {loading ? 'Waiting...' : `You clicked ${counter} times`}
        </button>
    );
};

const mapStateToProps = () => {
    return {
        counter: testModel.data.counter,
        loading: testModel.getUser.loading,
    };
};

export default connect(mapStateToProps)(App);
```

# 文档

点击查看[在线文档](https://fwh1990.github.io/redux-model)

---------------------

欢迎您自由使用并随时创建issue和PR。
