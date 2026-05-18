 require('dotenv').config();
 const express = require('express');
 const cors = require('cors');
 const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
 const db = require('./db');
 
 const app = express();
 app.use(cors());
 app.use(express.json()); 
 
 const PORT = process.env.PORT || 3001;
 
 const weryfikujToken = (req, res, next) => {
     const token = req.headers['authorization']; 
     if (!token) return res.status(403).json({ message: 'Brak dostępu. Zaloguj się.' });
 
     try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         req.user = decoded; 
         next(); 
     } catch (err) {
         res.status(401).json({ message: 'Nieprawidłowy token' });
     }
 };
 
 // REJESTRACJA
 app.post('/register', async (req, res) => {
    const { email, password, role, first_name, second_name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Wypełnij wszystkie pola!' });
    }
 
     try {
         const hash = await bcrypt.hash(password, 8);
         
         await db.execute(
             'INSERT INTO Users (email, password, role, first_name, second_name) VALUES (?, ?, ?, ?, ?)',
             [email, hash, role || 'client', first_name, second_name]
         );
         res.status(201).json({ message: 'Konto utworzone pomyślnie!' });
     } catch (err) {
         console.error(err);
         res.status(500).json({ message: 'Błąd rejestracji. Email może być zajęty.' });
     }
 });
 
 // LOGOWANIE
 app.post('/login', async (req, res) => {
     const { email, password } = req.body;
     try {
         const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
         if (users.length === 0) return res.status(401).json({ message: 'Błędny email lub hasło' });
 
         const user = users[0];
 
         const sprawdzHaslo = await bcrypt.compare(password, user.password);
         
         if (!sprawdzHaslo) {
              return res.status(401).json({ message: 'Błędny email lub hasło' });
         }
 
         const token = jwt.sign(
             { id: user.id, role: user.role, name: user.first_name },
             process.env.JWT_SECRET,
             { expiresIn: '1h' }
         );
 
         res.json({ token, role: user.role, name: user.first_name, id: user.id });
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
 // POBIERANIE "MOJE ZWIERZĘTA" (Dla Klienta)
 app.get('/my-animals', weryfikujToken, async (req, res) => {
     try {
         const [rows] = await db.execute('SELECT * FROM Animal WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
         res.json(rows);
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
 // POBIERANIE "WSZYSCY PACJENCI" 
 app.get('/all-animals', weryfikujToken, async (req, res) => {
     if (req.user.role === 'client') {
         return res.status(403).json({ message: 'Odmowa dostępu. Tylko personel.' });
     }
     try {
         const [rows] = await db.query(`
             SELECT Animal.*, Users.email as owner_email, Users.first_name as owner_name 
             FROM Animal 
             JOIN Users ON Animal.user_id = Users.id
         `);
         res.json(rows);
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
 // DODAWANIE ZWIERZĘCIA (CREATE)
 app.post('/animals', weryfikujToken, async (req, res) => {
     const { name, species, breed, birth_date } = req.body;

     if (new Date(birth_date) > new Date()) {
        return res.status(400).json({ message: 'Zwierzę nie może być z przyszłości!' });
    }

     try {
         await db.execute(
             'INSERT INTO Animal (name, species, breed, birth_date, user_id) VALUES (?, ?, ?, ?, ?)',
             [name, species, breed, birth_date, req.user.id]
         );
         res.status(201).json({ message: 'Dodano zwierzaka!' });
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
 // USUWANIE ZWIERZĘCIA (DELETE)
 app.delete('/animals/:id', weryfikujToken, async (req, res) => {
     const animalId = req.params.id;
     const userId = req.user.id;
     const userRole = req.user.role;
 
     try {
         let checkSql = 'SELECT * FROM Animal WHERE id = ?';
         let params = [animalId];
 
         if (userRole !== 'vet') {
             checkSql += ' AND user_id = ?';
             params.push(userId);
         }
 
         const [rows] = await db.execute(checkSql, params);
 
         if (rows.length === 0) {
             return res.status(403).json({ message: 'Brak uprawnień lub zwierzę nie istnieje.' });
         }
 
         await db.execute('DELETE FROM Animal WHERE id = ?', [animalId]);
         res.json({ message: 'Zwierzę usunięte.' });
 
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
 // EDYCJA ZWIERZĘCIA (UPDATE)
 app.put('/animals/:id', weryfikujToken, async (req, res) => {
     const animalId = req.params.id;
     const { name, species, breed, birth_date } = req.body;
     const userId = req.user.id;
     const userRole = req.user.role;

     if (new Date(birth_date) > new Date()) {
        return res.status(400).json({ message: 'Zwierzę nie może być z przyszłości!' });
    }
 
     try {
         let checkSql = 'SELECT * FROM Animal WHERE id = ?';
         let params = [animalId];
 
         if (userRole !== 'admin') {
             checkSql += ' AND user_id = ?';
             params.push(userId);
         }
 
         const [rows] = await db.execute(checkSql, params);
 
         if (rows.length === 0) {
             return res.status(403).json({ message: 'Brak uprawnień lub zwierzę nie istnieje.' });
         }
 
         await db.execute(
             'UPDATE Animal SET name=?, species=?, breed=?, birth_date=? WHERE id=?', 
             [name, species, breed, birth_date, animalId]
         );
         res.json({ message: 'Dane zwierzęcia zaktualizowane.' });
 
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
// Pobieranie danych do formularza wizyt (listy rozwijane)
app.get('/form-data', weryfikujToken, async (req, res) => {
    try {
        const [services] = await db.execute('SELECT * FROM Service');
        
        const [vets] = await db.execute(
            'SELECT id, first_name, second_name FROM Users WHERE role = "vet"'
        );
        
        res.json({ services, vets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
 
 // Pobieranie historii wizyt
 app.get('/appointments', weryfikujToken, async (req, res) => {
     try {
         let sql = `
             SELECT 
                 Appointment.id, 
                 Appointment.appointment_date, 
                 Appointment.status,
                 Animal.name as animal_name,
                 Users.second_name as vet_name,
                 Service.name as service_name,
                 Service.price
             FROM Appointment
             JOIN Animal ON Appointment.animal_id = Animal.id
             JOIN Users ON Appointment.vet_id = Users.id
             JOIN Appointment_Service ON Appointment.id = Appointment_Service.appointment_id
             JOIN Service ON Appointment_Service.service_id = Service.id
         `;

         if (req.user.role === 'client') {
             sql += ` WHERE Animal.user_id = ${req.user.id}`;
         }
         
         sql += ' ORDER BY Appointment.appointment_date DESC';
 
         const [rows] = await db.execute(sql);
         res.json(rows);
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });
 
 // Umawianie wizyty (TRANSAKCJA)
 app.post('/appointments', weryfikujToken, async (req, res) => {
     const { animal_id, vet_id, service_id, date } = req.body;
     const connection = await db.getConnection(); 
 
     try {
         await connection.beginTransaction(); 
 
         const [result] = await connection.execute(
             'INSERT INTO Appointment (appointment_date, status, vet_id, animal_id) VALUES (?, ?, ?, ?)',
             [date, 'scheduled', vet_id, animal_id]
         );
         const appointmentId = result.insertId;
 
         const [services] = await connection.execute('SELECT price FROM Service WHERE id = ?', [service_id]);
         const price = services[0].price;
 
         await connection.execute(
             'INSERT INTO Appointment_Service (appointment_id, service_id, price) VALUES (?, ?, ?)',
             [appointmentId, service_id, price]
         );
 
         await connection.commit(); 
         res.status(201).json({ message: 'Wizyta umówiona!' });
 
     } catch (err) {
         await connection.rollback(); 
         res.status(500).json({ message: 'Błąd umawiania: ' + err.message });
     } finally {
         connection.release(); 
     }
 });
 
 app.listen(PORT, () => {
     console.log(`Serwer uruchomiony na porcie ${PORT}`);
 });