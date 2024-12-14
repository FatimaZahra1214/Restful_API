const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
const cors = require('cors');

app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/tester')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    gender: String
});

const User = mongoose.model('recipes', userSchema);




// middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req,res,next) =>{
    if(req.query.isAdmin){
        next();
    }else{
        res.status(401).json({status: 'error', message: 'Unauthorized'});
    }
}
)

// routes
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json({ status: 'success', data: users }); // Send users in JSON format
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});
app.get('/user', async (req, res) => {
    try {
        const users = await User.find();
        const html = `
        <ul>
            ${users.map(user => `<li>${user.first_name} ${user.last_name} - ${user.email}</li>`).join('')}
        </ul>
        `;
        res.send(html);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app
    .route("/api/user/:id")
    .get(async (req, res) => {
        try {
            const userId = Number(req.params.id);
            console.log(`Searching for user with id: ${userId}`);
            const user = await User.findOne({ id: userId });
            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }
            res.json(user);
        } catch (err) {
            res.status(500).json({ status: 'error', message: err.message });
        }
    })
    .patch(async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }
            res.json({ status: 'success', data: user });
        } catch (err) {
            res.status(500).json({ status: 'error', message: err.message });
        }
    })
    .delete(async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }
            res.json({ status: 'success', message: 'User deleted successfully' });
        } catch (err) {
            res.status(500).json({ status: 'error', message: err.message });
        }
    });

// Create new user
app.post('/api/user', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ status: 'success', data: newUser });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Search endpoint with pagination
app.get('/search', async (req, res) => {
    try {
        const { query = '', page = 1, limit = 10 } = req.query;
        
        const searchQuery = {
            $or: [
                { first_name: { $regex: query, $options: 'i' } },
                { last_name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        const total = await User.countDocuments(searchQuery);
        const users = await User.find(searchQuery)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            status: 'success',
            total,
            page: Number(page),
            limit: Number(limit),
            data: users
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

