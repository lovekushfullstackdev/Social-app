var mysql = require('mysql2');

var conn = mysql.createConnection({
  host: "localhost",
  user: "kbs",
  password: "Google@123",
  database:'socialMedia'
});

conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports=conn