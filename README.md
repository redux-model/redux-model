In traditional way, we are always repeating creating actions, types, and reducers. But today, it's unnecessary to repeat your code any more once you install this package. I'll show how to release your hands and save your life.

## Installation

```bash
yarn add redux-model-ts

# or

npm install redux-model-ts --save

```

# Usage
## Create normal action and reducer
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
## Create normal action without reducer
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
```

