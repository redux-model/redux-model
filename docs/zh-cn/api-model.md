# Model API

### action (Normal)

创建Normal Action

```typescript
class Test extends Model {
    modify = this.action((state, payload: any) => {
        state.id = payload;
    });
}
```

### action (Request)

创建Request Action

```typescript
class Test extends Model {
    fetch = service.action(() => {
        return this
            .post('')
            .query()
            .body()
            .onPrepare()
            .onSuccess()
            .metas();
    });
}
```

### changeReducer
快速改变reducer而无需定义Normal Action
```typescript
class Test extends Model {
    demo() {
        const result = ...;
        
        this.changeReducer((state) => {
            state.id = result.id;
        });
    }
}
```

### data
获取Reducer的数据，可以用在任何地方

```typescript
const mapStateToProps = () => {
    return {
        myProfile: testModel.data,
    };
};

export default connect(mapStateToProps)(App);
```

### useData
在Hooks组件中获取Reducer的数据，保证数据变更时可以重新渲染

```typescript
const App = () => {
    const myProfile = testModel.useData();
    
    return <div>app</div>;
};
```

### isLoading
在hooks中，`useXXX`不能在条件中使用。而实际使用中，经常碰到多个loading的判断，比如：`const loading = xx.useLoading() || yy.useLoading()`，这样是会报错的。所以必须同时执行。

```typescript
const loading = Model.isLoading(xx.useLoading(), yy.useLoading());
```

### register
注册reducer到Store中，默认自动注册

### autoRegister
是否自动注册reducer到Redux-Store中，默认为`true`。如果关闭，就需要手动去注册


```typescript
createReduxStore({
    reducers: {
        // 手动
        ...test.register(),
    }
});
```

### effects
监听其他模型的Action
```typescript
class Test extends Model<Data> {
    protected effects(): Effects<Data> {
        return [
            xxx.yyy.onSuccess((state, action) => {
                state.id = action.payload.id;
            }),
        ];
    }
}
```

!> 如果你的模型中包含了`effects()`，那么即使开启了`autoReducer()`，也需要手动去注册

### onInit
模型被实例化时触发，与构造函数同时执行

### onReducerCreated
当Store创建成功时被触发
