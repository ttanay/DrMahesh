const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const credentials = require('./credentials.js');

app = express();

//DB setup
mongoose.connect('mongodb://localhost:27017/lattice');

//Schemas
var patientSchema = new mongoose.Schema({
  prescriptionDate: Date,
  response: {
    createdOn: Date,
    responseText: String,
  },
});

var Patient = mongoose.model('Patient', patientSchema);


//GENRATOR FN
function populateDB(){
  let patient = Patient({
    prescriptionDate: new Date(2018, 01, Math.floor(Math.random()*10)),
    response: {
      createdOn: new Date(2018, 01 + Math.floor(Math.random()*3), 10 + Math.floor(Math.random()*10)),
      responseText: 'response',
    }
  });

  patient.save(function (err){
    if (err) console.log(err)
  });
}


for(let i = 0; i < 15; i++)
  populateDB();

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
  to: '<DR MAHESH EMAIL>',
  subject: 'Unfilled surveys',
}

//Routes
app.get('/sendmail/', (req, res) => {

  let unfilled = [];

  Patient.find({}).exec((err, patients) => {
    patients.forEach(function(patient) {
      daysSincePrescription = patient.response.createdOn - patient.prescriptionDate;
      daysSincePrescription = daysSincePrescription / (1000 * 3600 * 24);
      if(daysSincePrescription > 35){
        unfilled.push(patient);
      }
    });
    mailOptions.html = JSON.stringify({data: unfilled});
		res.setHeader('Content-Type', 'application/json');
  	res.send(JSON.stringify({data: unfilled}))
  	transporter.sendMail(mailOptions, (err, info) => {
    	if(err)
      	console.log(err);
    	else
      	console.log(info);
  	});
  });

});

//Listen
app.listen(3000);
