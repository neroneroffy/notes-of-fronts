/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 * ----
 * page TrafficControl
 *
 * @author ZhouHaitao
 * @Date 2019/4/6 0006
 * @Time: 17:36
 */
import { Container } from 'unstated';
import axios from 'axios'
class CounterContainer extends Container {
  constructor(initCount) {
    super(...arguments);
    this.state = {
      count: initCount || 0,
      phone: '等待加载',
      isLoading: false
    };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 })
  }

  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  }

  loadData = () => {
    this.setState({
      isLoading: true
    })
    axios.get('https://randomuser.me/api').then(res => {
      console.log(res.data)
      this.setState({
        phone: res.data.results[0].phone,
        isLoading: false
      })
    })
  }
}

export default CounterContainer
