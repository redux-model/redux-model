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
