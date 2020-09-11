在您做任意操作之前，请先创建一个存储仓库。

<!-- tabs:start -->

#### ** React **
```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createReduxStore } from '@redux-model/react';

const store = createReduxStore();

ReactDOM.render(
  <Provider store={store}>
    <div>Hello world</div>
  </Provider>,
  document.getElementById('root')
);

```
#### ** Vue **
```typescript
<template>
  <div>Hello world</div>
</template>

<script>
import { createReduxStore } from '@redux-mode/vue';

createReduxStore();

export default {
  components: [],
};
</script>
```

<!-- tabs:end -->


### 日志
Redux的操作日志可以通过控制台查看，但需要您安装插件包`redux-logger`
```typescript
import { Middleware } from 'redux';

const middleware: Middleware[] = [];

if (process.env.NODE_ENV !== 'production') {
  middleware.push(require('redux-logger').createLogger({
    collapsed: true,
    diff: true,
    duration: true,
    logErrors: true,
  }));
}

const store = createReduxStore({
  middleware,
});
```

### Redux-Devtools
如果您安装了[Redux扩展程序](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)，您也可以直接通过更改compose达到注册效果：
```typescript
const store = createReduxStore({
  compose: process.env.NODE_ENV !== 'production'
    ? window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']
    : undefined,
});
```
