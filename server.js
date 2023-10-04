const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const srtToVtt = require('srt-to-vtt');

const app = express();
const port = 3000; // You can change this to the desired port number

// Set the storage for multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/dist'); // Upload files to the 'public/dist' folder
  },
  filename: function (req, file, cb) {
    // Use specific filenames for the uploaded files
    if (file.fieldname === 'mp4File') {
      cb(null, 'video.mp4');
    } else if (file.fieldname === 'subtitleFile') {
      cb(null, 'subtitle.srt');
    } else {
      cb(new Error('Invalid fieldname'));
    }
  }
});
const upload = multer({ storage: storage });

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle the GET request for the main HTML page
app.post('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file uploads for MP4 files
app.post('/uploadMP4', upload.single('mp4File'), (req, res) => {
  res.redirect('/');
});

// Handle file uploads for VTT files
app.post('/uploadSUB', upload.single('subtitleFile'), (req, res) => {
  const filePath = path.join(__dirname, 'public', 'dist', 'subtitle.srt');

  // Check if the uploaded file is an SRT file
  if (req.file && path.extname(req.file.originalname).toLowerCase() === '.srt') {
    const vttFilePath = path.join(__dirname, 'public', 'dist', 'subtitle.vtt');

    // Convert SRT to VTT using the "srt-to-vtt" package
    fs.createReadStream(filePath)
      .pipe(srtToVtt())
      .pipe(fs.createWriteStream(vttFilePath))
      .on('finish', () => {
        // Delete the original SRT file after conversion
        fs.unlinkSync(filePath);
        res.redirect('/');
      });
  } else {
    // If the file is already in VTT format or not an SRT file, proceed as usual
    res.redirect('/');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
