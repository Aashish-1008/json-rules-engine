'use strict'

import engineFactory from '../src/json-rules-engine'
import sinon from 'sinon'

describe('Engine: cache', () => {
  let engine

  let action = { type: 'setDrinkingFlag' }
  let collegeSeniorAction = { type: 'isCollegeSenior' }
  let conditions = {
    any: [{
      fact: 'age',
      operator: 'greaterThanInclusive',
      value: 21
    }]
  }

  let factSpy = sinon.stub().returns(22)
  let actionSpy = sinon.spy()
  function setup () {
    factSpy.reset()
    actionSpy.reset()
    engine = engineFactory()
    let over20 = factories.rule({ conditions, action: collegeSeniorAction, priority: 50 })
    engine.addRule(over20)
    let determineDrinkingAge = factories.rule({ conditions, action, priority: 100 })
    engine.addRule(determineDrinkingAge)
    let determineCollegeSenior = factories.rule({ conditions, action: collegeSeniorAction, priority: 1 })
    engine.addRule(determineCollegeSenior)
    engine.addFact('age', factSpy)
    engine.on('action', actionSpy)
  }

  it('runs the rules in order of priority', () => {
    setup()
    expect(engine.prioritizedRules).to.be.null
    engine.prioritizeRules()
    expect(engine.prioritizedRules.length).to.equal(3)
    expect(engine.prioritizedRules[0][0].priority).to.equal(100)
    expect(engine.prioritizedRules[1][0].priority).to.equal(50)
    expect(engine.prioritizedRules[2][0].priority).to.equal(1)
  })

  it('clears re-propriorizes the rules when a new Rule is added', () => {
    engine.prioritizeRules()
    expect(engine.prioritizedRules.length).to.equal(3)
    engine.addRule(factories.rule())
    expect(engine.prioritizedRules).to.be.null
  })
})
