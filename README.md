使用类模型代替redux的传统函数式写法。可节省一半的代码和时间，后期维护超级方便。我认为这是一款准时下班的神器。

![](https://raw.githubusercontent.com/fwh1990/redux-model-ts/master/compare.jpg)

# 安装
```bash
# 使用npm
npm install redux-model-ts

# 或者使用yarn
yarn add redux-model-ts

```
# 依赖


| 插件包 | 版本 | 条件 |
| ----- | ----- | ---- |
| redux | * | - |
| react | * | - |
| react | 16.8.3+ | 使用react hooks |
| react-redux | * | - |
| react-redux | 7.1.0+ | 使用react hooks |

# 支持

该项目同时支持 `javascript` 和 `typescript`，但我推荐你使用`typescript`以得到更好的体验。下面我会用ts的案例去教你怎么使用

# 运行案例

克隆本项目并执行`yarn start`，然后打开浏览器输入`http://localhost:8080`查看效果

# 使用方式

## 普通模型

```typescript
import { NormalModel } from 'redux-model-ts';

interface Data {
  amount: number;
}

interface Payload {
  operator: '+' | '-';
}

class Counter extends NormalModel<Data, Payload> {

  action(operator: '+' | '-'): RM.NormalAction<Payload> {
    return this.createAction({
      operator,
    });
  }
  
  protected getInitValue(): Data {
    return {
      amount: 0,
    };
  }
  
  protected onSuccess(state: Data, action: RM.NormalAction<Payload>): Data {
    let amount = state.amount;
    
    switch (action.payload.operator) {
      case '+':
        amount += 1;
        break;
      case '-':
        amount -= 1;
        break;
      // no default
    } 
    
    return { amount };
  }
}

export const counter = new Counter();

```
现在，你已经创建了一个action和一个reducer。

我们首先要把reducer挂载到redux的store中
```typescript jsx
import React from 'react';
import ReactDom from 'react-dom';
import { combineReducers, Reducer, createStore, Provider } from 'redux';
import { EnhanceState } from 'redux-model-ts';
import { counter } from './Counter.ts';

const reducers = {
  counterData: counter.createData(),
};

// 定义全局的类型`RootState`，这样我们可以在`react-redux`的connect()或者useSelector()方法中使用
declare global {
  type RootState = Readonly<ReturnType<typeof rootReducers>>;
}

const rootReducers: Reducer<EnhanceState<typeof reducers>> = combineReducers(reducers);

const store = createStore(rootReducers);

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

```

#### 在React Class中使用
```typescript jsx
import React, { PureComponent } from' react';
import { connect } from 'react-redux';

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class App extends PureComponent<Props> {
  render() {
    return (
      <div onClick={() => this.props.doAction('+')}>
        There are {this.props.amount} people.
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    amount: state.counterData.amount;
  };
};

const mapDispatchToProps = {
  doAction: counter.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```
每当我们点击一次文字按钮，变量amount就会自动加1。

#### 在React Hooks中使用
现在，我们尝试使用react hooks来处理数据。

首先，更改模型在reducer的挂载方式。也许你会发现，这样做更加方便
```typescript
const reducers = {
  // counterData: counter.createData(),
  ...counter.hookRegister(),
};
```
接着，创建一个 hooks 组件
```typescript jsx
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import counter from 'Counter.ts';

const App: FunctionComponent = () => {
  const amount = counter.useData((item) => item.amount);
  const dispatch = useDispatch();
  
  return (
    <div onClick={() => dispatch(counter.action('+'))}>
      There are {amount} people.
    </div>
  );
};
```
这种写法真是太令人兴奋了。你可以轻而易举地就拿到数据，而不需要使用connect()的方法把数据注入到props中。同时你的代码也会变得更少更简洁更易于维护。

## 创建异步请求模型
每个项目都有请求api的时候，每次请求都可能有3个状态，准备、成功和失败。这个插件利用`中间件`屏蔽了请求细节，所以在使用之前，你需要创建一个中间件

#### 创建中间件
```typescript
import { createRequestMiddleware, RequestModel } from 'redux-model-ts';

export const apiMiddleware = createRequestMiddleware<RootState>({
  // 模型和中间件的对应关系
  id: RequestModel.middlewareName,
  // 请求的通用地址前缀
  baseUrl: 'http://api.xxx.com',
  // 请求头信息
  getHeaders: (api) => {
    // header一般要带token等信息做权限校验，如果token存在reducer中，那么可以直接获取：
    // const token = api.getState().xxx.token;
    return {
      Authorization: `Bearer token`,
      Accept: 'application/json',
     'Content-Type': 'application/json',
   };
  },
  // 定位业务场景下的错误码等信息，会自动存入meta中
  onFail: (error: RM.HttpError, transform) => {
    const { data } = error.response;
  
    transform.businessCode = data ? data.code : undefined;
    transform.errorMessage = (data && data.message) || error.message || 'Fail to fetch';
  },
  // 可以做一些弹窗操作。
  // 只有当模型提供了successText属性才会触发。
  onShowSuccess: (successText) => {
    console.log(successText);
  },
  // 可以做一些弹窗操作。
  // 只有当请求异常或者失败时才会触发。
  // 模型中提供了 hideError 属性时，不再触发。
  onShowError: (errorMessage) => {
    console.error(errorMessage);
  },
});
```
接着注入到store中
```typescript
import { createStore, compose, applyMiddleware } from 'redux';
import { apiMiddleware } from './apiMiddleware.ts';

const store = createStore(
  rootReducers,
  {},
  compose(applyMiddleware(apiMiddleware)),
);
```

现在，你可以开始使用异步模型了

#### 创建异步模型
```typescript
import { RequestModel } from 'redux-model-ts';

interface Response {
  name: string;
  age: number;
}

type Data = Partial<Response>;

class Profile extends RequestModel<Data, Response> {
  
  action(): RM.MiddlewareEffect<Response> {
    return this.get('/api/profile');
  }
  
  protected getInitValue(): Data {
    return {};
  }
  
  protected onSuccess(state: Data, action: RM.ResponseAction<Response>): Data {
    return {
      ...state,
      ...action.response,
    };
  }
}

export const profile = new Profile();
```
接着，我们需要把reducer挂载到redux中
```typescript
// 如果你想使用 connect() 方式获取数据
const reducers = {
  profileData: profile.createData(),
  // meta是指异步请求的loading，http-status，error-message 之类的数据存储
  // 比较常用的就是loading状态
  // 如果你不需要这些信息，那么就不挂载
  profileMeta: profile.createMeta(),
};

// 如果你想使用 hooks 方式获取数据
const reducers = {
  // 第一个参数代表是否执行：createData()
  // 第二个参数代表是否执行：createMeta()
  ...profile.hookRegister(true, true),
};
```
#### 在React Class中使用
```typescript jsx
import React, { PureComponent } from' react';
import { connect } from 'react-redux';

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class App extends PureComponent<Props> {
  componentDidMount() {
    this.props.getProfile();
  }
  
  render() {
    const { loading, data } = this.props;
    
    if (loading) {
      return <span>Loading...</span>;
    }
    
    return <div>Hello {data ? data.name : '--'}.</div>;
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    data: state.profileData,
    loading: state.profileMeta.loading,
  };
};

const mapDispatchToProps = {
  getProfile: profile.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```
#### 在React Hooks中使用
```typescript jsx
import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import profile from 'Profile.ts';

const App: FunctionComponent = () => {
  const data = profile.useData();
  const loading = profile.useLoading();
  const dispatch = useDispatch();
  
  // 和componentDidMount一个效果
  useEffect(() => {
    dispatch(profile.action());
  }, []);
  
  if (loading) {
    return <span>Loading...</span>;
  }
  
  return <div>Hello {data ? data.name : '--'}.</div>;
};
```

# 创建纯action模型

因为模型基于ts的语法，继承`NormalModal`和`RequestModel`的模型都需要实现**action()** | **getInitvalue()** | **onSuccess()** 方法。而纯action模型不需要reducer相关的信息，我已我们准备了另外两个类`NormalActionModel`和`RequestActionModel`。他们本质上是继承`NormalModal`和`RequestModel`，仅仅是屏蔽了reducer的相关信息。

## 普通action
```typescript jsx
import { NormalActionModel } from 'redux-model-ts';

interface Payload {
  amount: number;
}

class ChangeCounter extends NormalActionModel<Payload> {
  action(amount: number) {
    return this.createAction({
      amount,
    });
  }
}

export const changeCounter = new ChangeCounter();
```

## 异步请求action

```typescript jsx
import { RequestActionModel } from 'redux-model-ts';

class UpdateProfile extends RequestActionModel {
  action(userId: number) {
    return this.put(`/api/profile/${userId}`, {
      successText: '资料更新成功',
    });
  }
}

export const updateProfile = new UpdateProfile();
```
# 副作用
任何带有action的模型都可以产生副作用，同时任何模型都可以接收副作用

```typescript
import { NormalModel } from 'redux-model-ts';
import { changeCounter } from 'ChangeCounter.ts';

interface Data {
  amount: number;
}

// 你可以从ChangeCounter.ts中导入payload
interface ChangeCounterPayload {
  amount: number;
}

class Counter extends NormalModel<Data> {
  
  ...
  
  ...
  
  protected getEffects(): RM.ReducerEffects<Data> {
    return [
      {
        when: changeCounter.getSuccessType(),
        effect: (state, action: RM.NormalAction<ChangeCounterPayload>) => {
          return {
            ...state,
            amount: action.payload.amount,
          };
        },
      }
    ];
  }
}
```


# 创建纯reducer模型
```typescript
import { ReducerModel } from 'redux-model-ts';

interface Data {
  [key: string]: any;
}

class Collector extends ReducerModel<Data> {
  protected getInitValue() {
    return {};
  }
  
  // 这种类只能接收副作用
  // 因为自己不产生副作用，没有onSuccess方法
  protected getEffects(): RM.ReducerEffects<Data> {
    return [];
  }
}
```

# 数据混合
在现实世界中，一个项目不可能只有hooks组件，有可能有stateless组件和class组件。而我们有两种数据类型挂载到redux，第一种是：`{ xxxData: xxx.createData() }`，第二种是：`{ ...yyy.hookRegister() }`。那么如何混用呢

## 在class中使用
```typescript jsx
class App extends PureComponent {
  render() {
    return null;
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    // 如果是key-value形式，那么正常获取数据
    x: state.xxxData,
    // 如果是hookRegister形式，那么使用stateToData()方法获取数据
    y: yyy.stateToData(state),
  };
};

export default connect(mapStateToProps)(App);
```

## 在hooks中使用
```typescript jsx
import { useSelector } from 'react-redux';

const App: FunctionComponent = () => {
  // 如果是key-value形式，那么借助useSelector()获取数据
  // 当然了，你也可以直接通过connect()高阶组件注入到props
  const x = useSelector((state: RootState) => state.xxxData);
  // 如果是hookRegister形式，那么直接通过模型获取数据
  const y = yyy.useData();
  
  return null;
};

export default App;
```
