require('dotenv').config(); 
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

console.log(`Próba połączenia z MySQL na porcie ${process.env.DB_PORT}...`);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Błąd połaczenia z bazą:', err.message);
        console.error('Czy baza danych jest włączona?');
    } else {
        console.log('Połączono z bazą danych.');
        connection.release();
    }
});

module.exports = pool.promise(); 