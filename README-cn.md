[English Docs](https://github.com/fwh1990/redux-model-ts/blob/master/README.md)

Redux模型是对原生redux的一次面向对象封装，OOP方案可以实现隐藏重复代码、提高工作效率以及减少开发时间的效果。你只需要花半个小时，就能完全了解模型的用法，并从中受益。

# 对比
|     | 原生redux | redux-model-ts |
| ----| ---- | ---- |
| 写法 | 函数式 | 面向对象 |
| action与reducer文件分离 | 要 | 不要 |
| 对ts的支持 | 一般 | 完美 |
| 定义types | 要 | 内置 |
| 异步请求 | thunk 或 saga | 内置 |
| 异步loading状态 | 写reducer处理 | 内置 |
| 代码量 | 多 | 少一半 |

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

请查看项目：[redux-model-ts-demo](https://github.com/fwh1990/redux-model-ts-demo)

# 代码片段
请在vscode的扩展中搜索插件 `bluewaitor.tsreact`

![](https://github.com/fwh1990/misc/blob/master/redux-model-ts.gif?raw=true)

# 使用

## 定义Model
想要定义reducer，就必须先定义一个模型类，因为一个模型可以包含一个或不带reducer。我们需要为reducer定义一个接口，并注入到模型中，这样我们就可以在整个项目中得到数据类型的提示。
```typescript
// test.ts
import { Model } from 'redux-model-ts';

interface Data {
  foo: string;
}

class Test extends Model<Data> {
  protected initReducer(): Data {
    return {
      foo: 'init',
    };
  }
}

export const test = new Test();
```

如果你不想使用reducer，那么你可以在`initReducer()`方法中返回`null`并移除注入的泛型Data

## 注册Reducer
我们都知道，reducer是要挂载到store中的，所以我们为实例化后的模型提供了一个`register()`方法。
```typescript
// reducers.ts
import { combineReducers } from 'redux';

const reducers = {
  ...test.register(),
};

export const rootReducers = combineReducers(reducers);
```

## 定义Action
在模型中，我们只需要3种类型的action，而且一个模型支持写入无限个action。
>- 普通action
>- 异步请求action
>- thunk action

## 定义普通action
普通的action是最基础的action，它的作用就是同步发送一次消息

```typescript
// test.ts
class Test extends Model<Data> {
  myFirstAction = this.actionNormal({
    action: (name: string) => {
      return this.emit({
        name,
      });
    },
    onSuccess: (state, action) => {
      return {
        foo: 'new name: ' + action.payload.name,
      };
    },
  });
}

export const test = new Test();
```
`onSuccess()`的作用是改变当前模型的reducer值，但它不是必须定义的，你可以删除它，意味着执行这个action不会影响这个模型的reducer。

待会我会告诉你如何用这个action去影响其他模型的reducer数据。

------------
先让我们看看普通action如何使用在React组件中。我们可以通过`connect()`方法注入action
```typescript jsx
// By Connect
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { test } from './Test';

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const App: FunctionComponent<Props> = (props) => {
  const { runAction, name } = props;

  return (
    <button onClick={() => runAction('New Name')}>
      Click me: {name}
    </button>
  );
};

const mapStateToProps = (state) => {
  return {
    name: test.connectData(state).foo,
  };
};

const mapDispatchToProps = () => {
  runAction: test.myFirstAction.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```
因为我们在action中定义了`onSuccess()`方法，所以一旦你点击了按钮，执行`runAction`会立马变更test模型中reducer数据

----------
如果你的React版本`>=16.8.3`，而且react-redux的版本`>=7.1.0`，那么你可以用hooks实现数据的注入，这样做可以让你的代码看起来更清晰
```typescript jsx
// By React Hooks
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { test } from './Test';

const App: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const name = test.useData((item) => item.foo);

  return (
    <button onClick={() => dispatch(test.myFirstAction.action('New Name'))}>
      Click me: {name}
    </button>
  );
};

export default App;
```

## 定义异步请求Action
我们总是需要请求后端接口以展示动态的内容，其中包含很多细节需要处理。在数据成功返回之前，我们可能需要确保界面上有loading加载条。在数据返回失败时，我们需要展示错误的弹窗信息。在数据更新成功的时候，我们需要展示成功的弹窗信息。

别紧张，这一切我都替你想好了。

为了确保action写起来足够简单，我们把诸多细节隐藏到`middleware`中，所以在开始使用异步请求action之前，我们需要先定义一个自己的中间件

```typescript
// apiMiddleware.ts
import { createRequestMiddleware, Model } from 'redux-model-ts';

export const apiMiddleware = createRequestMiddleware({
  // action和中间件的对应关系
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
  onFail: (error: RM.HttpError<{}>, transform) => {
    const { data } = error.response;

    transform.businessCode = data ? data.code : undefined;
    transform.errorMessage = (data && data.message) || error.message;
  },
  // 可以做一些弹窗操作。
  // 只有当模型提供了successText属性才会触发。
  onShowSuccess: (successText) => {
    alert(successText);
  },
  // 可以做一些弹窗操作。
  // 只有当请求异常或者失败时才会触发。
  // 模型中提供了 hideError 属性时，不再触发。
  onShowError: (errorMessage) => {
    alert(errorMessage);
  },
});
```
接着注入到store中
```typescript
// middlewares.ts
import { createStore, compose, applyMiddleware } from 'redux';
import { apiMiddleware } from './apiMiddleware.ts';
import { rootReducers } from './reducers.ts';

const store = createStore(
  rootReducers,
  {},
  compose(applyMiddleware(apiMiddleware)),
);
```
----------------
好了，准备就绪，开始写第一个异步action
```typescript
// profile.ts
interface Data {
  id: number;
  name: string;
}

class ProfileModel extends Model<Data> {
  manage = this.actionRequest({
    action: (id: number) => {
      return this.get({
        uri: '/test/api',
        query: {
          id: page,
        },
      });
    },
    onSuccess: (state, action) => {
      return action.response;
    },
  });

  edit = this.actionRequest({
    action: (id: number, name: string) => {
      return this.put({
        uri: `/test/api/${id}`,
        body: {
          name: name,
        },
        payload: {
          name: name,
        },
        successText: '信息更新成功',
      });
    },
    onSuccess: (state, action) => {
      return {
        ...state,
        name: action.payload.name,
      };
    },
  });

  protected initReducer(): Data {
    return {
      id: 0,
      name: '',
    };
  }
}

export const profileModel = new ProfileModel();
```

我们有更多请求的参数还没有列出来：

**uri**&nbsp;&nbsp;[string] `required`
<br>
请求的相对路径
<br><br>
**query**&nbsp;&nbsp;[object]
<br>
查询字符串
<br><br>
**body**&nbsp;&nbsp;[object]
<br>
请求实体，仅在`post put patch delete`中有效
<br><br>
**payload**&nbsp;&nbsp;[object]
<br>
额外数据，在改变reducer时使用
<br><br>
**hideError**&nbsp;&nbsp;[boolean | (response) => boolean]
<br>
请求出错时是否隐藏错误
<br><br>
**successText**&nbsp;&nbsp;[string]
<br>
请求成功时要展示的成功文字

## 定义Thunk Action
假设你已经知道什么是 [Redux Thunk](https://github.com/reduxjs/redux-thunk)，并且已经把`thunk middleware`放进了store中。那么我们来看看怎么定义
```typescript
// test.ts
import { profileModel } from './ProfileModel.ts';

class Test extends Model {
  myFirstAction = this.actionNormal(...);

  /////////////////////////////////
  /// 使用方法：test.myThunk();  ///
  ////////////////////////////////
  myThunk = this.actionThunk((/* 在这里定义action传入的参数 */) => {
    return (dispatch, getState) => {
      dispatch(this.myFirstAction.action());
      dispatch(profileModel.manage.action());
      ...
    };
  });
}

export const test = new Test();
```

## 模型交叉
有时候，执行某个模型下的action可能需要变更其它模型的reducer数据，这是很常见的操作方式，我们提供了一个保护方法`effects()`来做这个事情。
```typescript
class Other extends Model {
  reset = this.action.actionNormal(...);
  request = this.action.actionRequest(...);
}

const other = new Other();

// --------

interface Data {
  foo: string;
}

class Test extends Model<Data> {
  protected effects(): RM.Effects<Data> {
    return [
      other.reset.onSuccess((state, action) => {
        return {
          foo: 'Oops, reset',
        };
      }),
      other.request.onSuccess((state, action) => {
        return {
          foo: action.response.name,
        };
      }),
      other.request.onFail((state, action) => {
        return {
          foo: 'reset again',
        };
      }),
    ];
  }

  protected initReducer(): Data {
    return {
      foo: 'init',
    };
  }
}
```
对于普通的action，我们使用`model.action.onSuccess(fn)`来监听数据的变化。如果是异步请求action，我们总共有`onPrepare(fn)` `onSuccess(fn)` `onFail(fn)` 3个监听事件

## 异步请求Promise
对于异步请求的action，我们可以在React组件中使用promise方法，并获得请求的数据

```typescript jsx
// By React Hooks
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { profileModel } from './ProfileModel.ts';

const App: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const name = profileModel.useData((item) => item.name);
  const handleClick = () => {
    dispatch(profileModel.manage.action(1))
      .promise
      .then(({ response }) => {
        console.log('Hello, ' + response.name);
      })
      .catch(() => {
        console.warn('What is wrong?');
      })
      .finally(() => {
        console.log('Wow, cool bro.');
      });
  };

  return (
    <button onClick={this.handleClick}>
      Click me: {name}
    </button>
  );
};

export default App;
```

## 异步请求Loading
每个异步请求action都带有loading状态，只要你愿意，你可以随时使用它。

```typescript jsx
// By React Hooks
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { profileModel } from './ProfileModel.ts';

const App: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const name = profileModel.useData((item) => item.name);
  // 这是个布尔值
  const loading = profileModel.manage.useLoading();

  return (
    <button onClick={() => dispatch(profileModel.manage.action(1))}>
      Click me: {name} {loading ? 'Waiting...' : ''}
    </button>
  );
};

export default App;
```

如果你是用不用hooks，我们可以用`connect()`方法注入到props中：
```typescript
const mapStateToProps = (state) => {
  loading: profileModel.manage.connectLoading(state),
};

export default(mapStateToProps)(App);
```

------------------

有时候，请求粒度会细到某条数据上，也就是说，你想在一个屏幕上同时使用多个loading状态，这时候我们就需要精确知道loading的作用范围。这个其实很简单就实现了，我们利用meta属性：

```typescript
class Profile extends Model {
  someAction = this.actionRequest({
    action: (id: number, data: any) => {
      return this.post({
        uri: '/profile/api',
        body: data,
        payload: {
          idKey: id,
        },
      });
    },
    meta: 'idKey',
  });
}
```
必须确保meta的value在payload中能找到相应的key。否则将会产生bug。

接着我们看看如何在React中使用它
```typescript
// By React Hooks
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { profileModel } from './ProfileModel.ts';

const App: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const name = profileModel.useData((item) => item.name);
  const userId = 1;
  const secondUserId = 2;
  const loading = profileModel.manage.useLoading(userId);
  const secondLoading = profileModel.manage.useLoading(secondUserId);

  return (
    <button onClick={() => dispatch(profileModel.manage.action(userId))}>
      Click me: {name}
      {loading ? 'Waiting...' : ''}
      {secondLoading ? 'Second waiting...' : ''}
    </button>
  );
};

export default App;
```

## 泛型
在异步请求action中，你可以加入Response和Payload泛型。你只需要注入一次，就可以在项目的任何地方享受到关于这个action的静态检查
```typescript
import { Model } from 'redux-model-ts';

type Data = Array<{
  id: number;
  name: string;
}>;

interface Response {
  id: number;
  name: string;
}

interface Payload {
  id: number;
}

class Profile extends Model<Data> {
  getProfile = this.actionRequest({
    action: (id: number) => {
      // 这里注入
      return this.get<Response, Payload>({
        uri: `/profile/api/${id}`,
        payload: {
          id: id,
        },
      });
    },
    onSuccess: (state, action) => {
      return {
        ...state,
        [action.payload.id]: action.response,
      };
    },
  });
}
```

---------------------
欢迎您自由使用并随时创建issue和PR。
