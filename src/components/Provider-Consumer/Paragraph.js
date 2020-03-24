import React from 'react'
import { ThemeConsumer } from './context'

class Paragraph extends React.Component {
  render() {
    return <ThemeConsumer>
      {
        theme => <p style={{ color: theme.themeColor }}>
          paragraph
        </p>
      }
    </ThemeConsumer>
  }
}

export default Paragraph
