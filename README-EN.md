<h1 align="center">
  <a href="https://redux-model.github.io/redux-model">
    Redux Model
  </a>
</h1>

[中文文档](./README.md)

Redux Model is created to enhance original redux framework, which has complex flow and lots of boilerplate.

[![License](https://img.shields.io/github/license/redux-model/redux-model)](https://github.com/redux-model/redux-model/blob/master/LICENSE)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/redux-model/redux-model/CI/master)](https://github.com/redux-model/redux-model/actions)
[![Codecov](https://img.shields.io/codecov/c/github/redux-model/redux-model)](https://codecov.io/gh/redux-model/redux-model)


# Features

* Modular coding
* Modify reducer by MVVM
* **👍Absolutely 100% static type checking with typescript**
* Provide http service with loading and throttle
* Support react/vue hooks
* Support persist
* 支持[Graphql](https://github.com/redux-model/graphql)请求

# Installation

### React or React-Native
```bash
npm install @redux-model/react redux react-redux
```

### Taro
```bash
# taro 3+
npm install @redux-model/taro redux react-redux

# taro 2+
npm install @redux-model/taro@6.10.0 @tarojs/redux

# taro 1+
npm install @redux-model/taro@6.9.5 @tarojs/redux
```

### Vue
```bash
# vue 3+
npm install @redux-model/vue redux

# vue 2+
npm install @redux-model/vue@6.9.2 redux
```

### Others
* For `taro < v3`, install @redux-model/taro@6.9.4 instead
* For `vue < v3`, install @redux-model/vue@6.9.2 instead

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
  plus = this.action((state, step: number = 1) => {
    state.counter += step;
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

# Run Action
```typescript
testModel.plus();
testModel.plus(2);

testModel.getUser(3);
testModel.getUser(5).then(({ response }) => {});
```

# Get data in Hooks
```typescript jsx
const data = testModel.useData(); // { counter: number, users: object }

const counter = testModel.useData((data) => data.counter); // number
const users = testModel.useData((data) => data.users); // object

const loading = testModel.getUser.useLoading(); // boolean
```

# Get data in connect
```typescript jsx
type ReactProps = ReturnType<typeof mapStateToProps>;

const mapStateToProps = () => {
  return {
    counter: testModel.data.counter, // number
    users: testModel.data.users, // object
    loading: testModel.getUser.loading, // boolean
  };
};

export default connect(mapStateToProps)(App);
```

# Online Runnable Demos
* [Counter](https://codesandbox.io/s/redux-model-react-counter-zdgjh)
* [Persist](https://codesandbox.io/s/redux-model-react-persist-uwhy8)
* [Todo List](https://codesandbox.io/s/redux-model-react-todo-list-zn4nv)
* [Request](https://codesandbox.io/s/redux-model-react-request-1ocyn)
* [Request Throttle](https://codesandbox.io/s/redux-model-react-request-throttle-77mfy)
* [Listener](https://codesandbox.io/s/redux-model-react-listener-p7khk)
* [Compose](https://codesandbox.io/s/redux-model-react-compose-42wrc)
* [Action in Action](https://codesandbox.io/s/redux-model-react-action-in-action-oewkv)

# Documents

Here is the [document](https://redux-model.github.io/redux-model)

---------------------

Feel free to use it and welcome to send PR to me.
