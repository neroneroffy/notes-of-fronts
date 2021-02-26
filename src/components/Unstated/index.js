import React from 'react'

import Parent from './Parent'
import './unstated.css'

class Unstated extends React.Component {
  render() {
    return <div className="unstated">
      <Parent/>
    </div>
  }
}
export default Unstated
