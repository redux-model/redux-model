### English Document | [简体中文文档](https://github.com/fwh1990/redux-model-ts/blob/master/README.md)

How many people are writing redux in functional way? And how much time you had wasted since you are repeating action,types,reducer.
Now, I want to tell you, I am in modern way to write redux. I'am using OOP instead of Functional Programming.

# 特性

* Class Type
* Support mvvm
* Reduce 30% redux code
* Combine action with reducer in one file
* Action.type is built in
* Perfectly support typescript，with 100% Type Checking
* Loading status is built in when request api

# Installation

#### H5 / [React-Native](https://github.com/facebook/react-native)
```bash
# By npm or yarn
npm install @redux-model/web
npm install redux redux-thunk react-redux
```

Remember: redux-thunk is not required until you want to use method `actionThunk()`

Remember: Keep react version at **16.8.3+** and react-redux at **7.1.0+** when you are using `React Hooks`

#### [Taro](https://github.com/NervJS/taro)
```bash
# By npm or yarn
npm install @redux-model/taro
npm install redux redux-thunk @tarojs/redux @tarojs/redux-h5
```

# Run Demo

Forward to repository: [redux-model-ts-demo](https://github.com/fwh1990/redux-model-ts-demo)

# Snippets
Search plugin `bluewaitor.tsreact` in vscode extension.

You need to write almost zero line redux code when you are using snippets.

# Usage

## Define Model
You should define a model before you want to use reducer. As rule, one model can only includes one or zero reducer. Firstly, let's define an interface and initialize the reducer.
```typescript
// test.ts
import { Model } from '@redux-model/*';

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

And how to strip reducer? You just need to return `null` from method `initReducer()` and remove generic `Data`.

## Register Reducer
As we know, the reducer data must be registered to store by `createStore()`, so the model instance has provided a method named `register()` to do that thing.
```typescript
// reducers.ts
import { combineReducers } from 'redux';

const reducers = {
  ...test.register(),
};

export const rootReducers = combineReducers(reducers);
```

## Define Action
We only have 3 kind of actions here, but remember that one model can includes unlimited actions. And I will show you how to use them.
>- Normal Action
>- Request Action
>- Thunk Action

## Define Normal Action
Normal Action is the mostly basic action. It can just send message to reducer.

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
      state.foo = 'new name: ' + action.payload.name;
    },
  });
}

export const test = new Test();
```
The method `onSuccess()` will change reducer data from this model. But remember that it's an **optional property**, that means you can remove it and this action will never change this model who's reducer data is here any more.

However, Action can also effect other model no matter onSuccess is defined or not. I'll show you later.

------------

Let's find out how to use action and reducer data in React Component. As usual, we can inject them by method `connect()`
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

const mapStateToProps = () => {
  return {
    name: test.connectData().foo,
  };
};

const mapDispatchToProps = () => {
  runAction: test.myFirstAction.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```
Once you click the button, `runAction` will be invoked,
 and `test.reducer` will be modified by the method `onSuccess()` defined in action right now.

----------
Since React version `>=16.8.3` and react-redux version `>=7.1.0`, you can use hooks to refactor code from above.
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

## Define Request Action
We are always need to fetch data from api, and there are lots of detail we should deal with. Such as we need to keep loading status before we fetch succeed. Such as we want to alert message when fetch event is success or failure. And so on.

Aha, Don't worry about that, I have resolved these already.

We want to make action as soon as easy to implement, so we just hide the detail things into `middleware`. First of all, you need to create a middleware.

```typescript
import { createRequestMiddleware, Model } from '@redux-model/*';

export const apiMiddleware = createRequestMiddleware({
  // Unique name so we can related the sync action.
  id: Model.middlewareName,
  // Your base address.
  baseUrl: 'http://api.xxx.com',
  // Headers are always necessary.
  getHeaders: ({ getState }) => {
    // You are free to get data from redux
    // Such as access_token like:
    // const token = tokenModel.connectData().access_token;
    return {
      Authorization: `Bearer token`,
      Accept: 'application/json',
     'Content-Type': 'application/json',
   };
  },
  // Collect your meta.
  onFail: (error: HttpError, transform) => {
    const { data } = error.response;

    transform.businessCode = data ? data.code : undefined;
    transform.errorMessage = (data && data.message) || error.message;
  },
  // The behavior when action.successText is set.
  onShowSuccess: (successText) => {
    console.log(successText);
  },
  // The behavior when api respond error http status.
  // You can set action.hideError=false to stop invoking this method.
  onShowError: (errorMessage) => {
    console.error(errorMessage);
  },
});
```
And then inject this middleware into store.

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
All right. You get everything ready and let's go on.

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
        successText: 'Your profile is updated',
      });
    },
    onSuccess: (state, action) => {
      state.name = action.payload.name;
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

We define two Request Action in this model. And there are more property we can use.

**uri**&nbsp;&nbsp;[string] `required`
<br>
The relative url.
<br><br>
**query**&nbsp;&nbsp;[object]
<br>
Query string that will merge into url.
<br><br>
**body**&nbsp;&nbsp;[object]
<br>
The stream data，It only works for `post put patch delete`.
<br><br>
**payload**&nbsp;&nbsp;[object]
<br>
Extra params for reducer.
<br><br>
**hideError**&nbsp;&nbsp;[boolean | (response) => boolean]
<br>
Decide show or hide error message when fetch fail. The default value is false.
<br><br>
**successText**&nbsp;&nbsp;[string]
<br>
Success message you want to show in screen when fetch succeed.

## Define Thunk Action
I suppose you understand what is [Redux Thunk](https://github.com/reduxjs/redux-thunk), and you have put `thunk middleware` into store. And then, let's go on.
```typescript
// test.ts
import { profileModel } from './ProfileModel.ts';

class Test extends Model {
  myFirstAction = this.actionNormal(...);

  /////////////////////////////////
  /// Usage: test.myThunk();   ///
  ////////////////////////////////
  myThunk = this.actionThunk((/* Action parameters here */) => {
    return (dispatch, getState) => {
      dispatch(this.myFirstAction.action());
      dispatch(profileModel.manage.action());
      ...
    };
  });
}

export const test = new Test();
```

## Model effects.
In some case, We expect the action can effect reducer from owner model but also other model. Yep, you can override protected method `effects()` and receive effect from other model.
```typescript
class BarModel extends Model {
  reset = this.action.actionNormal(...);
  request = this.action.actionRequest(...);
}

const barModel = new BarModel();

// --------

import { Effects, Model } from '@redux-model/*';

interface Data {
  foo: string;
}

class Test extends Model<Data> {
  protected effects(): Effects<Data> {
    return [
      barModel.reset.onSuccess((state, action) => {
        return {
          foo: 'Oops, reset',
        };
      }),
      barModel.request.onSuccess((state, action) => {
        return {
          foo: action.response.name,
        };
      }),
      barModel.request.onFail((state, action) => {
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
For Normal Action, it only use `model.action.onSuccess(fn)` to change data for other model.

For Request Action, it can use `onPrepare(fn)` `onSuccess(fn)` and `onFail(fn)` to subscriber action effect.

## Request Action Promise
We can use `promise` in React Component when Request Action is invoked. Now, enjoy 100% type checking for response data.

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

## Request Action Loading
Each Request Action has loading status itself. Feel free to use it whenever you want.

```typescript jsx
// By React Hooks
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { profileModel } from './ProfileModel.ts';

const App: FunctionComponent = (props) => {
  const dispatch = useDispatch();
  const name = profileModel.useData((item) => item.name);
  // It's boolean type.
  const loading = profileModel.manage.useLoading();

  return (
    <button onClick={() => dispatch(profileModel.manage.action(1))}>
      Click me: {name} {loading ? 'Waiting...' : ''}
    </button>
  );
};

export default App;
```

You can inject loading into props by `connect()` if you don't like hooks.

```typescript
const mapStateToProps = (state) => {
  loading: profileModel.manage.connectLoading(),
};

export default(mapStateToProps)(App);
```

------------------
Sometimes, you may have to show multiple loading status at the same time. In this case, we provide a property `meta` for Request Action.

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
Remember: Make sure the value of meta can be found in key of payload.

Let me show usage in react component.
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


## Generics
Request Action is enable to inject generic `Response` and `Payload`. Remember that you only need to inject once, and the whole project will enjoin type checking where code is related with this action.
```typescript
import { Model } from '@redux-model/*';

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
      // Inject here
      return this.get<Response, Payload>({
        uri: `/profile/api/${id}`,
        payload: {
          id: id,
        },
      });
    },
    onSuccess: (state, action) => {
      state[action.payload.id] = action.response;
    },
  });
}
```

--------------------
Cool package.

Feel free to use this package, and you are welcome to create issue and send me PR.
