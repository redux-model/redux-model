In traditional way, we are always repeating creating actions, types, and reducers. But today, it's unnecessary to repeat your code any more once you install this package. I'll show how to release your hands and save your life.

## Installation

```bash
yarn add redux-model-ts

# or

npm install redux-model-ts --save

```

# Usage
## Create action and reducer
```typescript
// File: Counter.ts
import { NormalModel } from 'redux-model-ts';

interface Data {
  countLength: number;
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
      countLength: 0,
    };
  }
  
  protected onSuccess(state: Data, action: RM.NormalAction<Payload>): Data {
    let countLength = state.countLength;
    
    switch (action.payload.operator) {
      case '+':
        countLength += 1;
        break;
      case '-':
        countLength -= 1;
        break;
      // no default
    } 
    
    return { countLength };
  }
}

export const counter = new Counter();
```
## Create pure action
```typescript
// File: SpecificCounter.ts
import { NormalActionModel } from 'redux-model-ts';

export interface SpecificCounterPayload {
  countLength: number;
}

class SpecificCounter extends NormalActionModel<SpecificCounterPayload> {
  
  action(value: number): RM.NormalAction<SpecificCounterPayload> {
    return this.createAction({
      countLength: value,
    });
  }
}

export const specificCounter = new SpecificCounter();

// -----------------------------
// File: Counter.ts
// -----------------------------

class Counter extends NormalModel<Data, Payload> {
  
  ...
  
  // Now, we can consume the effect from model `SpecificCounter`: 
  protected getEffects(): RM.ReducerEffects<Data> {
    return [
      {
        when: specificCounter.getSuccessType(),
        effect: (state: Data, action: RM.NormalAction<SpecificCounterPayload>) => {
          return {
            countLength: action.payload.countLength,
          };
        },
      },
      // Here we can append more effects from other models.
    ];
  }
}
```

## Create pure reducer
This type of model can only receive effect from other models.
```typescript
// File: PureCounter.ts
import { ReducerModel } from 'redux-model-ts';

interface Data {
  countLength: number;
}

class PureCounter extends ReducerModel<Data> {
  
  protected getInitValue(): Data {
    return {
      countLength: 0,
    };
  }
  
  protected getEffects(): RM.ReducerEffects<Data> {
    return [
      {
        when: specificCounter.getSuccessType(),
        effect: (state: Data, action: RM.NormalAction<SpecificCounterPayload>) => {
          return {
            countLength: action.payload.countLength,
          };
        },
      },
      // Here we can append more effects from other models.
    ];
  }
}

export const pureCounter = new PureCounter();
```

## Combine reducers
As we created the model with reducer, we should register them to `redux store`
```typescript
import { combineReducers, Reducer, createStore } from 'redux';
import { EnhanceState } from 'redux-model-ts';
import { counter } from './Counter.ts';
import { pureCounter } from './PureCounter.ts';

const reducers = {
  counterData: counter.createData(),
  pureCounterData: pureCounter.createData(),
};

declare global {
  type RootState = Readonly<ReturnType<typeof rootReducers>>;
}

export const rootReducers: Reducer<EnhanceState<typeof reducers>> = combineReducers(reducers);

// Insert store to <Provider store={store}><App /></Provider>
// You can see repo: create-react-app
// const store = createStore(rootReducers);

```

Now, we can use type `RootState` for `react-redux`

```typescript jsx
import React, { PureComponent } from' react';
import { connect } from 'react-redux';

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class App extends PureComponent<Props> {
  
  handleIncrease = () => {
    const { specificLength } = this.props;
    
    specificLength(100);
  };
  
  render() { 
    const { myLength } = this.props;
    
    return <div onClick={this.handleIncrease}>My Length is: {myLength}</div>;
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    myLength: state.pureCounterData.countLength;
  };
};

const mapDispatchToProps = {
  specificLength: pureCounter.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

## Advance: Fetching api
It's very easy to fetch api by using this package. Let me show you:

You need to create custom model before you can use it.

```typescript
// File: CustomApiModel.ts

import { RequestModel, createRequestMiddleware } from 'redux-model-ts';

interface ErrorResponse {
  code: string;
  message: string;
  error: string;
}

// Abstract class for creating fetch action and reducer
export class CustomApiModel<Data = {}, Response = {}, Payload = {}> extends RequestModel<Data, Response, Payload> {
  
  public static middleware = 'request normal kid api';
  
  public static createMiddleware() {
    return createRequestMiddleware<RootState>({
      id: CustomApiModel.middleware,
      baseUrl: 'http://api.xxx.com',
      getHeaders: (api) => {
        // You can get token from reducer: api.getState().xxxReducer.access_token,
        return {
          Authorization: `Bearer token`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };
      },
      onFail: (error: RM.HttpError<ErrorResponse>, transform) => {
        const { data } = error.response;

        transform.businessCode = data ? data.code : undefined;
        transform.errorMessage = (data && data.message) || error.message || 'Fail to fetch';
      },
      onShowSuccess: (successText) => {
        console.log(successText);
      },
      onShowError: (errorMessage) => {
        console.error(errorMessage);
      },
    });
  }
  
  protected getMiddlewareName(): string {
    return CustomApiModel.middleware;
  }
}



// File: CustomApiActionModel.ts

type Data = RM.DoNotUseReducer;

// Abstract class for creating pure fetch action
export abstract class CustomApiActionModel<Response = {}, Payload = {}> extends CustomApiModel<Data, Response, Payload> {
  
  protected getInitValue(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}

```
Now, you can register middleware:
```typescript
import { applyMiddleware, compose, createStore, Middleware, Reducer, Store } from 'redux';

createStore(
  rootReducers,
  {},
  compose(applyMiddleware(CustomApiModel.createMiddleware())),
);
```

## Create request action and reducer
We have created CustomApiModel

```typescript
interface Payload {
  userId: number;
}

interface Response {
  name: string;
  age: number;
}

type Data = Partial<Response>;

class Profile extends CustomApiModel<Data, Response, Payload> {
  
  action(userId: number): RM.MiddlewareEffect<Response, Payload> {
    return this.get('/api/profile', {
      query: {
        id: userId,
      },
      payload: {
        userId,
      },
    });
  }
  
  protected getInitValue(): Data {
    return {};
  }
  
  onSuccess(state: Data, action: RM.ResponseAction<Response, Payload>): Data {
    return {
      ...state,
      [action.payload.userId]: action.response,
    };
  }
}

export const profile = new Profile();
```

Register it to reducers:
```typescript
const reducers = {
  profileData: profile.createData(),
  profileMeta: profile.createMeta(),
};
```

How to use it in **tsx** file?
```typescript jsx
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';


interface OwnProps {
  userId: number;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class App extends PureComponent<Props> {
  
  componentDidMount() {
    const { getProfile, userId } = this.props;
    
    getProfile(userId);
    // Request action will return an object { cancel, promise }  
    
    // getProfile(userId).promise.then((response) => {}).catch((err) => {});
    
    // const { cancel } = getProfile(userId);
    // You can invoke `cancel()` when you want to abort this request.
  }
  
  render() {
    const { myProfile, loading } = this.props;
    
    if (loading) {
      return <div>Fetching data...</div>;
    }
    
    return <div>Hello: {myProfile ? myProfile.name : 'Guy'}</div>;
  }
}

const mapStateToProps = (state: RootStae, ownProps: OwnProps) => {
  return {
    myProfile: (state.profileData[ownProps.userId],
    loading: state.profileMeta.loading,
  };
};

const mapDispatchToProps = {
  getProfile: profile.action,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

## Create pure fetch action
```typescript
class UpdateProfile extends CustomApiActionModel {
  
  action(userId: number, data: object): RM.MiddlewareEffect {
    return this.put(`/user/profile/${userId}`, {
      body: data,
      successText: 'User updated.',
    });
  }
  
}
```

Feel free to use this package, and you are welcome to send RP to me.
