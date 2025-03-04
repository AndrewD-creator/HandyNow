INSERT INTO users (id, name, email)
VALUES (
    id:int,
    'name:varchar',
    'email:varchar'
  );

  ALTER TABLE users
ADD COLUMN password VARCHAR(255);

ALTER TABLE users ADD COLUMN role ENUM('user', 'handyman') NOT NULL DEFAULT 'user';

ALTER TABLE users
ADD COLUMN address VARCHAR(255),
ADD COLUMN eircode VARCHAR(20),
ADD COLUMN county VARCHAR(100),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN fullname VARCHAR(255);

DELETE FROM users WHERE id = 47;

ALTER TABLE users ADD bio TEXT;
ALTER TABLE users ADD skills TEXT; -- Store skills as a comma-separated string or JSON

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  handyman_id INT NOT NULL,
  user_id INT NOT NULL,
  date DATETIME NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (handyman_id) REFERENCES users(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE bookings MODIFY COLUMN date DATE;

ALTER TABLE bookings
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';

ALTER TABLE reviews
CHANGE COLUMN review comment TEXT;

DESCRIBE reviews;


CREATE TABLE handyman_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    handyman_id INT NOT NULL,
    date DATE NOT NULL,
    available BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (handyman_id) REFERENCES users(id)
);

-- Add new columns for start and end times
ALTER TABLE handyman_availability
ADD COLUMN start TIME NOT NULL DEFAULT '09:00:00',
ADD COLUMN end TIME NOT NULL DEFAULT '17:00:00';

TRUNCATE TABLE handyman_availability;

-- Ensure unique entries for the same handyman and date
ALTER TABLE handyman_availability
ADD UNIQUE(handyman_id, date);

-- (Optional) Add ON DELETE CASCADE for foreign key
ALTER TABLE handyman_availability
ADD CONSTRAINT fk_handyman FOREIGN KEY (handyman_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE handyman_availability MODIFY date DATETIME NOT NULL;


CREATE TABLE handyman_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    handyman_id INT NOT NULL, -- Foreign key to handymen
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL, -- Start time for availability
    end_time TIME NOT NULL, -- End time for availability
    recurring BOOLEAN DEFAULT TRUE, -- Is this a recurring schedule?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (handyman_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE handyman_exceptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    handyman_id INT NOT NULL,
    date DATE NOT NULL, -- Specific date
    start_time TIME, -- Optional: Custom start time for this date
    end_time TIME, -- Optional: Custom end time for this date
    available BOOLEAN NOT NULL, -- Is the handyman available?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (handyman_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time)
VALUES (27, 'Monday', '09:00:00', '17:00:00');

SELECT day_of_week, start_time, end_time
FROM handyman_availability
WHERE handyman_id = 27;

ALTER TABLE bookings 
ADD COLUMN start_time TIME NOT NULL,
ADD COLUMN end_time TIME NOT NULL,
ADD COLUMN duration INT NOT NULL;


SELECT id, handyman_id, user_id, date, start_time, end_time, duration 
FROM bookings 
WHERE start_time LIKE '%00:00%';

UPDATE bookings 
SET start_time = '09:00:00', 
    end_time = '10:00:00', 
    duration = 60
WHERE start_time = '00:00:00' OR end_time = '00:00:00' OR duration = 0;

SELECT * FROM bookings 
WHERE handyman_id = 27 
AND date = '2025-01-30' 
AND ((start_time <= '13:00:00' AND end_time > '13:00:00') 
  OR (start_time < '12:00' AND end_time >= '12:00'));

SELECT id, handyman_id, date, start_time, end_time 
FROM bookings 
WHERE handyman_id = 27;

SELECT * FROM bookings WHERE handyman_id = 27 AND date = '2025-01-30';

SELECT * FROM bookings 
WHERE handyman_id = 27 
AND date = '2025-01-30' 
AND (start_time <= '10:00:00' AND end_time > '09:00:00');

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    handyman_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid') DEFAULT 'pending',
    date_issued TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handyman_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 50;

UPDATE users 
SET hourly_rate = NULL 
WHERE role != 'handyman';

UPDATE users 
SET hourly_rate = 50 
WHERE role = 'handyman' AND hourly_rate IS NULL;

ALTER TABLE users MODIFY COLUMN hourly_rate DECIMAL(10,2) NULL;

SHOW COLUMNS FROM invoices LIKE 'status';

CREATE TABLE push_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    push_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_token (push_token),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    push_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_entry (user_id, push_token), -- Ensures one user can't have the same token twice
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE push_tokens 
DROP INDEX push_token, 
ADD UNIQUE KEY unique_entry (user_id, push_token);


ALTER TABLE bookings ADD COLUMN notifications_sent VARCHAR(255) DEFAULT '';

CREATE TABLE disputes (
    dispute_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    handyman_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    images JSON DEFAULT NULL, -- Stores image URLs as JSON array
    status ENUM('Pending Handyman', 'Pending Admin', 'Resolved - Refunded', 'Resolved - Rejected') DEFAULT 'Pending Handyman',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handyman_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE disputes ADD COLUMN handyman_response TEXT DEFAULT NULL;

SELECT dispute_id, images FROM disputes WHERE images IS NOT NULL;

ALTER TABLE disputes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE users MODIFY COLUMN role ENUM('user', 'handyman', 'admin') NOT NULL DEFAULT 'user';

INSERT INTO users (id, name, email, password, role) 
VALUES (37, 'admin', 'admin@example.com', 'admin', 'admin');


ALTER TABLE disputes ADD COLUMN admin_response TEXT DEFAULT NULL;

ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL;

UPDATE users 
SET address = '45 Maple Drive', 
    eircode = 'T12X4Y6', 
    county = 'Cork' 
WHERE id = 13;

ALTER TABLE bookings ADD COLUMN completion_image VARCHAR(255) DEFAULT NULL;
