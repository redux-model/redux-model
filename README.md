<h1 align="center">
  <a href="https://fwh1990.github.io/redux-model">
    Redux Model
  </a>
</h1>

Redux Model is created to make up original redux which has complex development flow and cause low efficiency for the developer. also, the business code in your project will be larger than expected.

With typescript, you are required to define type or inject interface for every action and reducer. In addition, it's difficult to build relation between request action and middleware by inject type definition.

However, Redux Model has resolved these problems. Simplify development flow, reduce code and smart type checking.

![License](https://img.shields.io/github/license/fwh1990/redux-model?color=blue)
![Travis (.com)](https://img.shields.io/travis/com/fwh1990/redux-model)
![Coveralls github](https://img.shields.io/coveralls/github/fwh1990/redux-model)

[![](https://img.shields.io/npm/dt/@redux-model/web.svg?label=@redux-model/web)](https://www.npmjs.com/package/@redux-model/web)
[![](https://img.shields.io/npm/dt/@redux-model/react-native.svg?label=@redux-model/react-native)](https://www.npmjs.com/package/@redux-model/react-native)
[![](https://img.shields.io/npm/dt/@redux-model/taro.svg?label=@redux-model/taro)](https://www.npmjs.com/package/@redux-model/taro)

# Features

* Less code and high efficiency
* Modify reducer by mvvm
* 100% type checking with typescript
* Trace loading status for each request action
* Support react hooks

# Installation
| Platform | Npm Package |
| ---- | ---- |
| React Web | @redux-model/web |
| React Native | @redux-model/react-native |
| Taro | @redux-model/taro |

# Define Model
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

    protected initReducer(): Data {
        return {
            counter: 0,
            users: {},
        };
    }
}

export const testModel = new TestModel();
```

# For React Hooks
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

# For Redux connect
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

# Document

Here is the [document](https://fwh1990.github.io/redux-model)

---------------------

Feel free to use it and welcome to send PR to me.
