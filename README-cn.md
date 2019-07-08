[English Docs](https://github.com/fwh1990/redux-model-ts/blob/master/README.md)

如果你还在用函数式写法去写redux的action、types、reducer，那么你有必要往下看。这个框架对redux进行了一次彻头彻尾的面向对象封装，让你用最少的代码做最多的事情。

# 对比
|     | 原生redux | redux-model-ts |
| ----| ---- | ---- |
| 写法 | 函数式 | 面向对象 |
| 对ts的支持 | 一般 | 完美 |
| 定义types | 要 | 内置 |
| action与reducer文件分离 | 要 | 不要 |
| 异步请求 | thunk 或 saga | 内置 |
| 异步loading状态 | 写reducer处理 | 内置 |
| 代码量 | 多 | 少 |

-------------------

**本模型库在使用ts的情况下，你将得到100%无死角的静态类型提示。**

# 安装

```bash
# 使用npm
npm install redux-model-ts
npm install redux react-redux redux-thunk

# 使用yarn
yarn add redux-model-ts
yarn add redux react-redux redux-thunk
```

**redux-thunk并不是必须的，除非你想使用thunk的特性**

**如果你想使用react的hooks特性，请保持react的版本在`16.8.3+`以及react-redux的版本在`7.1.0+`**

# 运行案例（Demo）

克隆本项目并执行`yarn start`，然后打开浏览器输入`http://localhost:8080`查看效果

---------
这里有一个完整的模型使用案例

```typescript
interface Data {
  foo: string;
}

// 创建一个模型，一个模型只能为一个reducer数据服务
class Test extends Model<Data> {
  // 创建普通句柄
  firstAction = this.actionNormal({
    // action 是必须传入的
    action: (name: string) => {
      // 泛型可以从这里注入：
      // return this.emit<Payload>();
      return this.emit({  name });
    },
    // onSuccess 是可选的
    // 它的作用是改变Test模型下的reducer数据
    onSuccess: (state, action) => {
      return {
        ...state,
        foo: action.payload.name,
      };
    },
  });
  
  // 创建异步请求句柄
  secondAction = this.actionRequest({
    // action 是必须传入的
    action: (userId: number) => {
      // 还有 post put patch delete 方法可以使用
      // 泛型可以从这里注入：
      // return this.get<Response, Payload>();
      return this.get({
        uri: '/profile',
        query: { userId },
      });
    },
    // onSuccess 是可选的
    onSuccess: (state, action) => {
      return action.response;
    },
    // meta是指异步请求的loading，http-status，error-message 之类的数据存储
    // 比较常用的就是loading状态
    // 如果你不需要这些信息，那么就设置为false，或者不设置
    meta: true,
  });
  
  // 依赖redux-thunk包，创建thunk类型的句柄
  thirdAction = this.actionThunk((name: string) => {
    return (dispatch, getState) => {
      if (name === 'bar') {
        return this.firstAction.action(name);
      }
      
      return this.secondAction.action(1);
    };
  });
  
  // 初始化reducer的数据
  // 如果你不需要reducer，那么可以返回null值，并去掉泛型Data的约束
  protected initReducer(): Data {
    return {
      foo: 'bar',
    };
  }
  
  // 接收来自其它模型的action操作，并改变reducer的数据
  protected subscribers(): RM.Subscriber<Data> {
    return [
      otherModel.customAction.onSuccess((state, action) => {
        return {
          ...state,
          foo: action.payload.foo,
        };
      }),
      ...
    ];
  }
}

export const test = new Test();


// ---------------------------------------------------
// ---------------------------------------------------


export const rootReducers = combineReducers({
  // 因为模型中包含有reducer数据，所以我们需要把模型注册到redux中
  ...test.register(),
});
```

## 中间件
每个项目都有请求api的时候，每次请求都可能有3个状态，准备、成功和失败。这个插件利用`中间件`屏蔽了请求细节，所以在使用`Model.actionRequest`之前，你需要创建一个中间件

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
    // const token = tokenModel.connectData(getState()).access_token;
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

--------------------

欢迎您使用并随时给我建议。
