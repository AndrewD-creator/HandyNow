const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const stripe = require('stripe')('sk_test_51QWg2AFz5vaiQFyZMYgiCpoZLJxsIWiyPor0FTmkcVmE0l9CUEygXpv7nKefiRu1k6GQKMyHD061uSN1tFJ9H50z00Os6Ehbf9'); 
const moment = require('moment-timezone');
const { Expo } = require("expo-server-sdk");




const app = express();
const expo = new Expo();

const PORT = process.env.PORT || 3000;

// (ChatGPT) - Prompt: I want to be able to add users who register into my connected database
app.use(bodyParser.json());

// Endpoint to register users (both regular users and handymen)
app.post('/users', (req, res) => {
  console.log('Received registration request:', req.body);

  const { name, fullname, email, phone, password, address, eircode, county, role } = req.body;

  if (role === 'user') {
    console.log('Customer registration request:', { name, email, password, address, eircode, county, role });
  
    if (!name || !email || !password || !address || !eircode || !county || !role) {
      console.error('Missing fields for customer registration:', { name, email, password, address, eircode, county, role });
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }
  
    const sql = 'INSERT INTO users (name, email, password, address, eircode, county, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, password, address, eircode, county, role], (err, result) => {
      if (err) {
        console.error('Database error during customer registration:', err.message);
        return res.status(500).json({ error: 'Failed to add user' });
      }
      console.log('Customer registered successfully with ID:', result.insertId);
      res.status(201).json({ id: result.insertId });
    });
  }
  else if (role === 'handyman') {
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

// ✅ Endpoint to update a user's profile (bio, skills, hourly rate)
app.put('/users/:id/profile', (req, res) => {
  const { id } = req.params;
  let { bio, skills, hourly_rate } = req.body;

  console.log('Updating profile for user:', id, { bio, skills, hourly_rate });

  // ✅ Ensure hourly_rate is a valid number
  if (!hourly_rate || isNaN(hourly_rate) || hourly_rate < 0) {
    return res.status(400).json({ error: 'Invalid hourly rate. Must be a positive number.' });
  }

  const sql = 'UPDATE users SET bio = ?, skills = ?, hourly_rate = ? WHERE id = ?';
  db.query(sql, [bio || '', skills.join(','), parseFloat(hourly_rate), id], (err, result) => {
    if (err) {
      console.error('❌ Error updating profile:', err.message);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    console.log('✅ Profile updated successfully for user:', id);
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

// ✅ Endpoint to fetch user profile details (bio, skills, hourly rate)
app.get('/users/:id/profile', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT bio, skills, COALESCE(hourly_rate, 0) AS hourly_rate FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error fetching profile:', err.message);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (result.length > 0) {
      const userProfile = result[0];

      res.status(200).json({
        bio: userProfile.bio || '',
        skills: userProfile.skills ? userProfile.skills.split(',') : [],
        hourly_rate: parseFloat(userProfile.hourly_rate), // ✅ Ensure numeric value
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

// (ChatGPT) - Prompt: "How can I implement an API to search for handymen based on location and skill using SQL and Express?"
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
      u.hourly_rate,
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
      u.id, u.fullname, u.skills, u.county, u.bio, u.hourly_rate;
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

const getPushTokensForHandyman = async (handymanId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT push_token FROM push_tokens WHERE user_id = ?",
      [handymanId],
      (err, results) => {
        if (err) {
          console.error("❌ Error fetching push tokens:", err);
          return reject(err);
        }

        const tokens = results.map((row) => row.push_token);
        resolve(tokens);
      }
    );
  });
};

// (ChatGPT) - Prompt: "How do I create an API endpoint to insert bookings into a MySQL database using Node.js and Express?"


app.post('/bookings', async (req, res) => {
  const { handymanId, userId, date, startTime, endTime, duration, description } = req.body;

  console.log("📌 Received Booking Request:", req.body);

  if (!handymanId || !userId || !date || !startTime || !endTime || !duration || !description) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const formattedDate = date.split('T')[0]; 

    // 🔹 Insert booking into the database
    const sql = `
      INSERT INTO bookings (handyman_id, user_id, date, start_time, end_time, duration, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const result = await db.query(sql, [handymanId, userId, formattedDate, startTime, endTime, duration, description]);

    console.log("✅ Booking Inserted, ID:", result.insertId);

    if (!result.insertId) {
      return res.status(500).json({ error: "Failed to insert booking." });
    }

    // 🔹 Fetch handyman's hourly rate
    const [handyman] = await db.query(`SELECT hourly_rate FROM users WHERE id = ?`, [handymanId]);
    const hourlyRate = handyman[0]?.hourly_rate || 50; // Default 50 if not set

    // 🔹 Calculate price (hourly rate * hours)
    const price = hourlyRate * (duration / 60);

    // 🔹 Send push notification to handyman
    const pushTokens = await getPushTokensForHandyman(handymanId);

    if (pushTokens.length > 0) {
      const messages = pushTokens
        .filter(token => Expo.isExpoPushToken(token))
        .map(token => ({
          to: token,
          sound: "default",
          title: "New Booking 🚀",
          body: `You have a new booking request! Check your app for more details.`,
          data: { bookingId: result.insertId },
        }));

      await expo.sendPushNotificationsAsync(messages);
      console.log("📩 Notifications sent to handyman!");
    }

    return res.status(201).json({
      message: "Booking confirmed!",
      bookingId: result.insertId,
      handyman_id: handymanId,
      duration,
      price,
    });

  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return res.status(500).json({ error: "Failed to create booking." });
  }
});



// (ChatGPT) - Prompt: "How to integrate Stripe payment processing into an Express.js application?"
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Missing payment details." });
    }

    // ✅ Step 1: Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,  // Convert to cents
      currency,
      payment_method_types: ['card'],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('❌ Error creating PaymentIntent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/calculate-price', async (req, res) => {
  const { handymanId, duration } = req.query;

  if (!handymanId || !duration) {
      return res.status(400).json({ error: "Handyman ID and duration are required." });
  }

  try {
      console.log(`🔍 Fetching price for Handyman ID: ${handymanId}, Duration: ${duration}`);

      // ✅ Fetch hourly rate from database
      const [handyman] = await db.query("SELECT hourly_rate FROM users WHERE id = ?", [handymanId]);

      if (!handyman || handyman.length === 0) {
          return res.status(404).json({ error: "Handyman not found." });
      }

      const hourlyRate = parseFloat(handyman.hourly_rate);
      if (isNaN(hourlyRate)) {
          return res.status(500).json({ error: "Invalid hourly rate." });
      }

      // ✅ Correct price calculation
      const totalPrice = hourlyRate * (parseFloat(duration) / 60); // Convert minutes to hours

      console.log(`✅ Price calculated: €${totalPrice} for ${duration} minutes`);
      res.status(200).json({ price: totalPrice });

  } catch (error) {
      console.error("❌ Error fetching price:", error);
      res.status(500).json({ error: "Failed to calculate price." });
  }
});




// (ChatGPT) - Prompt: "How do I fetch user bookings from a MySQL database with filtering (active, past, all) using Express?"
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

// (ChatGPT) - Prompt: "How can I implement an API endpoint to cancel a booking in an Express app and MySQL database?"
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

// (ChatGPT) - Prompt: "How to create an endpoint that fetches pending job requests for a specific handyman?"
app.get("/bookings/requests/:handymanId", (req, res) => {
  const handymanId = req.params.handymanId;

  console.log("Fetching job requests for handymanId:", handymanId); // Log the handymanId

  const jobRequestsQuery = `
    SELECT 
      b.id, 
      b.description, 
      b.date, 
      u.name AS customerName,
      u.county,
      u.address,
      u.eircode
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




// (ChatGPT) - Prompt: "How to update booking status from job requests
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

  console.log("Fetching jobs for handymanId:", handymanId);

  const jobs = `
    SELECT 
      b.id, 
      b.description, 
      b.date, 
      b.start_time,  -- ✅ Add start time
      b.end_time,    -- ✅ Add end time
      u.name AS customerName,
       u.county,
      u.address,
      u.eircode
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

  console.log("Executing query:", jobs);

  db.query(jobs, [handymanId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Failed to fetch jobs." });
    }

    console.log("Query results:", results);
    res.json({ jobs: results });
  });
});


// (ChatGPT) - Prompt: "How do I implement an API endpoint to mark a job as completed and update its status in MySQL?"
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

// (ChatGPT) - Prompt: "How do I confirm job completion by a customer"
app.patch('/bookings/complete/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    // ✅ 1. Update booking status to 'completed'
    const updateSql = `UPDATE bookings SET status = 'completed' WHERE id = ?`;
    const updateResult = await db.query(updateSql, [bookingId]);

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ error: 'Invalid booking ID or status is not awaiting confirmation.' });
    }

    // ✅ 2. Fetch Booking Details (to generate invoice)
    const bookingDetailsSql = `
      SELECT b.id, b.user_id, b.handyman_id, b.duration, h.hourly_rate
      FROM bookings b
      JOIN users h ON b.handyman_id = h.id
      WHERE b.id = ?
    `;

    const [bookingDetails] = await db.query(bookingDetailsSql, [bookingId]);

    if (!bookingDetails) {
      return res.status(400).json({ error: 'Booking not found.' });
    }

    const { user_id, handyman_id, duration, hourly_rate } = bookingDetails;
    const amount = hourly_rate * (duration / 60); // ✅ Calculate total cost

    // ✅ 3. Insert Invoice
    const invoiceSql = `
      INSERT INTO invoices (booking_id, user_id, handyman_id, amount, status, date_issued)
      VALUES (?, ?, ?, ?, 'paid', NOW())
    `;
    await db.query(invoiceSql, [bookingId, user_id, handyman_id, amount]);

    res.status(200).json({ message: 'Booking marked as complete. Invoice generated.' });
  } catch (error) {
    console.error('Error marking booking as complete:', error);
    res.status(500).json({ error: 'Failed to update booking status or generate invoice.' });
  }
});


// (ChatGPT) - Prompt: "How to allow users to submit reviews for handymen?"
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

// (ChatGPT) - Prompt: "How to fetch and display reviews and ratings for a specific handyman from a MySQL databases?"
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



app.post('/api/handyman/availability/exception', async (req, res) => {
  const { handyman_id, date, start_time, end_time, available } = req.body;

  if (!date || available === undefined) {
    return res.status(400).json({ error: 'Date and availability are required.' });
  }

  try {
    const sql = `
      INSERT INTO handyman_exceptions (handyman_id, date, start_time, end_time, available)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      start_time = VALUES(start_time),
      end_time = VALUES(end_time),
      available = VALUES(available)
    `;

    await db.query(sql, [handyman_id, date, start_time, end_time, available]);

    res.status(200).json({ message: 'Exception updated successfully.' });
  } catch (error) {
    console.error('Error saving exception:', error);
    res.status(500).json({ error: 'Failed to save exception.' });
  }
});

app.get('/api/handyman/availability', async (req, res) => {
  const { handyman_id } = req.query;

  if (!handyman_id) {
    console.error('Handyman ID is missing.');
    return res.status(400).json({ error: 'Handyman ID is required.' });
  }

  try {
    console.log(`Fetching availability for handyman_id: ${handyman_id}`);

    // Fetch recurring availability
    const recurring = await db.query(
      'SELECT day_of_week, start_time, end_time FROM handyman_availability WHERE handyman_id = ?',
      [handyman_id]
    );
    console.log('Recurring availability:', recurring);

    // Fetch exceptions
    const exceptions = await db.query(
      'SELECT date, start_time, end_time, available FROM handyman_exceptions WHERE handyman_id = ?',
      [handyman_id]
    );
    console.log('Exceptions:', exceptions);

    // Handle empty results gracefully
    res.status(200).json({
      recurring: recurring || [],
      exceptions: exceptions || [],
    });
  } catch (error) {
    console.error('Error fetching availability:', error); // Log the error
    res.status(500).json({ error: 'Failed to fetch availability.' });
  }
});

app.post('/api/handyman/availability/update', async (req, res) => {
  const { handyman_id, recurring, exceptions } = req.body;

  if (!handyman_id) {
    return res.status(400).json({ error: 'Handyman ID is required.' });
  }

  try {
    console.log(`Updating availability for handyman_id: ${handyman_id}`);

    // 🔹 Now, it only updates specific days without removing others
    if (recurring && Array.isArray(recurring)) {
      for (const { day_of_week, start_time, end_time } of recurring) {
        await db.query(
          'DELETE FROM handyman_availability WHERE handyman_id = ? AND day_of_week = ?',
          [handyman_id, day_of_week]
        );

        await db.query(
          'INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [handyman_id, day_of_week, start_time, end_time]
        );
      }
    }

    // 🔹 Keep handling exceptions normally
    if (exceptions && Array.isArray(exceptions)) {
      const exceptionPromises = exceptions.map(({ date, start_time, end_time, available }) =>
        db.query(
          `INSERT INTO handyman_exceptions (handyman_id, date, start_time, end_time, available)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time), available = VALUES(available)`,
          [handyman_id, date, start_time, end_time, available]
        )
      );

      await Promise.all(exceptionPromises);
    }

    res.status(200).json({ message: 'Availability updated successfully.' });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});


app.delete('/api/handyman/availability/delete', async (req, res) => {
  const { handyman_id, day_of_week } = req.body;

  if (!handyman_id || !day_of_week) {
    return res.status(400).json({ error: 'Handyman ID and day of week are required.' });
  }

  try {
    await db.query(
      'DELETE FROM handyman_availability WHERE handyman_id = ? AND day_of_week = ?',
      [handyman_id, day_of_week]
    );

    res.status(200).json({ message: `Availability for ${day_of_week} removed.` });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to remove availability.' });
  }
});


// 🔹 Utility function to generate 1-hour time slots while skipping booked ones
const generateTimeSlots = (startTime, endTime, bookings, duration = 60) => {
  const slots = [];
  let currentTime = new Date(`2023-01-01T${startTime}`);

  while (currentTime < new Date(`2023-01-01T${endTime}`)) {
    const formattedStartTime = currentTime.toTimeString().slice(0, 5); // HH:mm format
    const endSlotTime = new Date(currentTime);
    endSlotTime.setMinutes(endSlotTime.getMinutes() + duration); // Add duration
    const formattedEndTime = endSlotTime.toTimeString().slice(0, 5); // HH:mm format

    // ✅ Allow time slots where a previous booking ends
    const isBooked = bookings.some((booking) => {
      const bookingStart = booking.start_time.slice(0, 5); // Convert "HH:mm:ss" → "HH:mm"
      const bookingEnd = booking.end_time.slice(0, 5);

      return (
        formattedStartTime !== bookingEnd && // ✅ Allow if previous booking ends exactly here
        (formattedStartTime < bookingEnd && formattedEndTime > bookingStart) // ❌ Block if overlapping
      );
    });

    if (!isBooked) {
      slots.push(formattedStartTime);
    }

    // Move to the next 1-hour slot
    currentTime.setHours(currentTime.getHours() + 1);
  }

  return slots;
};






// 🔹 API Route: Get Available Time Slots
app.get('/api/handyman/availability/times', async (req, res) => {
  const { handyman_id, date } = req.query;

  if (!handyman_id || !date) {
    return res.status(400).json({ error: 'Handyman ID and date are required.' });
  }

  try {
    console.log(`Fetching available times for handyman_id: ${handyman_id} on ${date}`);

    const availability = await db.query(
      'SELECT start_time, end_time FROM handyman_availability WHERE handyman_id = ? AND day_of_week = DAYNAME(?)',
      [handyman_id, date]
    );

    console.log('Availability:', availability);

    if (!availability.length) {
      return res.status(200).json({ times: [] }); // ✅ Prevents undefined times
    }

    const bookings = await db.query(
      'SELECT start_time, end_time FROM bookings WHERE handyman_id = ? AND date = ?',
      [handyman_id, date]
    );

    console.log('Bookings:', bookings);

    const availableTimes = generateTimeSlots(
      availability[0].start_time,
      availability[0].end_time,
      bookings
    );

    console.log('Available Time Slots:', availableTimes);

    return res.status(200).json({ times: availableTimes });
  } catch (error) {
    console.error('Error fetching available times:', error);
    return res.status(500).json({ error: 'Failed to fetch available times.' });
  }
});

app.get('/invoices/:bookingId', (req, res) => {
  const { bookingId } = req.params;

  const sql = `
    SELECT 
      i.id AS invoice_id,
      i.booking_id,
      i.user_id,
      i.handyman_id,
      i.amount,
      i.status,
      i.date_issued,
      u.name AS customer_name,    -- Users (customers) have 'name'
      h.fullname AS handyman_name -- Handymen have 'fullname'
    FROM invoices i
    JOIN users u ON i.user_id = u.id
    JOIN users h ON i.handyman_id = h.id
    WHERE i.booking_id = ?;
  `;

  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      console.error("Error fetching invoice:", err);
      return res.status(500).json({ error: "Failed to fetch invoice." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Invoice not found for this booking." });
    }

    res.status(200).json({ invoice: results[0] });
  });
});

app.post('/save-push-token', async (req, res) => {
  const { userId, pushToken } = req.body;

  if (!userId || !pushToken) {
    return res.status(400).json({ error: "Missing userId or pushToken" });
  }

  try {
    // 🔹 Check if the user already has this token stored
    const existingEntry = await db.query(
      "SELECT id FROM push_tokens WHERE user_id = ? AND push_token = ?",
      [userId, pushToken]
    );

    if (existingEntry.length === 0) {
      // 🔹 Only insert if it doesn’t exist
      await db.query("INSERT INTO push_tokens (user_id, push_token) VALUES (?, ?)", [userId, pushToken]);
      console.log(`✅ Push token saved for user ${userId}: ${pushToken}`);
    } else {
      console.log(`ℹ️ Push token already exists for user ${userId}`);
    }

    res.status(200).json({ message: "Push token saved successfully" });

  } catch (error) {
    console.error("❌ Error saving push token:", error);
    res.status(500).json({ error: "Failed to save push token" });
  }
});





// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//References:
// OpenAI - ChatGPT