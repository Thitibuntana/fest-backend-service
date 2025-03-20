const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/users");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "user_" +
        Math.floor(Math.random() * Date.now()) +
        path.extname(file.originalname)
    );
  },
});
exports.uploadUser = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only");
  },
}).single("userImage");

exports.createUser = async (req, res) => {
  try {
    const { userFullname, userName, userPassword } = req.body;
    const result = await prisma.user_tb.create({
      data: {
        userFullname: userFullname,
        userName: userName,
        userPassword: userPassword,
        userImage: req.file ? req.file.path.replace("images\\users\\", "") : "",
      },
    });

    res.status(201).json({
      message: "Data inputted successfully!",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      message: `We ran into a problem: ${err}`,
    });
    console.log("Error", err);
  }
};

exports.checkLogin = async (req, res) => {
  try {
    const result = await prisma.user_tb.findFirst({
      where: {
        userName: req.params.userName,
        userPassword: req.params.userPassword,
      },
    });

    if (result) {
      res.status(200).json({
        message: "Login successfully!",
        data: result,
      });
    } else {
      res.status(400).json({
        message: "Username or password is incorrect.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `We ran into a problem: ${err}`,
    });
    console.log("Error", err);
  }
};

exports.updateUser = async (req, res) => {
  try {
    let result = {};
    if (req.file) {
      const userResult = await prisma.user_tb.findFirst({
        where: {
          userId: parseInt(req.params.userId),
        },
      });
      if (userResult.userImage) {
        fs.unlinkSync(path.join("images/users", userResult.userImage));
      }
      result = await prisma.user_tb.update({
        where: {
          userId: parseInt(req.params.userId),
        },
        data: {
          userFullname: req.body.userFullname,
          userName: req.body.userName,
          userPassword: req.body.userPassword,
          userImage: req.file
            ? req.file.path.replace("images\\users\\", "")
            : "",
        },
      });
    } else {
      result = await prisma.user_tb.update({
        where: {
          userId: parseInt(req.params.userId),
        },
        data: {
          userFullname: req.body.userFullname,
          userName: req.body.userName,
          userPassword: req.body.userPassword,
          userImage: req.file
            ? req.file.path.replace("images\\users\\", "")
            : "",
        },
      });
    }
    res.status(200).json({
      message: "Updated successfully.",
      info: result,
    });
  } catch (err) {
    res.status(500).json({
      message: `We ran into a problem: ${err}`,
    });
    console.log("Error", err);
  }
};
