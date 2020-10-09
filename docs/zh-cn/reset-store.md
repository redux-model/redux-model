结合业务使用场景，当用户退出登陆时，程序需要手动重置redux中的数据。在浏览器中可以通过刷新页面的方式简单粗暴地释放内存数据。但如果时在App或者小程序中，刷新操作行不通。所以我们来看看模型中如何快速重置数据

```typescript
import { Model } from '@redux-model/react';

Model.resetStore();
```
就这么简单，模型内置一个静态方法用于重置数据，所有实例化的模型都会被重置回`initialState`的值。您也许还想更细腻一些，某些模型其实存储的是通用的数据，与用户无关，您想在重置的时候保留它们。看看下面的做法：

```typescript
class TestModel extends Model {
  plus = this.action((state) => {
    state.counter += 1;
  });

  protected initialState() {
    return {
      counter: 0,
    };
  }

  // -----开始
  protected keepOnResetStore(): boolean {
    return true;
  }
  // -----结束
}

export const testModel = new TestModel();
```
只要在模型中覆盖保护方法`keepOnResetStore`，您就能保证这个模型的数据不会被重置。

!> 请求中的节流缓存(throttle)并不需要被关心，它足够智能，当用户token更换后，缓存也自动失效了。如果您不放心，可以通过`service.clearThrottle()`将它们一键清空
