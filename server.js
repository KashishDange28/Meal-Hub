const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MySQL database
const db = mysql.createConnection({
    host: 'localhost', // Change if using a remote DB
    user: 'root',      // Your MySQL username
    password: '',      // Your MySQL password
    database: 'mealhub' // The database you created
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Register a new user
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
    db.query(sql, [email, username, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error registering user');
        }
        res.status(201).send('User registered successfully!');
    });
});

// Login a user
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error during login');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        // Compare hashed password
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        res.status(200).send('Login successful!');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
