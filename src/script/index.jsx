import React from 'react'
import ReactDOM from 'react-dom'
import Parent from './Parent.jsx'
// import  css from '../css/style.css'

// console.log(css)
// @if NODE_ENV = 'development'
console.log('开发测试环境')
// @endif
// @if NODE_ENV = 'production'
console.log('开发测试环境')
// @endif
// @if NODE_ENV = 'dev'
console.log('dev')
// @endif
ReactDOM.render(
  <Parent />,
  document.getElementById('app')
)
