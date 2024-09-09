const express = require('express');
const app = express();
const multer = require('multer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 

app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/newproductdb', {})
    .then(() => {
        console.log('MongoDB connected successfully to newproductdb');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Product Schema with image field
const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    rating: String,
    image: String 
});

const Product = mongoose.model('Product', productSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Ensure the 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Generate unique filenames
    }
});

const upload = multer({ storage: storage });

// POST: Add new product with image upload
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, price, rating } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`; 

        const newProduct = new Product({
            name,
            price,
            rating,
            image: imageUrl  
        });

        const result = await newProduct.save();
        res.status(201).json(result);  
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// GET: Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); 
        res.status(200).json(products);  
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
