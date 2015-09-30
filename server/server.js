var path = require('path');

var express = require('express');
// middleware
var morgan = require('morgan');
var parser = require('body-parser');
var jwt = require('jsonwebtoken');

var secret = require('./secret');
var router = require('./routes');
var db = require('./database/interface');

var app = express();

// logging and parsing
app.use(morgan('dev'));
app.use(parser.json());
app.set('secret', secret); //set secret variable (we can come up with a better secret and store it in a different file)

//verify token
router.use(function(req, res, next) {
  //check post parameters or header or url parameters for token
  var token = req.body.token || req.headers['x-access-token'] || req.query.token;

  //decode token
  if (token) {
    //verify secret and check expression 
    jwt.verify(token, app.get('secret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.'});
      } else {
        //if token is verified sucessfully, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {

    //if there is no token, return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

// Mount router for api
app.use('/api/users', router);

var port = process.env.PORT || 8080;

// serve static files
app.use(express.static(path.resolve(__dirname, '..', 'client')));

db.init().then(function() {

  app.listen(port, function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log('listening on port: ', port);
    }
  });

});

// console.log(router.stack);

module.exports = app;
