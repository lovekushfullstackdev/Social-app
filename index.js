
// const express = require('express');
// const app = express();
// const http = require("http");
// const { Server } = require('socket.io');

// const cors = require('cors')
// app.use(cors());

// const server = http.createServer(app)

// const io=new Server(server,{
//   cors:{
//     origin:"http://localhost:3000",
//     methods: ["GET","POST"],
//   }
// })

// io.on("connection",(socket)=>{
//   console.log("User connected.",socket.id);
//   socket.on("chat_message",(data)=>{
//     console.log("data",data);
//     socket.emit("send_message",data)
//   })
// })

// server.listen(3001, () => {
//   console.log('Server listening on http://localhost:3001');
// });

const hostname = '192.168.5.205';
const port = 8000;
const express = require('express')
const app = express()
const firstController = require('./Controllers/UsersController')
const auth = require('./middlewares/auth')
const bodyParser = require("body-parser");
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);

var cors = require('cors')

var fileupload=  require('express-fileupload');
app.use(cors())

const io=new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    methods: ["GET","POST"],
  }
})

// server.use(cors())

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
app.post('/delete_post',auth.verifyAuthToken,firstController.delete_post);
app.post('/create-payment-intent',firstController.createPaymentIntent);
app.post('/post-like',auth.verifyAuthToken,firstController.post_like);
app.post('/post-comment',auth.verifyAuthToken,firstController.post_comment);
app.get('/get-post-comments/:post_id',auth.verifyAuthToken,firstController.get_post_comments);
app.delete('/delete-post-comments/:id',auth.verifyAuthToken,firstController.delete_post_comments);


io.on("connection",async(socket)=>{
  console.log("User connected.",socket.id);
  
  socket.on("join_room",(data)=>{
    console.log('A user has joined room ' + data.room_id);
    socket.join(data.room_id)
  })

  socket.on("receive_msg",(data)=>{
    console.log("msg",data.msg);
    socket.to(data.room_id).emit("send_msg",data.msg)
  })

  socket.on("chat_message",(data)=>{
    console.log("data",data);
    socket.broadcast.emit("send_message",data)
  })

})



// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

server.listen(port,hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});