## React 轻量状态管理工具 Unstated

在React写应用的时候，难免遇到跨组件通信的问题。现在已经有很多的解决方案。
* React本身的Context
* Redux结合React-redux
* Mobx结合mobx-react

React 的新的Context api本质上并不是React或者Mbox这种状态管理工具的替代品，充其量只是对React
自身状态管理短板的补充。而Redux和Mbox这两个库本身并不是为React设计的，对于一些小型的React应用
比较重。

## 基本概念
Unstated是基于context API。也就是使用React.createContext()创建一个StateContext来传递状态，
* Container：状态管理类，内部使用state存储状态，通过setState实现状态的更新，api设计与React的组件基本一致。
* Provider：返回Provider，用来包裹顶层组件，向应用中注入状态管理实例，可做数据的初始化。
* Subscribe：本质上是Consumer，获取状态管理实例，在Container实例更新状态的时候强制更新视图。


## 简单的例子
我们拿最通用的计数器的例子来看unstated如何使用，先明确一下结构：Parent作为父组件包含两个子组件：Child1和Child2。
Child1展示数字，Child2操作数字的加减。然后，Parent组件的外层会包裹一个根组件。

### 维护状态
首先，共享状态需要有个状态管理的地方，与Redux的Reducer不同的是，Unstated是通过一个继承自Container实例：
```
import { Container } from 'unstated';

class CounterContainer extends Container {
  constructor(initCount) {
    super(...arguments);
    this.state = {count: initCount || 0};
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  }

  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  }
}

export default CounterContainer
```
看上去是不是很熟悉？像一个React组件类。CounterContainer继承自Unstated暴露出来的**Container**类，利用state存储数据，setState维护状态，
并且setState与React的setState用法一致，可传入函数。返回的是一个promise。

### 共享状态

来看一下要显示数字的Child1组件，利用**Subscribe**与CounterContainer建立联系。
```
import React from 'react'
import { Subscribe } from 'unstated'
import CounterContainer from './store/Counter'
class Child1 extends React.Component {
  render() {
    return <Subscribe to={[CounterContainer]}>
      {
        counter => {
          return <div>{counter.state.count}</div>
        }
      }
    </Subscribe>
  }
}
export default Child1
```
再来看一下要控制数字加减的Child2组件：
```
import React from 'react'
import { Button } from 'antd'
import { Subscribe } from 'unstated'
import CounterContainer from './store/Counter'
class Child2 extends React.Component {
  render() {
    return <Subscribe to={[CounterContainer]}>
      {
        counter => {
          return <div>
            <button onClick={counter.increment}>增加</button>
            <button onClick={counter.decrement}>减少</button>
          </div>
        }
      }
    </Subscribe>
  }
}
export default Child2
```
**Subscribe**内部返回的是StateContext.Consumer，通过to这个prop关联到CounterContainer实例，
使用renderProps模式渲染视图，Subscribe之内调用的函数的参数就是订阅的那个状态管理实例。
**Child1**与**Child2**通过Subscribe订阅共同的状态管理实例**CounterContainer**，所以Child2可以调用
CounterContainer之内的increment和decrement方法来更新状态,而Child1会根据更新来显示数据。

看一下父组件Parent
```
import React from 'react'
import { Provider } from 'unstated'
import Child1 from './Child1'
import Child2 from './Child2'
import CounterContainer from './store/Counter'

const counter = new CounterContainer(123)

class Parent extends React.Component {
  render() {
    return <Provider inject={[counter]}>
      父组件
      <Child1/>
      <Child2/>
    </Provider>
  }
}

export default Parent
```
**Provider**返回的是StateContext.Provider，Parent通过**Provider**向组件的上下文中注入状态管理实例。
这里，可以不注入实例。不注入的话，Subscribe内部就不能拿到注入的实例去初始化数据，也就是给状态一个默认值，比如上边我给的是123。

也可以注入多个实例：
```
<Provider inject={[count1, count2]}>
   {/*Components*}
</Provide>
```
那么，在Subscribe的时候可以拿到多个实例。
```
<Subscribe to={[CounterContainer1, CounterContainer2]}>
  {count1, count2) => {}
</Subscribe>
```

## 分析原理
弄明白原理之前需要先明白Unstated提供的三个API之间的关系。我根据自己的理解，画了一张图来表示：

来梳理一下整个流程：
1. 创建状态管理类继承自Container
2. 生成上下文，new一个状态管理的实例，给出默认值，注入Provider
3. Subscribe订阅状态管理类。内部通过_createInstances方法来初始化状态管理实例并订阅该实例，具体过程如下：
- 从上下文中获取状态管理实例，如果获取到了，那它直接去初始化数据，如果没有获取到
那么就用to中传入的状态管理类来初始化实例。
- 将自身的更新视图的函数onUpdate通过订阅到状态管理实例，来实现实例内部setState的时候，调用onUpdate更新视图。
- _createInstances方法返回创建的状态管理实例，作为参数传递给renderProps调用的函数，函数拿到实例，操作或显示数据。

### Container
用来实现一个状态管理类。可以理解为redux中action和reducer的结合。概念相似，但实现不同。来看一下Container的源码
```
export class Container {
  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach(cb => cb(this));
    this.state = null;
    this.listeners = [];
  }

  setState(updater, callback) {
    return Promise.resolve().then(() => {
      let nextState = null;
      if (typeof updater === 'function') {
        nextState = updater(this.state);
      } else {
        nextState = updater;
      }

      if (nextState === null) {
        callback && callback();
      }
      // 返回一个新的state
      this.state = Object.assign({}, this.state, nextState);
      // 执行listener，也就是Subscribe的onUpdate函数，用来强制刷新视图
      const promises = this.listeners.map(listener => listener());

      return Promise.all(promises).then(() => {
        if (callback) {
          return callback();
        }
      });
    });
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  unsubscribe(fn) {
    this.listeners = this.listeners.filter(f => f !== fn);
  }
}
```

Container包含了state、listeners，以及setState、subscribe、unsubscribe这三个方法。

* state来存放数据，listeners是一个数组，存放更新视图的函数。

* subscribe会将更新的函数(Subscribe组件内的onUpdate)放入linsteners。

* setState和react的setState相似。执行时，会根据变动返回一个新的state，
同时循环listeners调用其中的更新函数。达到更新页面的效果。

* unsubscribe用来取消订阅。

### Provider
Provider本质上返回的是StateContext.Provider。
```
export function Provider(ProviderProps) {
  return (
    <StateContext.Consumer>
      {parentMap => {
        let childMap = new Map(parentMap);

        if (props.inject) {
          props.inject.forEach(instance => {
            childMap.set(instance.constructor, instance);
          });
        }

        return (
          <StateContext.Provider value={childMap}>
            {props.children}
          </StateContext.Provider>
        );
      }}
    </StateContext.Consumer>
  );
}
```
它自己接收一个inject属性，经过处理后，将它作为context的值传入到上下文环境中。
可以看出，传入的值为一个map，使用Container类作为键，Container类的实例作为值。
Subscribe会接收这个map，优先使用它来实例化Container类，**初始化数据**。

可能有人注意到了Provider不是直接返回的StateContext.Provider，而是套了一层
StateContext.Consumer。这样做的目的是Provider之内还可以嵌套Provider。
内层Provider的value可以继承自外层。

### Subscribe

简单来说就是连接组件与状态管理类的一座桥梁，可以想象成react-redux中connect的作用
```
class Subscribe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.instances = [];
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.unsubscribe();
  }

  unsubscribe() {
    this.instances.forEach((container) => {
      container.unsubscribe(this.onUpdate);
    });
  }

  onUpdate = () => new Promise((resolve) => {
    if (!this.unmounted) {
      this.setState(DUMMY_STATE, resolve);
    } else {
      resolve();
    }
  })

  _createInstances(map, containers) {
    this.unsubscribe();

    if (map === null) {
      throw new Error('You must wrap your <Subscribe> components with a <Provider>');
    }

    const safeMap = map;
    const instances = containers.map((ContainerItem) => {
      let instance;

      if (
        typeof ContainerItem === 'object' &&
        ContainerItem instanceof Container
      ) {
        instance = ContainerItem;
      } else {
        instance = safeMap.get(ContainerItem);

        if (!instance) {
          instance = new ContainerItem();
          safeMap.set(ContainerItem, instance);
        }
      }

      instance.unsubscribe(this.onUpdate);
      instance.subscribe(this.onUpdate);

      return instance;
    });

    this.instances = instances;
    return instances;
  }

  render() {
    return (
      <StateContext.Consumer>
        {
          map => this.props.children.apply(
            null,
            this._createInstances(map, this.props.to),
          )
        }
      </StateContext.Consumer>
    );
  }
}
```

这里比较重要的是_createInstances与onUpdate两个方法。StateContext.Consumer接收Provider传递过来的map，
与props接收的to一并传给_createInstances。

**onUpdate**:没有做什么其他事情，只是利用setState更新视图，返回一个promise。它存在的意义是在订阅的时候，
作为参数传入Container类的subscribe，扩充Container类的listeners数组，随后在Container类setState改变状态以后，
循环listeners的每一项就是这个onUpdate方法，它执行，就会更新视图。

**_createInstances**: map为provider中inject的状态管理实例数据。如果inject了，那么就用map来实例化数据，
否则用this.props.to的状态管理类来实例化。之后调用instance.subscribe方法（也就是Container中的subscribe），
传入自身的onUpdate，实现订阅。它存在的意义是实例化Container类并将自身的onUpdate订阅到Container类实例，
最终返回这个Container类的实例，作为this.props.children的参数并进行调用，所以在组件内部可以进行类似这样的操作：

```
 <Subscribe to={[CounterContainer]}>
   {
     counter => {
       return <div>
         <Button onClick={counter.increment}>增加</Button>
         <Button onClick={counter.decrement}>减少</Button>
       </div>
     }
   }
</Subscribe>
```

## 总结
Unstated上手很容易，理解源码也不难。重点在于理解发布（Container类），Subscribe组件实现订阅的思路。
其API的设计贴合React的设计理念。也就是想要改变UI必须setState。另外可以不用像Redux一样写很多样板代码。

理解源码的过程中受到了下面两篇文章的启发：

[纯粹极简的react状态管理组件unstated](https://segmentfault.com/a/1190000017305209?utm_source=tag-newest#articleHeader11)

[Unstated浅析](https://juejin.im/post/5c482aa76fb9a049f362714e#heading-0)









