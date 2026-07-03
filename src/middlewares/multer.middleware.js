import multer from "multer";

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb is a callback function that tells multer where to store the uploaded files
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

export default upload;
