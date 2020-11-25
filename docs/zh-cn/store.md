在您做任意操作之前，请先创建一个存储仓库。

<!-- tabs:start -->

#### ** React **
```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { createReduxStore, Provider } from '@redux-model/react';

const store = createReduxStore();

ReactDOM.render(
  <Provider store={store}>
    <div>Hello world</div>
  </Provider>,
  document.getElementById('root')
);
```
#### ** Taro **
```typescript
import React, { Component } from 'react';
import { createReduxStore, Provider } from '@redux-model/taro';

const store = createReduxStore();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <View>
          <Text>Hello world</Text>
        </View>
      </Provider>
    );
  }
}
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
import { Middleware } from '@redux-model/react';

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
日志也可以通过[Redux扩展程序](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)查看，您需要做以下操作才能正常连接扩展程序：
```typescript
const store = createReduxStore({
  compose: process.env.NODE_ENV === 'production' ? 'default' : 'redux-devtools',
});
```
