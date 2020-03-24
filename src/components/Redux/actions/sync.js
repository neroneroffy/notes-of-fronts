import axios from 'axios'
export const LOAD_SUCCESS = 'LOAD_SUCCESS'

const loadSuccessAction = data => ({
  type: LOAD_SUCCESS,
  data
})
export const loadData = () => dispatch => {
  return axios.get('https://randomuser.me/api').then(res => {
    dispatch(loadSuccessAction(res.data))
  })
}
