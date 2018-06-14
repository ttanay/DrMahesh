const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const credentials = require('./credentials.js');

app = express();

//DB setup
mongoose.connect('mongodb://localhost:27017/lattice');

//Schemas
var patientSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  prescription_date: Date,
  responses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Response'}],
});
var responseSchema = new mongoose.Schema({
  created_on: Date,
  response_text: String,
  patient: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}
});

var Patient = mongoose.model('Patient', patientSchema);
var Response = mongoose.model('Response', responseSchema);

//POPULATE
var p0 = new Patient({
  _id: mongoose.Types.ObjectId(),
  prescription_date: new Date(2018, 01, Math.floor(Math.random()*10))
});
p0.save((err) => {
  if(err) console.log(err)

  var resp0 = new Response({
    created_on: new Date(2018, 01 + Math.floor(Math.random()*3), Math.floor(Math.random()*10)),
    response_text: 'p' + Math.floor(Math.random()*10),
    patient: p0._id
  });

  resp0.save((err) => {
    if (err) console.log(err)
  });
  this.responses: [resp0]
});

console.log(credentials)

var getValidPatients = () => {

  let validPatients = [];

  Patient.find({}, (err, patients) => {
    patients.forEach((patient) => {
      console.log(patient);
      /*let recentResponse = patient.responses[0];
      patient.responses.forEach((response) => {
        if (response > recentResponse)
          recentResponse = response
      })*/
    });
  });
}

console.log(getValidPatients());


//
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
  var unfilled = getSurveyPatients();
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

//Listen
app.listen(3000);
