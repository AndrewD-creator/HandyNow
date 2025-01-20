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

DELETE FROM users WHERE id = 25;

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
