# 处理Reducer

### 双向绑定
在文档的多个例子中，reducer的变更都是通过直接变更state对象，这很好，简化了代码的复杂度，减少了代码量，阅读起来也方便。
```typescript
(state) => {
    state.counter += 1;
}
```

------------

### 合并

如果您只想变更部分数据，但又不想一个一个地赋值，那么请使用`Object.assign`处理
```typescript
(state, payload) => {                     
    // 请勿使用 return { ...state, ...payload } 的方式！！！
    Object.assign(state, payload);
}
```
?> Q: 为什么要用`assign`而不用的`rest/spread`模式？<br><br>A: 因为state是被监听的数据，如果你使用 ~~`return { ...state, ...payload };`~~ 这种形式，那么相当于返回了新的对象，被监听的那部分数据就无法被解除，最终造成内存溢出

------------

### 新数据

有时候我们想使用全新的数据代替当前的state，那么请直接返回。

!> 对于新的数据，请务必返回，否则reducer不会改变

```typescript
(state, payload) => {
  return payload;
}
```

------------

### 不处理
如果执行Action并非是想改变当前模型的reducer，那么我们可以直接置空
```typescript
(state) => {
  // 不做任何处理
}

(state) => {
    // 或者返回空
    return;
}
```
