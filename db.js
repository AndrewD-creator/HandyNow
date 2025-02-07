// (ChatGPT)
const mysql = require('mysql');
const util = require('util'); // Import util to promisify db.query


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

db.query = util.promisify(db.query);


module.exports = db;
