import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from 'antd'

const UseEffectExp = () => {
  const [ phone, setPhone ] = useState('1122335548')
  useEffect(() => {
    axios.get('https://randomuser.me/api').then(res => {
      setPhone(res.data.results[0].phone)
    })
  }, [])
  return <div>
    <span>{ phone }</span>

  </div>
}

export default UseEffectExp

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

