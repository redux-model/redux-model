### Meta

Meta本质上也是保存在reducer的数据，它记录了每个请求Action的当前状态。比如http的状态、请求错误时的信息，以及当前Action是否正在请求（loading）

对于请求错误信息，是通过`HttpService`中配置的`onRespondError`选项来收集的。

```typescript
interface ErrorData {
  errcode: number;
  errmsg: string;
}

const $api = new HttpService<ErrorData>({
  onRespondError(httpResponse, transform) {
    if (httpResponse.errcode) {
      transform.businessCode = httpResponse.errcode;
      transform.message = httpResponse.errmsg;
    }
  },
});
```
而针对httpStatus，则会从请求返回的头部信息中获取。您也可以通过`transform.httpStatus = xxx`赋值的方式来改变它。

!> `meta`和`useMeta`也都暴露在action句柄下。<br>
常用的`loading`和`useLoading`本质上也是从meta中取出的。

### Metas
当一个请求Action被连续执行时，它的Meta状态就会被不断覆盖，直到最后一个请求结束。此时Metas登场。

顾名思义，Metas就是Meta的集合。当请求Action的构造器加入了`.metas(value)`后，action的状态追踪便由Metas接管了。它存在的意义就是让每一次的请求都能独立追踪状态，并在组件中分开使用，互不干扰。


### 性能说明
不是每个请求都需要状态追踪，因为是否需要展示loading条，得按业务需求。所以在默认情况下，Meta\[s]会储存在独立的内存块中，不参与Redux的数据升级。

当您调用了action上的`.meta[s]`或者`.loading[s]`，说明记录的状态已经产生了实际作用，此时相应的Meta\[s]就会正式转移回Redux的状态树中。这种**惰性**模式，极大地优化了渲染性能。
