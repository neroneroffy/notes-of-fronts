import React from 'react'

const Auth = props => {
  const userName = '123'
  if (userName) {
    const allProps = { userName, ...props }
    return <>{props.login(allProps)}</>
  } else {
    return <>
      {props.noLogin(props)}
    </>
  }
}
export default Auth
