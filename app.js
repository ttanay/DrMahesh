const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const credentials = require('./credentials.js');

app = express();

//helpers
var cleanResult = function(current, result){
  current = {
    patient_id: result.patient_id,
    prescription_date: result.prescription_date,
    responses: [
      {
        response_id: result.response_id,
        created_on: result.created_on,
        text: result.response_text,
      }
    ]
  };
  return current;
};

var filterData = function(dataset){
  let filteredData = [];
  dataset.forEach((data) => {
    let recentResponses = data.responses.slice(Math.max(data.responses.length -2, 1))
    if(recentResponses >= 1){
      let daysSinceSurvey = Math.abs(Date.parse(recentResponses[0]) - (new Date()));
      if(daysSinceSurvey > 7*5)
        filteredData.push(data);
    }
    else{
      let daysSincePrescription = Math.abs(Date.parse(data.prescription_date) - (new Date()));
      if(daysSincePrescription > 7*5)
        filteredData.push(data);
    }
  });
  return filteredData;
};

//DB
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'lattice',
});

connection.connect();


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

  let unfilled = {};

  connection.query('select distinct responses.response_id, responses.patient_id, created_on, prescription_date, response_details.response_text from responses inner join patients on responses.patient_id = patients.patient_id inner join response_details on responses.response_id = response_details.response_id order by responses.patient_id;', (error, results, fields) => {
    let data = [];
    let current = null;
    results.forEach((result) => {
      if(current == null){
        current = cleanResult(current, result);
      }
      else if(current.patient_id == result.patient_id){
        current.responses.push({
          response_id: result.response_id,
          created_on: result.created_on,
          text: result.response_text,
        });
      }
      else{
        data.push(current);
        current = cleanResult(current, result);
      }
    });
    data.push(current);
    console.log(data);
    unfilled.data = filterData(data);
    console.log(JSON.stringify(unfilled));
		mailOptions.html = JSON.stringify(unfilled);
  	res.setHeader('Content-Type', 'application/json');
  	res.send(JSON.stringify(unfilled));
  	transporter.sendMail(mailOptions, (err, info) => {
    	if(err)
      	console.log(err);
    	else
      	console.log(info);
  	});
  });

  // unfilled = QUERY_RESULT

  //Construct JSON data

});

//Listen
app.listen(3000);
