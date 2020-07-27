Redux Model的存在是为了弥补原生Redux繁琐的开发流程，开发者生产力低下，代码量臃肿，以及因action和reducer文件分散造成代码追踪困难的问题。

Redux Model同时弥补了在typescript项目中，每个地方都需要类型注入，而且异步请求和middleware的关系难以使用类型定义的问题，让业务代码以最少的类型注入得到最大化的智能提示。

[![License](https://img.shields.io/github/license/redux-model/redux-model)](https://github.com/redux-model/redux-model/blob/master/LICENSE)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/redux-model/redux-model/CI/master)](https://github.com/redux-model/redux-model/actions)
[![Codecov](https://img.shields.io/codecov/c/github/redux-model/redux-model)](https://codecov.io/gh/redux-model/redux-model)

总的来说，模型拥有以下特性：

* 深度封装，超高开发效率
* 使用mvvm快速处理reducer
* **无typescript不编程，拥有100%无死角的业务代码类型提示**
* 内置http服务，请求action自带loading追踪、节流
* React/Vue Hooks
* 数据持久化

!> 只有使用vscode编辑器开发项目，才能发挥TS的最大优势
