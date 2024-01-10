const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs'); 
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path'); // Import the 'path' module


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');

/////////////////////////////// mysql connection  ////////////////////////////////////
// Create a MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1', // MySQL host
  user: 'root', // MySQL username
  password: 'Y1012Jqkhkp', // MySQL password
  database: 'aastmt' // MySQL database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
//////////////////////////////////////////////////////////////////////////////////////

// Set up session middleware
app.use(
  session({
    secret: 'aastmt',
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.static(path.join(__dirname, 'views')));
app.get('/', (req, res) => {
  // Use the 'path' module to construct the correct file path
  const filePath = path.join(__dirname,'views' ,'home.html');
  res.sendFile(filePath);
});


app.get('/login', (req, res) => {
    res.render('index'); 
});
app.get('/dash', (req, res) => {
  res.render('DashBoard'); 
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    connection.query("SELECT * FROM Employees where Username = ? AND Password = ? ", [username, password], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
      if (results.length > 0){
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/users'); 
      } else {
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
      
    });
});


app.get('/users', (req, res) => {

  // Check if the user is logged in by verifying the presence of the 'loggedin' session variable
  if (!req.session.loggedin) {
    // If the user is not logged in, redirect them to the home page ('/')
    res.redirect('/');
    return;
  }
  connection.query('SELECT * FROM employee_info', (err, results) => {
    if (err) {
      // If there is an error fetching users from the database, log the error and respond with a 500 status and an error message
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Error fetching users' });
      return;
    }
    
    // If the database query is successful, render the 'users' view with the fetched user data and the username from the session
    res.status(200).render('users', { users: results, username: req.session.username });
  });

  // If the user is logged in, query the database to fetch all records from the 'employee_info' table
  // connection.query('SELECT * FROM departments', (err, results) => {
  //   if (err) {
  //     // If there is an error fetching users from the database, log the error and respond with a 500 status and an error message
  //     console.error('Error fetching users:', err);
  //     res.status(500).json({ error: 'Error fetching users' });
  //     return;
  //   }
    
  //   // If the database query is successful, render the 'users' view with the fetched user data and the username from the session
  //   res.status(200).render('users', { users: results, username: req.session.username });
  // });
})







app.post('/api/adduser', (req, res) => {
  const { name, email, position, department, start_date, current_date_time} = req.body;
  connection.query(
    'INSERT INTO employee_info (name, email, position, department, start_date, current_date_time) VALUES (?, ?, ?, ?, ?, ?)',  
     [name, email, position, department, start_date, current_date_time],
    (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Error inserting data' });
        return;
      }

    

      if(result.affectedRows == 1)
      res.status(200).json({ success: true, id: result.insertId, name: name, email: email, position: position, department: department, start_date: start_date, current_date_time:current_date_time });
    }
  );

  

}); 


app.post('/api/adddepartment', (req, res) => {
  const { departmentName } = req.body;

  connection.query(
      'INSERT INTO Departments (name) VALUES (?)',
      [departmentName],
      (err, result) => {
          if (err) {
              console.error('Error inserting data:', err);
              res.status(500).json({ error: 'Error inserting data' });
              return;
          }

          if (result.affectedRows == 1)
              res.status(200).json({ success: true, id: result.insertId, name: departmentName });
      }
  );
});

app.delete('/api/deleteuser', (req, res) => {
  const { name} = req.body;
  connection.query(
    `DELETE FROM employee_info WHERE name = "${name}"`  ,
    (err, result) => {
      if (err) {
        console.error('Error deleting data:', err);
        res.status(500).json({ error: 'Error deleting data' });
        return;
      }

    

      if(result.affectedRows == 1)
      res.status(200).json({ success: true});
    }
  );

});


      app.post('/api/signup', (req, res) => {
        // Assuming you have a login view (login_view.ejs), render it
        res.render('login_view');
      });


      app.post('/api/adduser2', (req, res) => {
        const { username, password } = req.body;
      
        // Check if both username and password are provided
        if (!username || !password) {
          return res.status(400).json({ error: 'Both username and password are required' });
        }
      
        connection.query(
          'INSERT INTO Employees (username, password) VALUES (?, ?)',
          [username, password],
          (err, result) => {
            if (err) {
              console.error('Error inserting data:', err);
              return res.status(500).json({ error: 'Error inserting data' });
            }
      
            if (result.affectedRows == 1) {
              return res.status(200).json({ success: true, id: result.insertId, username: username, password: password });
            }
          }
        );
      });
      


app.post('/api/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).json({ success: false, message: 'Error signing out' });
      return;
    }

    res.status(200).json({ success: true, message: 'Success' });
  });
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("http://localhost:3000");
});
