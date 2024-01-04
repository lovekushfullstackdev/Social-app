const firstController = require("./../Controllers/UsersController");
const auth = require('./../middlewares/auth')
const express = require('express')
const app = express()

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
app.post('/create-group',auth.verifyAuthToken,firstController.createGroup)
app.get('/get-group-list',auth.verifyAuthToken,firstController.get_group_list);


  module.exports=app;