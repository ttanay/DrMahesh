const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const credentials = require('./credentials.js');

app = express();

//helpers
function cleanData(queryResult) {

};

//DB
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'lattice',
});

connection.connect();

connection.query('SELECT responses.response_id,responses.patient_id,created_on,prescription_date from responses inner join patients on responses.patient_id = patients.patient_id inner join response_details on responses.response_id = response_details.response_id order by patients.patient_id;', (error, results, fields) => {
  console.log(results);
});
//EMAIL
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: credentials.username,
    pass: credentials.password,
  }
});

var mailOptions = {
  from: credentials.username,
  to: 'tanayrao007@gmail.com',
  subject: 'Unfilled surveys',
}

//Routes
app.get('/sendmail/', (req, res) => {

  let unfilled = [];

  // unfilled = QUERY_RESULT

  //Construct JSON data

  mailOptions.html = JSON.stringify({data: unfilled});
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({data: unfilled}));
  transporter.sendMail(mailOptions, (err, info) => {
    if(err)
      console.log(err);
    else
      console.log(info);
  });
});

//Listen
app.listen(3000);
