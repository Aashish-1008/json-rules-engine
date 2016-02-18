'use strict'

import params from 'params'

export default class Condition {
  constructor (properties) {
    let booleanOperator
    if (properties.hasOwnProperty('any')) {
      booleanOperator = 'any'
    } else if (properties.hasOwnProperty('all')) {
      booleanOperator = 'all'
    }
    Object.assign(this, properties)
    if (booleanOperator) {
      let subConditions = properties[booleanOperator]
      if (!(subConditions instanceof Array)) {
        throw new Error(`"${booleanOperator}" must be an array`)
      }
      this.operator = booleanOperator
      // boolean conditions always have a priority; default 1
      this.priority = parseInt(properties.priority, 10) || 1
      this[booleanOperator] = subConditions.map((c) => {
        return new Condition(c)
      })
    } else {
      properties = params(properties).require(['fact', 'operator', 'value'])
      // a non-boolean condition does not have a priority by default. this allows
      // priority to be dictated by the fact definition
      if (properties.hasOwnProperty('priority')) {
        properties.priority = parseInt(properties.priority, 10)
      }
    }
  }

  toJSON (stringify = true) {
    let props = {}
    if (this.priority) {
      props.priority = this.priority
    }
    if (this.isBooleanOperator()) {
      props[this.booleanOperator()] = this[this.booleanOperator()].map((c) => c.toJSON(stringify))
    } else {
      props.operator = this.operator
      props.value = this.value
      props.fact = this.fact
      if (this.params) {
        props.params = this.params
      }
    }
    if (stringify) {
      return JSON.stringify(props)
    }
    return props
  }

  evaluate (comparisonValue) {
    switch (this.operator) {
      case 'equal':
        return comparisonValue === this.value
      case 'notEqual':
        return comparisonValue !== this.value
      case 'in':
        return this.value.includes(comparisonValue)
      case 'notIn':
        return !this.value.includes(comparisonValue)
      case 'lessThan':
        return comparisonValue < this.value
      case 'lessThanInclusive':
        return comparisonValue <= this.value
      case 'greaterThan':
        return comparisonValue > this.value
      case 'greaterThanInclusive':
        return comparisonValue >= this.value
      // for any/all, simply comparisonValue that the sub-condition array evaluated truthy
      case 'any':
        return comparisonValue === true
      case 'all':
        return comparisonValue === true
      default:
        throw new Error(`Unknown operator: ${this.operator}`)
    }
  }

  booleanOperator () {
    if (this.hasOwnProperty('any')) {
      return 'any'
    } else if (this.hasOwnProperty('all')) {
      return 'all'
    }
  }

  isBooleanOperator () {
    return this.any !== undefined || this.all !== undefined
  }
}
