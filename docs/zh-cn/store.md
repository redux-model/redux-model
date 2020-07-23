在您做任意操作之前，请先创建一个存储仓库。

<!-- tabs:start -->

#### ** React **
```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createReduxStore } from '@redux-mode/react';

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

### 持久化
存储仓库的数据存储在内存中，当您刷新浏览器页面或者关闭客户端时，数据立即丢失。当然，您也可以选择将仓库中的数据存放在持久层：

<!-- tabs:start -->

#### ** React **
```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createReduxStore, PersistGate } from '@redux-mode/react';

const store = createReduxStore({
  persist: {
    key: 'PROJECT_NAME',
    version: 1,
    storage: 'local',
    allowlist: {},
  },
});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate>
      <div>Hello world</div>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

```
#### ** Vue **
```typescript
<template>
  <PersistGate>
    <div>Hello world</div>
  </PersistGate>
</template>

<script>
import { createReduxStore, PersistGate } from '@redux-mode/vue';

createReduxStore({
  persist: {
    key: 'PROJECT_NAME',
    version: 1,
    storage: 'local',
    allowlist: {},
  },
});

export default {
  components: [PersistGate],
};
</script>
```

<!-- tabs:end -->


#### 参数说明
##### key
持久层存放数据的名称，建议您以项目名作为key值。
#### version
数据的版本号，当传入的版本号与持久层中的版本号对应不上时，持久层中的数据便会被丢弃。
#### storage
持久层引擎，框架已提供常用的引擎：
* `local` => 浏览器 localStorage
* `session` => 浏览器 sessionStorge
* `memory` => 内存，常用于测试
* `taro` => Taro框架专用引擎

对于RN项目，您可以直接引入`@react-native-community/async-storage`作为引擎。

!> 所有引擎都是异步存储，所以在根组件中必须使用`PersistGate`组件包装，才能确保数据的正确性。

#### allowlist
允许使用持久化的模型列表。您必须显现地指定模型：
```typescript
{
  persist: {
    allowlist: {
      aModel: aModel,
      bModel: bModel,
    }
  }
}
```

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
