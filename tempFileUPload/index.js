const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/image-uploader', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema and model for storing images
const imageSchema = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Image = mongoose.model('Image', imageSchema);

// Multer setup to handle file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.get('/', (req, res) => {
  res.send(`
    <h2>Upload Image to MongoDB</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Route to upload an image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const newImage = new Image({
      name: req.file.originalname,
      img: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await newImage.save();
    res.send('Image uploaded successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading image');
  }
});

// Route to get and view the image
app.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).send('Image not found');
    }

    res.contentType(image.img.contentType);
    res.send(image.img.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
