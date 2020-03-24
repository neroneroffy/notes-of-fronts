import React from 'react'

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

class Tabs extends React.Component {
  state={
    activeIndex: 0
  }

  render() {
    const { activeIndex } = this.state
    const newChildren = React.Children.map(this.props.children, (child, index) => {
      if (child.type) {
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

export default Tabs
