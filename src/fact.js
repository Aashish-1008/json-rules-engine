'use strict'

import hash from 'object-hash'

let debug = require('debug')('json-business-rules')

class Fact {
  constructor (id, options, calculationMethod) {
    this.id = id
    let defaultOptions = { cache: true }
    if (typeof options === 'function') {
      calculationMethod = options
      options = defaultOptions
    } else if (typeof options === 'undefined') {
      options = defaultOptions
    }
    this.options = options
    this.calculate = calculationMethod
    this.cacheKeyMethod = this.defaultCacheKeys
  }

  // todo, rename 'calculate', 'definition'
  definition (calculate, initialValue = undefined) {
    this.calculate = calculate
    this.value = initialValue
  }

  static hashFromObject (obj) {
    debug(`fact::hashFromObject generating cache key from:`, obj)
    return hash(obj)
  }

  defaultCacheKeys (id, params) {
    return { params, id }
  }

  getCacheKey (params) {
    if (this.options.cache === true) {
      let cacheProperties = this.cacheKeyMethod(this.id, params)
      return Fact.hashFromObject(cacheProperties)
    }
  }
}

export default Fact
