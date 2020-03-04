<h1 align="center">
  <a href="https://redux-model.github.io/redux-model">
    Redux Model
  </a>
</h1>

Redux Model is created to enhance original redux framework, which has complex development flow and lots of template fragments.

![License](https://img.shields.io/github/license/redux-model/redux-model?color=blue)
![Travis (.com)](https://img.shields.io/travis/com/redux-model/redux-model)
![Coveralls github](https://img.shields.io/coveralls/github/redux-model/redux-model)

[![](https://img.shields.io/npm/dt/@redux-model/web.svg?label=@redux-model/web)](https://www.npmjs.com/package/@redux-model/web)
[![](https://img.shields.io/npm/dt/@redux-model/react-native.svg?label=@redux-model/react-native)](https://www.npmjs.com/package/@redux-model/react-native)
[![](https://img.shields.io/npm/dt/@redux-model/taro.svg?label=@redux-model/taro)](https://www.npmjs.com/package/@redux-model/taro)
[![](https://img.shields.io/npm/dt/@redux-model/vue.svg?label=@redux-model/vue)](https://www.npmjs.com/package/@redux-model/vue)


# Features

* Less code and higher efficiency
* Modify reducer by MVVM
* Absolutely 100% static type checking with typescript
* Trace loading status for each request action
* Support react hooks

# Installation

#### Web
```bash
npm install @redux-model/web react-redux
```

#### React-Native

```bash
npm install @redux-model/react-native react-redux
```

#### Vue

```bash
npm install @redux-model/vue
```


#### Taro

```bash
npm install @redux-model/taro @tarojs/redux
```

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

    getUser = $api.action((id: number) => {
        return this
            .get<Response>(`/api/user/${id}`)
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

# With React Hooks
```typescript jsx
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

# With Redux connect
```typescript jsx
import React, { Component } from 'react';
import { connect } from 'react-redux';

type Props = ReturnType<typeof mapStateToProps>;

class App extends Component<Props> {
    increase() {
        testModel.increase();
        testModel.getUser(3);
    }

    render() {
        const { loading, counter } = this.props;
        return (
            <button onClick={this.increase}>
                {loading ? 'Waiting...' : `You clicked ${counter} times`}
            </button>
        );
    }
}

const mapStateToProps = () => {
    return {
        counter: testModel.data.counter,
        loading: testModel.getUser.loading,
    };
};

export default connect(mapStateToProps)(App);
```

# With Vue
```vue
<template>
  <button @click="increase">
    {{loading ? 'Waiting...' : `You clicked ${counter} times`}}
  </button>
</template>

<script>
export default {
  name: 'HelloWorld',
  methods: {
    increase() {
      testModel.increase();
      testModel.getUser(3);
    },
  },
  computed: {
    counter() {
      return testModel.data.counter;
    },
    loading() {
        return testModel.getUser.loading;
    },
  },
};
</script>
```

# Demos

* [React Web](https://github.com/redux-model/redux-model-web-demo)

# Documents

Here is the [document](https://redux-model.github.io/redux-model)

---------------------

Feel free to use it and welcome to send PR to me.
