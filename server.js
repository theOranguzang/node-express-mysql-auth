'use strict';

var port = process.env.PORT || 3000;
var app = require('./app/index');

app.listen(port, (err) => {
  if (err) throw err;
  console.log('Server is listening on ' + port + '...');
});

