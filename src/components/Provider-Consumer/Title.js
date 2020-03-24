import React from 'react'
import { ThemeConsumer } from './context'
import Text from './Text'
class Title extends React.Component {
  render() {
    return <ThemeConsumer>
      {
        theme => <h1 style={{ color: theme.themeColor }}>
          title
        </h1>
      }
    </ThemeConsumer>
  }
}

export default Title
