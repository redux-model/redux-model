存储仓库的数据存储在内存中，当您刷新浏览器页面或者关闭客户端时，数据立即丢失。当然，您也可以选择将仓库中的数据存放在持久层：

<!-- tabs:start -->

#### ** React **
```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { createReduxStore, PersistGate, Provider } from '@redux-mode/react';

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
#### ** Taro **
```typescript
// app.tsx
import { createReduxStore, PersistGate } from '@redux-mode/taro';

const store = createReduxStore({
  persist: {
    key: 'PROJECT_NAME',
    version: 1,
    storage: 'taro',
    allowlist: {},
  },
});

```
因为一些已知的[官方原因(点击查看)](https://github.com/NervJS/taro/issues/6548#issuecomment-717896033)，PersistGate不能放在app入口，只能放在首页入口组件中。

放在首页会存在一个**隐患**。如果访问的小程序带上了路径，那么首页会被直接跳过，里面的PersistGate也不会执行，起不到守卫的作用，数据也不再安全。

```typescript
// pages/index/index.tsx
import React, { Component } from 'react';
import { createReduxStore, PersistGate } from '@redux-mode/taro';

class Index extends Component {
  render() {
    return (
      <PersistGate>
        <View>
          <Text>Hello, World</Text>
        </View>
      </PersistGate>
    );
  }
}
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
数据的版本号，当传入的版本号与持久层中的版本号对应不上时，持久层中的数据便会被丢弃。**（请谨慎修改）**
#### storage
持久层引擎，框架已提供常用的引擎：
* `local` => 浏览器专用的 localStorage
* `session` => 浏览器专用的 sessionStorge
* `taro` => **Taro**项目请选择这个引擎
* `memory` => 内存，常用于测试

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


### 过滤持久层数据
持久层的数据会在初始化的时候替换模型初始state，有时候您不一定想完完全全地替换，下面部分场景是需要过滤的：

* 持久层数据携带过期的字段，如果过期（比如token），则仍使用初始数据。
* 持久层数据恢复时，需要更新部分字段，如时间戳和一些根据外部条件动态改变的状态。
* 持久层数据类型变化（推荐修改`persist.allowlist`的key值来重置单个模型）

您只需在模型中增加一个保护方法即可：
```typescript
import { FilterPersist } from '@redux-model/react';

class CustomModel extends Model<Data> {
  protected filterPersistData(): FilterPersist<Data> {
    return (state) => {
      // 来自持久层的数据
      // 使用mvvm方式变更
    };
  }
}
```
