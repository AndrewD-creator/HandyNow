// (ChatGPT)
const mysql = require('mysql');

const db = mysql.createConnection({
  host: '127.0.0.1',    
  user: 'root',         
  password: 'Andrew', 
  database: 'demoAppDB' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;
