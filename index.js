const hostname = '192.168.5.205';
const port = 8000;
const express = require('express')
const app = express()
const firstController = require('./Controllers/UsersController')
const auth = require('./middlewares/auth')
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
    res.send('Hello Sir')
})

app.get('/getUsersList', auth.verifyAuthToken,firstController.getAllUsers)
app.post('/createUser', firstController.createUser)
app.post('/userLogin', firstController.userLogin)
app.post('/deleteUser', firstController.deleteUser)

app.get('/', function(req, res) {
  res.send('Hello Sir')
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});