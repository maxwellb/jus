'use strict'

const fs              = require('fs')
const path            = require('path')
const walkdir         = require('walkdir')
const Cache           = require('./cache')
const patterns        = require('./patterns')
const associate       = require('./associate')
const primitives      = require('require-dir')('./files')

module.exports = function jus (baseDir, cb) {
  const cache = Cache.new(baseDir)
  const emitter = walkdir(baseDir)
  var areWeDoneInterval
  var files = []

  function areWeDone() {
    if (files.every(file => file.isDone)) {
      clearInterval(areWeDoneInterval)
      associate(files)
      cache.write(files)
      cb(null, files)
    }
  }

  emitter.on('file', function (filepath, stat) {
    if (filepath.match(patterns.blacklist)) return

    Object.keys(primitives).forEach(function(name){
      if (filepath.match(patterns[name])) {
        files.push(new primitives[name](filepath, baseDir, cache))
      }
    })
  })

  emitter.on('end', function () {
    areWeDoneInterval = setInterval(areWeDone, 10)
  })
}