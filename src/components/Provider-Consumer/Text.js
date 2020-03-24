import React from 'react'
import { TextProvider } from './context'
import TextChild from './TextChild'
class Text extends React.Component {
  render() {
    return <TextProvider value={{ text: 'hello123'}}>
      <TextChild/>
    </TextProvider>
  }
}

export default Text

