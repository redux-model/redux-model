Redux Model是为了弥补原生Redux繁琐的开发流程，开发者重复劳动效率低下，模板文件导致代码量臃肿，以及因action和reducer文件分散造成代码追踪困难的问题而设计的。

[![License](https://img.shields.io/github/license/redux-model/redux-model)](https://github.com/redux-model/redux-model/blob/master/LICENSE)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/redux-model/redux-model/CI/master)](https://github.com/redux-model/redux-model/actions)
[![Codecov](https://img.shields.io/codecov/c/github/redux-model/redux-model)](https://codecov.io/gh/redux-model/redux-model)

总的来说，模型拥有以下特性：

* 深度封装，模块化开发
* 使用mvvm快速处理reducer
* **👍真正意义上的Typescript框架，写起来比JS更流畅**
* 内置http服务，请求action自带loading追踪、数据节流
* 支持React/Vue Hooks
* 支持数据持久化
* 支持[Graphql](https://github.com/redux-model/graphql)请求

!> 只有使用vscode编辑器开发项目，才能发挥TS的最大优势
