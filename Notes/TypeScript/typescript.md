interface是继承扩展类型， type是交集扩展类型
interface可以重复声明覆盖， type不允许重复声明

```
// Interface
// 通过继承扩展类型
interface Animal {
  name: string
}

interface Bear extends Animal {
  honey: boolean
}

const bear = getBear() 
bear.name
bear.honey
        
// Type
// 通过交集扩展类型
type Animal = {
  name: string
}

type Bear = Animal & { 
  honey: boolean 
}

const bear = getBear();
bear.name;
bear.honey;

```

```

// Interface
// 对一个已经存在的接口添加新的字段
interface Window {
  title: string
}

interface Window {
  ts: TypeScriptAPI
}

const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
        
// Type
// 创建后不能被改变
type Window = {
  title: string
}

type Window = {
  ts: TypeScriptAPI
}

// Error: Duplicate identifier 'Window'.
```

### ts的class修饰符有哪些，区别是什么

### ts的枚举用途


### ts的函数重载怎么做的

### TypeScript 的使用程度？了解 Partial、Pick、Omit 吗？

### Tuple它有什么作用？ 有什么特点？

### type和interface有什么区别？

### ts的never和vioid有什么区别

### any 和 unknow 的区别