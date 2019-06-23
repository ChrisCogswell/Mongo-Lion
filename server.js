var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
const mongoose = require('mongoose');
 
// mongoose.connect('mongodb://localhost/my_database', {useNewUrlParser: true});

// Initialize Express
var app = express();

// Database Configuration
var databaseURL = "mongoLion";
var collections = ["huntedData"];

var db = mongojs(databaseURL, collections);
db.on("error", (error) => {
    console.log("Database Error:" ,error);
});

app.get("/", (req, res) => {
    res.send("Welcome to Mongo-Lion");
});

app.get("/all" , (req, res) => {
    db.huntedData.find({}, (error, found) =>{
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

app.get("/scrape", (req, res) => {
    axios.get("https://arstechnica.com").then((response) => {
        var $ = cheerio.load(response.data);

        $("header").each(function(i, element) {
            // Save the text and href of each link enclosed in the current element
            // console.log(element);
            var title = $(element).children("h2").children("a").text();
            var link = $(element).children("h2").children("a").attr("href");

            console.log(title);
            console.log(link);
            
             // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.huntedData.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
     });
  });
    // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});







app.listen(3000, function() {
    console.log("App running on port 3000!");
  });