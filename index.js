const hostname = '192.168.5.205';
const port = 8000;
const express = require('express')
const app = express()
const firstController = require('./Controllers/UsersController')
const auth = require('./middlewares/auth')
const bodyParser = require("body-parser");

const http = require('http');
var fileupload=  require('express-fileupload');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileupload());

app.get('/', function(req, res) {
    res.send('Hello Sir')
})

app.get('/getUsersList', auth.verifyAuthToken,firstController.getAllUsers)
app.post('/createUser', firstController.createUser)
app.post('/userLogin', firstController.userLogin)
app.post('/deleteUser', firstController.deleteUser)
app.post('/updateProfile',auth.verifyAuthToken,firstController.updateProfile)
app.post('/upload_post',auth.verifyAuthToken,firstController.upload_post);
app.get('/get_user_profile',auth.verifyAuthToken,firstController.get_user_profile);
app.get('/get_user_posts',auth.verifyAuthToken,firstController.get_user_posts);
app.get('/get_all_posts',auth.verifyAuthToken,firstController.get_all_posts);
app.post('/delete_post',auth.verifyAuthToken,firstController.delete_post)

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});