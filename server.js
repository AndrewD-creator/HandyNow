const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// (ChatGPT) - Prompt: I want to be able to add users who register into my connected database
app.use(bodyParser.json());

// Endpoint to register users (both regular users and handymen)
app.post('/users', (req, res) => {
  console.log('Received registration request:', req.body);

  const { name, fullname, email, phone, password, address, eircode, county, role } = req.body;

  if (role === 'user') {
    console.log('Customer registration request:', { name, email, password, role });

    if (!name || !email || !password || !role) {
      console.error('Missing fields for customer registration:', { name, email, password, role });
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, password, role], (err, result) => {
      if (err) {
        console.error('Database error during customer registration:', err.message);
        return res.status(500).json({ error: 'Failed to add user' });
      }
      console.log('Customer registered successfully with ID:', result.insertId);
      res.status(201).json({ id: result.insertId });
    });
  } else if (role === 'handyman') {
    console.log('Handyman registration request:', { name, fullname, email, phone, password, address, eircode, county, role });

    if (!name || !fullname || !email || !phone || !password || !address || !eircode || !county || !role) {
      console.error('Missing fields for handyman registration:', { name, fullname, email, phone, password, address, eircode, county, role });
      return res.status(400).json({ error: 'Please fill in all fields for handyman registration' });
    }

    const sql = 'INSERT INTO users (name, fullname, email, phone, password, address, eircode, county, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, fullname, email, phone, password, address, eircode, county, role], (err, result) => {
      if (err) {
        console.error('Database error during handyman registration:', err.message);
        return res.status(500).json({ error: 'Failed to add handyman' });
      }
      console.log('Handyman registered successfully with ID:', result.insertId);
      res.status(201).json({ id: result.insertId });
    });
  } else {
    console.error('Invalid role provided:', role);
    return res.status(400).json({ error: 'Invalid role' });
  }
});

// (ChatGPT) - Prompt: I want to be able to sign in, but only should work if the name and password are in my database
app.post('/login', (req, res) => {
  const { name, password } = req.body;

  console.log('Received login request:', name, password); 

  const sql = 'SELECT * FROM users WHERE name = ? AND password = ?';
  db.query(sql, [name, password], (err, result) => {
    if (err) {
      console.error('Database error:', err); 
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('Query result:', result); // Log the result

    // If user is found
    if (result.length > 0) {
      const user = result[0];
      console.log('Fetched user:', user); // Log the fetched user

      if (user.role === 'handyman') {
        return res.status(200).json({ message: 'Login successful', id: user.id, role: 'handyman', fullname: user.fullname });
      } else {
        return res.status(200).json({ message: 'Login successful', id: user.id, role: 'user', fullname: user.fullname });
      }
    } else {
      console.log('Invalid credentials for user:', name); 
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

// Endpoint to update a user's profile (OpenAI)
app.put('/users/:id/profile', (req, res) => {
  const { id } = req.params; // User ID
  const { bio, skills } = req.body; // Bio and skills from the request

  console.log('Updating profile for user:', id, 'with bio:', bio, 'and skills:', skills);

  const sql = 'UPDATE users SET bio = ?, skills = ? WHERE id = ?';
  db.query(sql, [bio, skills.join(','), id], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err.message);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

// Endpoint to fetch a user's profile (OpenAI)
app.get('/users/:id/profile', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT bio, skills FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching profile:', err.message);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (result.length > 0) {
      const userProfile = result[0];
      res.status(200).json({
        bio: userProfile.bio || '',
        skills: userProfile.skills ? userProfile.skills.split(',') : [],
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// (OpenAI)
app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT name, email FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching user profile:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result[0]);
  });
});

//(OpenAI)
app.get('/search-handymen', (req, res) => {
  console.log('Search handymen route hit');

  const { county } = req.query;

  if (!county) {
    return res.status(400).json({ error: 'Please provide a county to search.' });
  }

  const sql = 'SELECT id, fullname, skills, county, bio FROM users WHERE role = ? AND county = ?';
  db.query(sql, ['handyman', county], (err, results) => {
    if (err) {
      console.error('Error fetching handymen:', err.message);
      return res.status(500).json({ error: 'Failed to fetch handymen.' });
    }

    console.log('Raw query results:', results); // Log raw query results

    if (results.length === 0) {
      return res.status(404).json({ error: 'No handymen found in this area.' });
    }

    const handymen = results.map((handyman) => ({
      ...handyman,
      skills: handyman.skills ? handyman.skills.split(',') : [],
    }));

    console.log('Processed handymen:', handymen); // Log processed handymen
    res.status(200).json({ handymen });
  });
});

//(OpenAI)
app.post('/bookings', (req, res) => {
  const { handymanId, userId, date, description } = req.body;

  if (!handymanId || !userId || !date || !description) {
    return res.status(400).json({ error: 'Please provide all required fields: handymanId, userId, date, and description.' });
  }

  const formattedDate = date.split('T')[0]; // Extract 'YYYY-MM-DD' from 'YYYY-MM-DDTHH:mm:ss'

  const sql = 'INSERT INTO bookings (handyman_id, user_id, date, description) VALUES (?, ?, ?, ?)';
  db.query(sql, [handymanId, userId, formattedDate, description], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err.message);
      return res.status(500).json({ error: 'Failed to create booking.' });
    }
    res.status(201).json({ message: 'Booking created successfully!', bookingId: result.insertId });
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//References:
// OpenAI - ChatGPT