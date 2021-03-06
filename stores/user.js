import { observable, action } from 'mobx'
import axios from 'axios'
import Base from './base'

export default class Store extends Base {
  @observable isLogin = false
  @observable info = null
  @observable token = null
  @observable currentUserEmail = ''

  get isLogin() {
    return !!this.info
  }

  @action
  signUp = user => {
    return axios.post('/users', user)
  }

  @action
  login = userInfo => {
    return axios.post('/users/login', userInfo).then(data => {
      this.info = data.user
      localStorage.setItem('user-jwt', data.token)
      return data
    })
  }

  @action
  logOut = () => {
    this.info = null
    localStorage.removeItem('user-jwt')
  }

  @action
  checkEmailAndSendCode = email => {
    return axios.post('/users/sign-up/check', { email })
  }

  @action
  saveViewRecord = () => {
    const username = this.info ? this.info.username : ''
    if (username === '小明' || username === '小寒' || username === '小白') return false
    axios.post('/view-records', { siteName: 'blog', info: { nickname: username } })
  }

  @action
  getInfo = () => {
    return axios.get('/users/info').then(data => {
      return (this.info = data)
    })
  }
}
