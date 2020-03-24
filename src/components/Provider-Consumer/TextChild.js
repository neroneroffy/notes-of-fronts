import React from 'react'
import { TextConsumer } from './context'
class Title extends React.Component {
  render() {
    return <TextConsumer>
      {
        data => {
          return <p>
            {data.text}
          </p>
        }
      }
    </TextConsumer>
  }
}

export default Title

