如果你还在用函数式写法去写redux的action、types、reducer，那么你有必要往下看。这个框架对redux进行了一次彻头彻尾的面向对象封装，让你用最少的代码做最多的事情。

# 对比
|     | 原生redux | redux-model-ts |
| ----| ---- | ---- |
| 写法 | 函数式 | 面向对象 |
| 定义types | 要 | 内置 |
| action与reducer文件分离 | 要 | 不要 |
| 对ts的支持 | 一般 | 完美 |
| 异步请求 | thunk 或 saga | 内置 |
| 异步loading状态 | 写reducer处理 | 内置 |
| 代码量 | 多 | 少 |

# 安装
```bash
# 使用npm
npm install redux-model-ts

# 或者使用yarn
yarn add redux-model-ts

```
# 依赖


| 插件包 | 版本|
| ----- | ----- |
| redux | * |
| react | * |
| react-redux | * |

-------

**如果你想使用react的hooks特性，请保持react的版本在`16.8.3+`以及react-redux的版本在`7.1.0+`**

# 支持

该项目同时支持 `javascript` 和 `typescript`，但我推荐你使用`typescript`以得到更好的体验。下面我会用ts的案例去教你怎么使用

-------------------

**本模型库在使用ts的情况下，你将得到100%无死角的静态类型提示。**

# 运行案例（Demo）

克隆本项目并执行`yarn start`，然后打开浏览器输入`http://localhost:8080`查看效果

# 使用方式

## 创建模型

```typescript
import { Model } from 'redux-model-ts';

interface Data {
  amount: number;
}

class Counter extends Model<Data> {
  // 普通的action处理
  change = this.actionNormal({
    action: (operator: '+' | '-') => {
      return this.emit({
        operator,
      });
    },
    onSuccess: (state, action) => {
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
    },
  });
  
  // 你可以建立多个action，并在各自配置下完成reducer的修改操作
  reset = this.actionNormal({
    action: () => {
      return this.emit();
    },
    onSuccess: () => {
      return { amount: 0 };
    },
  });

  protected initReducer(): Data {
    return {
      amount: 0,
    };
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
import { counter } from './Counter.ts';

const reducers = {
  ...counter.register(),
};

const rootReducers = combineReducers(reducers);
const store = createStore(rootReducers);

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

```

## 创建异步请求模型
每个项目都有请求api的时候，每次请求都可能有3个状态，准备、成功和失败。这个插件利用`中间件`屏蔽了请求细节，所以在使用之前，你需要创建一个中间件

#### 创建中间件
```typescript
import { createRequestMiddleware, Model } from 'redux-model-ts';

export const apiMiddleware = createRequestMiddleware({
  // 模型和中间件的对应关系
  id: Model.middlewareName,
  // 请求的通用地址前缀
  baseUrl: 'http://api.xxx.com',
  // 请求头信息
  getHeaders: ({ getState }) => {
    // header一般要带token等信息做权限校验，如果token存在reducer中，那么可以直接获取：
    // const token = tokenModel.connectData(getState(), (item) => item.access_token);
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
import { rootReducers } from './reducers';

const store = createStore(
  rootReducers,
  {},
  compose(applyMiddleware(apiMiddleware)),
);
```

#### 创建异步Action
```typescript
import { Model } from 'redux-model-ts';

interface Response {
  name: string;
  age: number;
}

type Data = Partial<Response>;

class Profile extends Model<Data> {
  manage = this.actionRequest({
    action: () => {
      return this.get('/api/profile');
    },
    onSuccess: (state, action) => {
      return {
        ...state,
        ...action.response,
      };
    },
    // meta是指异步请求的loading，http-status，error-message 之类的数据存储
    // 比较常用的就是loading状态
    // 如果你不需要这些信息，那么就设置为false，或者不设置
    meta: true,
  });

  protected initReducer(): Data {
    return {};
  }
}

export const profile = new Profile();
```
接着，我们需要把reducer挂载到redux中
```typescript
const reducers = {
  ...profile.register(),
};

```
#### 在React Class中使用
```typescript jsx
import React, { PureComponent } from' react';
import { connect } from 'react-redux';
import { profile } from './Profile';

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class App extends PureComponent<Props> {
  componentDidMount() {
    this.props.getProfile().promise.then(({ response }) => {
      console.log('hello: ' + response.name);
    });
  }
  
  render() {
    const { loading, data } = this.props;
    
    if (loading) {
      return <span>Loading...</span>;
    }
    
    return <div>Hello {data ? data.name : '--'}.</div>;
  }
}

const mapStateToProps = (state) => {
  return {
    data: profile.connectData(state),
    loading: profile.manage.connectLoading(state),
  };
};

const mapDispatchToProps = {
  getProfile: profile.manage.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```
#### 在React Hooks中使用
```typescript jsx
import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import profile from './Profile.ts';

const App: FunctionComponent = () => {
  const data = profile.useData();
  const loading = profile.manage.useLoading();
  const dispatch = useDispatch();
  
  // 和componentDidMount一个效果
  useEffect(() => {
    dispatch(profile.manage.action());
  }, []);
  
  if (loading) {
    return <span>Loading...</span>;
  }
  
  return <div>Hello {data ? data.name : '--'}.</div>;
};
```
这种写法真是太令人兴奋了。你可以轻而易举地就拿到数据，而不需要使用connect()的方法把数据注入到props中。同时你的代码也会变得更少更简洁更易于维护。

# 模型交叉
任何带有action的模型都可以产生副作用，同时任何模型都可以接收副作用

```typescript
import { Model } from 'redux-model-ts';
import { changeCounter } from 'ChangeCounter.ts';

interface Data {
  amount: number;
}

// 你可以从ChangeCounter.ts中导入payload
interface WorldBoomPayload {
  over: boolean;
}

class WorldBoom extends Model {
  start = this.actionNormal({
    action: () => {
      this.emit<WorldBoomPayload>({
        over: true,
      });
    },
  });
}

export const worldBoom = new WorldBoom();

// ===============================================
// ===============================================

interface Data {
  amount: number;
}

class Counter extends Model<Data> {
  initReducer(): Data {
    return {
      amount: 0,
    };
  }
  
  protected getEffects(): RM.Effects<Data> {
    return [
      {
        when: worldBoom.start.getSuccessType(),
        effect: (state, action: RM.NormalAction<WorldBoomPayload>) => {
          if (action.payload.over === true) {
            return {
              amount: 0,
            };
          }
          
          return state;
        },
      }
    ];
  }
}
```


--------------------

欢迎您使用并随时给我建议。
