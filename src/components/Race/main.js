import React, { useEffect, useState } from 'react'
import { Select, Spin } from 'antd'
import { connect } from 'react-redux'
import { toggleProject } from './actions'
import ProjectPage from './ProjectPage'
import './styles/main.css'
function Main(props) {
  const { toggleProject, loading } = props
  const [ project, setProject ] = useState('A')
  const onSelectChange = val => {
    toggleProject()
    setProject(val)
  }
  useEffect(() => {
    toggleProject('A')
  }, [])
  return <div className={'race-main'}>
    <div className="project-toggle">
      切换项目
      <Select onChange={onSelectChange} value={project} style={{ width: 200, marginLeft: 8 }}>
        <Select.Option value={'A'}>A-project</Select.Option>
        <Select.Option value={'B'}>B-project</Select.Option>
      </Select>
    </div>
    <div className="view">
      {
        loading ?
          <Spin/>
          :
          <ProjectPage project={project}/>
      }
    </div>
  </div>
}
const mapStateToProps = state => {
  return {
    loading: state.global.loading
  }
}
const mapDispatchToProps = {
  toggleProject
}
export default connect(mapStateToProps, mapDispatchToProps)(Main)
