import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Child extends Component {
  constructor () {
    super()
    this.state = {}
    setTimeout(() => {
      const a = 'a'
      console.log(a)
    })
  }

  render () {
    return (
      <div>
        and this is the <b>{this.props.name}</b>.
      </div>
    )
  }
}

Child.propTypes = {
  name: PropTypes.string
}

export default Child
