## 组合组件
这种模式本质上解决的是组件之间传值的问题。但是它对于传值以及一些内部操控的逻辑封装得更严密。

场景：希望减少上下级组件之间props的传递，简单来说就是不用传做显式地传值，来达到组件之间相互通信的目的

举例来说，某些界面中应该有Tabs这样的组件，由Tab和TabItem组成，点击每个TabItem，该TabItem会高亮，
那么Tab和TabItem自然要进行沟通。很自然的写法是像下面这样
```
<TabItem active={true} onClick={this.onClick}>One</TabItem>
<TabItem active={false} onClick={this.onClick}>Two</TabItem>
<TabItem active={false} onClick={this.onClick}>Three</TabItem>
```
这样的缺点很明显：
* 每次使用 TabItem 都要传递一堆 props
* 每增加一个新的 TabItem，都要增加对应的 props
* 如果要增加 TabItem，就要去修改 Tabs 的 JSX 代码

但是，组件之间的交互我们又不希望通过props或者context来实现。希望用法如下面一样简洁。
```
    <Tabs>
      <TabItem>第一</TabItem>
      <TabItem>第二</TabItem>
      <TabItem>第三</TabItem>
    </Tabs>
```

组件之间通过隐秘的方式进行通信，但这里的隐秘实际上是对props的操作在一个地方进行管理。

***

### 实现
明白了要实现的交互，和代码层面要实现的效果，就可以开始动手了。

TabItem组件有两个关键的props: active（表明当前是否应高亮），onTabClick（自己被点击时调用的回调函数），
TabItem由于是每个Tab页面的容器，它只负责把props.children渲染出来，所以用函数式组件即可。
```
export const TabItem = props => {
  const { active, onTabClick, children } = props
  const style = {
    color: active ? 'red' : 'green',
    cursor: 'pointer'
  }
  return <>
    <h1 style={style} onClick={onTabClick}>
      {children}
    </h1>
  </>
}

```

我们再来回顾一下想到达到的效果：
```
    <Tabs>
      <TabItem>第一</TabItem>
      <TabItem>第二</TabItem>
      <TabItem>第三</TabItem>
    </Tabs>
```


使用组件时要避免传递props的缺点，那么在哪里传递呢？自然是是Tabs组件。但上面并没有传入props啊。
Tabs 虽然可以访问到props里边的children，但是到手的children已经是现成的如果直接改它的话，会出问题。
不可以直接改children的话，我们就把children复制一份，然后改这个复制过来的children，再渲染出去，就ok啦！


下面来看Tabs的实现：
```
class Tabs extends React.Component {
  state={
    activeIndex: 0
  }
  render() {
    const { activeIndex } = this.state
    const newChildren = React.Children.map(this.props.children, (child, index) => {
      if (child.type) {
          // 复制并修改children
        return React.cloneElement(child, {
          active: activeIndex === index,
          onTabClick: () => this.setState({activeIndex: index})
        })
      } else {
        return child
      }
    })
    return <div className="tabs">
      {newChildren}
    </div>
  }
}
```

这里需要用到React不常用的api：

* React.Children.map
* React.cloneElement

使用`React.Children.map`来对props.children进行遍历。

而`React.cloneElement`可以复制某个元素，第一个参数是被复制的元素，第二个参数我们可以把想传入的props加进去，也就是这个时机，
我们将active和onTabClick传入。实现最终效果。

### 总结

这种模式比较好的把复杂逻辑完全封装起来了，抽象程度更好，比较适合开发组件开发者。针对props的扩展性也比较好，对于使用组件的开发者来说，也比较友好。

