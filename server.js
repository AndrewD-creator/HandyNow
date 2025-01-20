const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const stripe = require('stripe')('sk_test_51QWg2AFz5vaiQFyZMYgiCpoZLJxsIWiyPor0FTmkcVmE0l9CUEygXpv7nKefiRu1k6GQKMyHD061uSN1tFJ9H50z00Os6Ehbf9'); 


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

  const { county, skill } = req.query;

  if (!county || !skill) {
    return res.status(400).json({ error: 'Please provide both a county and a skill to search.' });
  }

  const sql = `
    SELECT 
      u.id, 
      u.fullname, 
      u.skills, 
      u.county, 
      u.bio,
      COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
    FROM 
      users u
    LEFT JOIN 
      reviews r 
    ON 
      u.id = r.handyman_id
    WHERE 
      u.role = ? 
      AND u.county = ? 
      AND FIND_IN_SET(?, u.skills)
    GROUP BY 
      u.id, u.fullname, u.skills, u.county, u.bio;
  `;

  db.query(sql, ['handyman', county, skill], (err, results) => {
    if (err) {
      console.error('Error fetching handymen:', err.message);
      return res.status(500).json({ error: 'Failed to fetch handymen.' });
    }

    console.log('Raw query results:', results);

    if (results.length === 0) {
      return res.status(404).json({ error: 'No handymen found for this skill in the area.' });
    }

    const handymen = results.map((handyman) => ({
      ...handyman,
      skills: handyman.skills ? handyman.skills.split(',') : [],
    }));

    console.log('Processed handymen:', handymen);
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

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.get('/bookings/user/:id', (req, res) => {
  const userId = req.params.id;
  const filter = req.query.filter; // Extract the filter query parameter

  let filterCondition = '';

  // Determine the filter condition based on the query parameter
  switch (filter) {
    case 'active':
      // Active bookings: status is 'pending' or 'confirmed' and date is today or in the future
      filterCondition = `AND (status = 'pending' OR status = 'confirmed' OR status = 'awaiting_confirmation') AND date >= CURDATE()`;
      break;
    case 'past':
      // Past bookings: status is 'completed', 'cancelled', or date is in the past
      filterCondition = `AND (status = 'completed' OR status = 'cancelled' OR date < CURDATE())`;
      break;
    case 'all':
    default:
      // All bookings: no additional condition
      filterCondition = '';
      break;
  }

  const sql = `
    SELECT 
      bookings.id, 
      bookings.date, 
      bookings.description, 
      bookings.status,
      bookings.handyman_id,
      users.fullname AS handymanName
    FROM bookings
    JOIN users ON bookings.handyman_id = users.id
    WHERE bookings.user_id = ?
    ${filterCondition}
    ORDER BY bookings.date DESC;
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user bookings:', err);
      return res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
    res.status(200).json({ bookings: results });
  });
});


app.patch('/bookings/cancel/:id', (req, res) => {
  const bookingId = req.params.id;

  const sql = `UPDATE bookings SET status = 'cancelled' WHERE id = ?`;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error('Error canceling booking:', err);
      return res.status(500).json({ error: 'Failed to cancel booking.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully.' });
  });
});

// Fetch pending job requests for a handyman
app.get("/bookings/requests/:handymanId", (req, res) => {
  const handymanId = req.params.handymanId;

  console.log("Fetching job requests for handymanId:", handymanId); // Log the handymanId

  const jobRequestsQuery = `
    SELECT 
      b.id, 
      b.description, 
      b.date, 
      u.name AS customerName 
    FROM 
      bookings b
    JOIN 
      users u 
    ON 
      b.user_id = u.id
    WHERE 
      b.handyman_id = ? 
    AND 
      b.status = "pending";
  `;

  console.log("Executing query:", jobRequestsQuery); // Log the query

  db.query(jobRequestsQuery, [handymanId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err); // Log the specific error
      return res.status(500).json({ error: "Failed to fetch job requests." });
    }

    console.log("Query results:", results); // Log the query results
    res.json({ requests: results });
  });
});




// Endpoint to update booking status from job requests
app.patch('/bookings/respond/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body; // Accept or Decline

  try {
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    res.status(200).json({ message: `Booking ${status} successfully.` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

app.get('/bookings/my-jobs/:handymanId', async (req, res) => {
  const handymanId = req.params.handymanId;

  console.log("Fetching jobs for handymanId:", handymanId); // Log the handymanId

  const jobs = `
    SELECT 
      b.id, 
      b.description, 
      b.date, 
      u.name AS customerName 
    FROM 
      bookings b
    JOIN 
      users u 
    ON 
      b.user_id = u.id
    WHERE 
      b.handyman_id = ? 
    AND 
      b.status = "confirmed";
  `;

  console.log("Executing query:", jobs); // Log the query

  db.query(jobs, [handymanId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err); // Log the specific error
      return res.status(500).json({ error: "Failed to fetch jobs." });
    }

    console.log("Query results:", results); // Log the query results
    res.json({ jobs: results });
  });
});

app.patch('/bookings/mark-complete/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    // Update the booking status in the database
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['awaiting_confirmation', bookingId]);
    res.status(200).json({ message: 'Booking marked as awaiting customer confirmation.' });
  } catch (error) {
    console.error('Error marking booking as awaiting confirmation:', error);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

app.patch('/bookings/complete/:id', (req, res) => {
  const bookingId = req.params.id;

  const sql = `
    UPDATE bookings 
    SET status = 'completed'
    WHERE id = ? AND status = 'awaiting_confirmation';
  `;

  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      console.error('Error marking booking as complete:', err);
      return res.status(500).json({ error: 'Failed to update booking status.' });
    }

    if (results.affectedRows === 0) {
      return res.status(400).json({ error: 'Invalid booking ID or status is not awaiting confirmation.' });
    }

    res.status(200).json({ message: 'Booking marked as complete.' });
  });
});

app.post('/reviews', async (req, res) => {
  const { booking_id, handyman_id, user_id, rating, comment } = req.body;

  if (!booking_id || !handyman_id || !user_id || !rating) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '); 

    const result = await db.query(
      'INSERT INTO reviews (booking_id, handyman_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [booking_id, handyman_id, user_id, rating, comment || null, createdAt]
    );

    console.log('Database response:', result);

    res.status(201).json({ 
      message: 'Review submitted successfully.',
      reviewId: result.insertId || result[0]?.insertId  
    });

  } catch (error) {
    console.error('Error submitting review:', error.message);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});




app.get('/reviews/handyman/:handyman_id', async (req, res) => {
  const { handyman_id } = req.params;

  try {
    const [reviews] = await db.query(
      'SELECT r.rating, r.comment, u.fullname AS customerName, r.created_at FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.handyman_id = ?',
      [handyman_id]
    );

    if (reviews.length > 0) {
      res.status(200).json({ reviews });
    } else {
      res.status(404).json({ message: 'No reviews found for this handyman.' });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//References:
// OpenAI - ChatGPT