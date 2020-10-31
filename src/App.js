import React, { Component } from 'react';
import '../node_modules/antd/dist/antd.css'
import './App.css';
import RenderProps from './components/RenderProps'
import ProviderConsumer from './components/Provider-Consumer'
import ComposeComponent from './components/ComposeComponent'
import Unstated from './components/Unstated'
import ReduxExp from './components/Redux'
// import Hooks from './components/Hooks'
import MacroOrMicroTask from './components/MacroOrMicroTask'
import testPromise from './components/Promise'
import reduceExp from './components/Reduce'
import Race from './components/Race'
// import { ast } from './components/Ast'
class App extends Component {
  state={
    count: 0
  }
  componentDidMount() {
    testPromise()
    // reduceExp()
    this.setState((pState, props) => {
      return {count: pState.count + 1}
    })
    this.setState((pState, props) => {
      return {count: pState.count + 1}
    })
    this.setState((pState, props) => {
      return {count: pState.count + 1}
    })

  }
  render() {

    return (
      <div className="App">
        {/*        <ReduxExp/>
       <ProviderConsumer/>
        <MacroOrMicroTask/>
        <RenderProps/>

        <ComposeComponent/>
        <Unstated/>
        <Hooks/>
        <Race/>*/}
      </div>
    );
  }}

export default App;
