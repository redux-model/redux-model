<h1 align="center">
  <a href="https://redux-model.github.io/redux-model">
    Redux Model
  </a>
</h1>

[English](./README-EN.md)

Redux-Model是为了弥补原生Redux繁琐的开发流程，开发者重复劳动效率低下，模板文件导致代码量臃肿，以及因action和reducer文件分散造成代码追踪困难的问题而设计的。

众多知名的状态管理框架，基本都是为JS用户设计的。离散的代码结构、严格的设计模式、不合时宜的细节封装，都意味着想完美融入TypeScript，就必须经常手动注入类型。幸运的是，Redux-Model专门为Typescript设计，强健的自动推导能力，允许类型一次注入，到处使用。

[![License](https://img.shields.io/github/license/redux-model/redux-model)](https://github.com/redux-model/redux-model/blob/master/LICENSE)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/redux-model/redux-model/CI/master)](https://github.com/redux-model/redux-model/actions)
[![Codecov](https://img.shields.io/codecov/c/github/redux-model/redux-model)](https://codecov.io/gh/redux-model/redux-model)


# 特性

* 深度封装，超高开发效率
* 使用mvvm快速处理reducer
* **👍真正意义上的Typescript框架，写起来和JS一样流畅**
* 内置http服务，请求action自带loading追踪、数据节流
* 支持React/Vue Hooks
* 支持数据持久化


# 安装

### React 或 React-Native
```bash
npm install @redux-model/react redux react-redux
```

### Vue v3
```bash
npm install @redux-model/vue redux
```

### Taro v3
```bash
npm install @redux-model/taro redux react-redux
```

### 其它
* 对于Taro 3.0之前的版本，请安装 **@redux-model/taro@6.9.2**
* 对于Vue 3.0之前的版本，请安装 **@redux-model/vue@6.9.2**

# 定义模型
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
      .get<Response>(`/api/users/${id}`)
      .onSuccess((state, action) => {
        state.users[id] = action.response;
      });
  });

  protected initialState(): Data {
    return {
      counter: 0,
      users: {},
    };
  }
}

export const testModel = new TestModel();
```

# 在React Hooks中使用
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

# 在Vue Hooks中使用
```vue
<template>
  <button @click="increase">
    {{loading.value ? 'Waiting...' : `You clicked ${counter.value} times`}}
  </button>
</template>

<script>
export default {
  setup() {
    const increase = () => {
      testModel.increase();
      testModel.getUser(3);
    };

    const counter = testModel.useData((data) => data.counter);
    const loading = testModel.getUser.useLoading();

    return {
      increase,
      counter,
      loading,
    };
  }
};
</script>
```

# 在Redux Connect中使用
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

# 简单的例子

* [React Web](https://github.com/redux-model/redux-model-web-demo)

# 文档

请点击[这里查看文档](https://redux-model.github.io/redux-model)

---------------------

欢迎使用并随时给我建议
