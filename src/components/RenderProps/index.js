import React from 'react'
import Auth from './Auth'
const RenderProps = () => {
  return <Auth
    login={({userName}) => <h1>Hello {userName}</h1>}
    noLogin={() => <h1>please login</h1>}
  />
}
export default RenderProps
