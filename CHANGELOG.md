# 8.1.3
* Property compose support literal string `default` and `redux-devtools`

-----------------------------------------

* compose选项支持字符串`default`和`redux-devtools`

```typescript
const store = createReduxStore({
  compose: process.env.NODE_ENV === 'production' ? 'default' : 'redux-devtools',
});
```

# 8.1.2
* Deprecate `patch` method in taro <br>
* Skip rejection if user doesn't handle catch in action<br>
* metas and loadings respond wrong pick type <br>
* Upgrade pkg immer to 7.0.9

-----------------------------------------

* taro库中禁用`patch`请求 <br>
* 用户请求action不带catch时将不向下抛出异常 <br>
* 修复metas和loading的pick方法类型错误的问题 <br>
* 升级immer到7.0.9

# 8.1.0
[feat] Orphan request support custom successText, failText and hideError properties <br>
[chore] Reduce bundle size

-----------------------------------------

[特性] 独立请求支持自定义的 successText, failText 和 hideError 属性 <br>
[周边] 减小打包体积

# 8.0.1
[fix] PersistGate forget to call isCompressed <br>
[chore] Update package tslib from 2.0.0 to 2.0.1 <br>
[chore] Reduce bundle size

-----------------------------------------

[修复] 持久层组件忘记调用方法 isCompressed <br>
[周边] 升级tslib包到2.0.1 <br>
[周边] 减小打包体积

# 8.0.0
[breaking] Rename method initReducer to initialState <br>
[breaking] Rename method changeReducer to changeState <br>
[breaking] Remove method resetReducer <br>
[chore] Reduce bundle size

Easy to migrate from `7.x` by replace method names globally through IDE.

-----------------------------------------

[破坏] 重命名方法 initReducer 为 initialState <br>
[破坏] 重命名方法 changeReducer 为 changeState <br>
[破坏] 删除方法 resetReducer <br>
[周边] 减小打包体积

通过代码编辑器的全局替换功能，您可以很容易地从`7.x`升级到该版本

# 7.3.0
[feat] Normal Action support afterSuccess

-----------------------------------------

[特性] 普通Action支持afterSuccess的事件

```typescript
class Test extends Model {
  t1 = this.action((state, payload: object) => {
    // ...
  }, {
    afterSuccess: (action) => {
      console.log(action.payload);
    },
    // duration: 1000,
  });
}
```

# 7.2.1
[type] Correctly fail action <br>
[perf] Early returns for persist rehydrate <br>
[perf] Reduce call getData() from twice to once

-----------------------------------------

[类型] 修正失败action的类型 <br>
[优化] 处理reducer遇到持久化时立即返回 <br>
[优化] 减少元数据值调用次数

# 7.2.0
[feat] **after** subscribers can using duration now. <br>
[feat] Persist with cache to against entry hot-reload. <br>
[refactor] Reduce bundle size. <br>

--------------------------------------

[特性] **after** 订阅事件增加延迟执行时间。 <br>
[特性] 持久层加入缓存机制以应对入口的热更新。 <br>
[重构] 优化打包尺寸

# 7.1.0
[feat] Model useData() support shallowEqual as the second parameter. <br>
[feat] Http Service add config protperty `throttleTransfer` to handle cache key globally. <br>
[refactor] Reduce bundle size.

--------------------------------------

[特性] 模型实例方法 useData() 第二个参数增加shallowEqual浅对比开关。 <br>
[特性] Http服务增加`throttleTransfer`的配置项，用于全局性地改变节流缓存依据。<br>
[重构] 优化代码尺寸。

# 7.0.1
[fix] Taro H5 can't find Taro.getStorage <br>
[fix] Taro throw error when storage key is not found <br>
[feat] Function createReduxStore() prarmeter provide default value `{}`

--------------------------------------

[修复] Taro H5端无法直接使用 Taro.getStorage <br>
[修复] Taro 在找不到缓存的情况下会抛出异常 <br>
[特性] 函数createReduxStore() 参数提供了默认值：`{}`

# 7.0.0
## Breaking
* Depecrate ~~**@redux-model/web**~~ and ~~**@redux-model/react-native**~~, use `@redux-model/react` instead.
* Required minimum taro version is `v3.0`.
* Required minimum vue version is `v3.0`.
* Rename Model.isLoading() to Model.useLoading().
* Persist storage engine should implements Promise now.
* HttpService provides generic for error data and never export `HttpResponse` for user.
* Throttle parameters convert to object option now.

## Features
* Add ComposeAction to hold multiple request, that provides `loading, useLoading, meta, useMeta` methods.
* Throttle add transfer function.
* Provide new storage engine.
* Vue hooks.
* Vue PersistGate component for persist.
* Request-action and effects support `afterPrepare`, `afterSuccess` and `afterFail` to dispatch or execute other things.
* Update deps to latest.

# 6.9.2
[fix] Use builtin delete keyword to compatible with lower version device and browser

# 6.9.1
[fix] Query request doesn't work in react-native

# 6.9.0
[feat] Support dispatch action in action, I call it "sub action"

# 6.8.3
[fix] Compatible with taro http status and statusCode [#6](https://github.com/redux-model/redux-model/issues/6)

# 6.8.2
[feat] Downgrade es6 syntax to support low version browser

# 6.8.0
[feat] New persist api to against compression
<br>
[feat] Persist data can be filtered by model now

# 6.7.10
[fix] Add type definition: clearThrottle(): void
<br>
[fix] Delete cache for toggle throttle

# 6.7.9
[fix] Clear throttle supported

```typescript
class Test extends Model {
  getList = api.action(() => {
    return this.get('/api/').throttle(5000);
  });
}
const test = new Test();

// Clear by invoke method
test.getList.clearThrottle();
```

# 6.7.8
[fix:Taro] Use @tarojs/taro instead of react
<br>
[fix:Taro] Taro doesn't compile node_modules for h5 env

# 6.7.5
[fix:Taro] Format array query string to brackets type

# 6.7.4
[fix] Compare persist config before rehydrate

# 6.7.3
[fix] Get correct reducer name for instance one class several times

# 6.7.2
[fix] Don't check register before store is created

# 6.7.1
[refactor] Improve performance of persist

# 6.7.0
[feat] Add persist for reducer

## Breaking Changes
Rename `cache()` to `throttle()` in chains of request action

# 6.6.0
[feat] Request actions always have meta or metas

# 6.5.11
[fix] `changeReducer()` bind wrong instance name

# 6.5.6
[feat] Lazy meta to improve performance

# 6.5.2
[fix] Ignore additional options from service for cache

# 6.5.0
[feat] Add cache option to request action

# 6.4.2
[fix] Redux state doesn't trigger observer in vue

# 6.4.0
[feat] The parameter of createReduxStore changed as object config

# 6.3.0
[feat] Add methods `clone`,`isSuccess`,`transformSuccessData` into HttpService

# 6.2.0
[feat] New property `withMeta` of request action to replace `metaKey`

# 6.1.3
[fix] Compatible with compression in dev environment

# 6.1.2
[fix] Correctly request method

# 6.1.1
[feat] Exchange service method name and `uri` property
<br>
[fix] Missing inject generics
<br>
[fix] Add method chain `hideError`

# 6.0.0
## Breaking Changes
Totally rewrite request action to reduce more code

# 5.12.0
[feat] Combine actionRequest and actionNormal into `action`

# 5.11.0

### Breaking Changes
[feat] Rename property from `meta` to `metaKey` when creating request action
