require('dotenv').config({silent: true})

var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))


app.get('/', function(request, response) {
  response.send('<i>I am alive</i>')
})

module.exports = app
