import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {FETCH_SUCCESS, fetchData} from './actions'

const ProjectPage = props => {
  const { fetchData, result, project } = props
  useEffect(() => {
    fetchData(project)
  }, [])
  return <div>
    <h1>{ result }</h1>
  </div>
}
const mapStateToProps = state => {
  return {
    result: state.view.result,
  }
}
const mapDispatchToProps = {
  fetchData
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage)
