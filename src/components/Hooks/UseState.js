import React, { useState } from 'react'
import { Button } from 'antd'

const UseStateExp = () => {
  const [ name, setName ] = useState('lihua')
  return <div>
    <span>{ name }</span>
    <Button onClick={() => setName('李华')}>设置名字</Button>
  </div>
}

export default UseStateExp

/*
const UseStateExp = () => {
  const [ person, setPerson ] = useState({name: 'lihua'})
  return <div>
    <span>{ person.name }</span>
    <Button onClick={() => setPerson({name: '李华'})}>设置名字</Button>
  </div>
}

export default UseStateExp
*/

