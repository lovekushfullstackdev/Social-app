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
const { v4: uuidv4 } = require('uuid');

const conn=require("./config/Config")

var cors = require('cors')

var fileupload=  require('express-fileupload');
app.use(cors())

const io=new Server(server,{
  cors:{
    origin:"http://192.168.5.205:3000",
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
app.get('/get-messages/:receiver_id',auth.verifyAuthToken,firstController.get_messages);
app.post('/logout-user',auth.verifyAuthToken,firstController.logout_user);
app.get('/get-all-users',auth.verifyAuthToken,firstController.allUsers); // Add users in group
// app.get('/get-group-users-',auth.verifyAuthToken,firstController.allUsers); // Add users in group
app.post('/create-group',auth.verifyAuthToken,firstController.createGroup)


io.on("connection",async(socket)=>{
  
  socket.on("join_room",(data)=>{
    socket.join(data.room_id)

    let to_user_id=data.to_user_id;
    let user_id=data.user_id;
    getMeesages(user_id,to_user_id,(callbacks)=>{
      io.to(data.room_id).emit("get_messages",callbacks)
    })
  })

  socket.on("send_msg",(data)=>{
    let to_user_id = data.to_user_id;
    let user_id = data.user_id;
    let current_date = new Date();
    let isFile = data.isFile;
    let message={};
    if(isFile && data.msg){
      message=[{
        message_id: uuidv4(),
        content: "",
        receiver_id: to_user_id,
        sender_id: user_id,
        file: data.file,
        timestamp: current_date
      },{
        message_id:uuidv4(),
        content: data.msg,
        receiver_id: to_user_id,
        sender_id: user_id,
        file:"",
        timestamp: current_date
      }]

    }else if(isFile){
      message=[{
        content: data.msg,
        message_id: uuidv4(),
        receiver_id: to_user_id,
        sender_id: user_id,
        file: data.file,
        timestamp: current_date
      }]
    }
    else{
     message=[{
        content: data.msg,
        message_id:uuidv4(),
        receiver_id: to_user_id,
        sender_id: user_id,
        timestamp: current_date
      }]
    }
   
    io.to(data.room_id).emit("receive_msg",{message:message,room_id:data.room_id})

    newMessage(message, (error, results) => {
      if (error) {
        // console.error('Error:', error);
      } else {
        // console.log('Results:', results);
      }
    });
    
  })

})

const getMeesages=(user_id,to_user_id,callbacks)=>{
  try{
    conn.query("select * from messages where sender_id=? and receiver_id=? or receiver_id=? and sender_id=? order by timestamp",[user_id,to_user_id,user_id,to_user_id],(err,rows)=>{
        if(err){
          callbacks(err);
        }else{
          callbacks(rows);
        }
    })
}catch(error){

}
}

const newMessage = async (newMessages, callback) => {
  try {
    const insertPromises = newMessages.map((msg) => {
      return new Promise((resolve, reject) => {
        conn.query('INSERT INTO messages SET ?', msg, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });

    // Wait for all insert queries to complete
    const results = await Promise.all(insertPromises);

    // Callback with the results
    callback(null, results);
  } catch (error) {
    console.error('Error in newMessage:', error);
    callback(error, null);
  }
};

// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

server.listen(port,hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});