'use strict'

let params = require('params')
let debug = require('debug')('json-business-rules')

class Rule {
  constructor (options = {}) {
    this.options = options
    this.conditions = {}
    this.action = {
      type: 'unknown'
    }
  }

  setConditions (conditions) {
    this.conditions = params(conditions).only(['all', 'any'])
    if (Object.keys(this.conditions).length !== 1) {
      throw new Error('conditions root must contain a single instance of "all" or "any"')
    }
  }

  setAction (action, cb) {
    this.action = params(action).only(['type', 'params'])
    this.actionCallback = cb
  }

  testCondition (condition, test) {
    switch (condition.operator) {
      case 'equal':
        return test === condition.value
      case 'notEqual':
        return test !== condition.value
      case 'in':
        return condition.value.includes(test)
      case 'notIn':
        return !condition.value.includes(test)
      case 'lessThan':
        return test < condition.value
      case 'lessThanInclusive':
        return test <= condition.value
      case 'greaterThan':
        return test > condition.value
      case 'greaterThanInclusive':
        return test >= condition.value
    }
  }

  async runConditions (conditions, engine) {
    return await Promise.all(conditions.map(async (condition) => {
      let factValue = await engine.factValue(condition.fact, condition.params)
      let conditionResult = this.testCondition(condition, factValue)
      debug(`testCondition:: <${factValue} ${condition.operator} ${condition.value}?> (${conditionResult})`)
      return conditionResult
    }))
  }

  async any (conditions, engine) {
    let results = await this.runConditions(conditions, engine)
    debug('any::results', results)
    return results.some((result) => result === true)
  }

  async all (conditions, engine) {
    let results = await this.runConditions(conditions, engine)
    debug('all::results', results)
    return results.every((result) => result === true)
  }

  async evaluate (engine) {
    if (this.conditions.any) {
      return await this.any(this.conditions.any, engine)
    } else {
      return await this.all(this.conditions.all, engine)
    }
  }
}

export default Rule
