const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/fests");
  },
  filename: (req, file, cb) => {
    cb(null, 'fest_' + Math.floor(Math.random() * Date.now()) + path.extname(file.originalname));
  }
})
exports.uploadFest = multer({
  storage: storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only");
  }
}).single("festImage");
exports.createFest = async (req, res) => {
  try {
    const { festName,festDetail,festState,festCost,userId,festImage,festNumDay } = req.body; 
    const result = await prisma.fest_tb.create({
      data: {
        festName: festName,
        festDetail: festDetail,
        festState: festState,
        festCost: parseFloat(festCost),
        userId:parseInt(userId),
        festNumDay:parseInt(festNumDay),
        festImage:req.file ? req.file.path.replace("images\\fests\\", '') : "",
      }
    })

    res.status(201).json({
      message: "Data inputted successfully!",
      data: result
    })
  } catch (err) {
    res.status(500).json({
      message: `We ran into a problem: ${err}`
    })
    console.log('Error', err);
  }
}