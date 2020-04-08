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
