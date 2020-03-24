import React from 'react'
import { Select } from 'antd'
import { ThemeProvider } from './context'
import Page from './Page'

const Option = Select.Option;

class ProviderConsumer extends React.Component {
  state = {
    theme: 'red'
  }
  handleChange = value => {
    this.setState({ theme: value })
  }
  render() {
    const { theme } = this.state
    return <>
      <Select defaultValue="red" style={{ width: 120 }} onChange={this.handleChange}>
        <Option value="red">红色</Option>
        <Option value="blue">蓝色</Option>
      </Select>

      <ThemeProvider value={{ themeColor: theme }}>
        <Page/>
      </ThemeProvider>
    </>
  }
}

export default ProviderConsumer
