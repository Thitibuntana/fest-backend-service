const express = require('express');
const usercontroller = require('../controllers/user.controller');

const route = express.Router();

route.post('/', usercontroller.uploadUser,usercontroller.createUser);
route.get("/:userName/:userPassword", usercontroller.checklogin);

module.exports = route