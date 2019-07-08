[简体中文](https://github.com/fwh1990/redux-model-ts/blob/master/README-cn.md)

How many people are writing redux in functional way? And how much time you had wasted since you are repeating action,types,reducer.
Now, I want to tell you, I am in modern way to write redux. I'am using OOP instead of Functional Programming.

# Compare
|     | Original Redux | redux-model-ts |
| ----| ---- | ---- |
| Coding way | Functional | OOP |
| TS support | A little | Perfect |
| Define types | Yes | BuiltIn |
| Split action and reducer file | Yes | No |
| Sync action | Thunk OR Saga | BuiltIn |
| Sync loading status | Code in reducer | BuiltIn |
| Business code size | Large | Half |

-------------------

**You Will get 100% Type checking when you are using typescript.**

# Installation

```bash
# By npm
npm install redux-model-ts
npm install redux react-redux redux-thunk

# By yarn
yarn add redux-model-ts
yarn add redux react-redux redux-thunk
```

Remember: redux-thunk is not required until you want to use method `actionThunk()`

Remember: Keep react version at **16.8.3+** and react-redux at **7.1.0+** when you are using `React Hooks`

# Run Demo

Clone this repository, and run code `yarn start`. After that, open browser and visit site `http://localhost:8080`.

---------

# Usage

Here is a usage case and introduction for every one:

```typescript
interface Data {
  foo: string;
}

// Create a model. One model related to one reducer.
class Test extends Model<Data> {
  // Create a normal action
  firstAction = this.actionNormal({
    action: (name: string) => {
      // You can inject generic from here
      // return this.emit<Payload>();
      return this.emit({ name });
    },
    // onSuccess is optional.
    // It can change reducer data that is in this model.
    onSuccess: (state, action) => {
      return {
        ...state,
        foo: action.payload.name,
      };
    },
  });
  
  // Create sync action
  secondAction = this.actionRequest({
    // action is required.
    action: (userId: number) => {
      // More methods are defined: post put patch delete
      // You can inject generic from here
      // return this.get<Response, Payload>();
     return this.get({
       uri: '/profile',
       query: { userId },
     });
    },
    // onSuccess is optional
    onSuccess: (state, action) => {
      return action.response;
    },
    // Meta will store httpStatus, errorMessage and loading.
    // It's optional, you can set false or ignore it if you don't need these information.
    meta: true,
  });
  
  // Dependence on package redux-thunk.
  thirdAction = this.actionThunk((name: string) => {
    return (dispatch, getState) => {
      if (name === 'bar') {
        return this.firstAction.action(name);
      }
      
      return this.secondAction.action(1);
    };
  });
  
  // Initialize reducer data.
  // You can return null and remove generic if you don't have reducer data in this model.
  protected initReducer(): Data {
    return {
      foo: 'bar',
    };
  }
  
  // Receive effect from other model, and change data for this model.
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
  // We should register reducer data from each model.
  ...test.register(),
});
```

## Middleware
We should configure what can do and what can not do when we are fetching api. So, middleware is required before we can use method `Model.actionRequest`.

```typescript
import { createRequestMiddleware, Model } from 'redux-model-ts';

export const apiMiddleware = createRequestMiddleware({
  // Unique name so we can related the sync action.
  id: Model.middlewareName,
  // Your base address.
  baseUrl: 'http://api.xxx.com',
  // Headers are always necessary.
  getHeaders: ({ getState }) => {
    // You are free to get data from redux
    // Such as access_token like:
    // const token = tokenModel.connectData(getState()).access_token;
    return {
      Authorization: `Bearer token`,
      Accept: 'application/json',
     'Content-Type': 'application/json',
   };
  },
  // Collect your meta.
  onFail: (error: RM.HttpError, transform) => {
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

And then, inject middleware to redux.store.

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

Feel free to use this package, and you are welcome to give me issue or PR.
