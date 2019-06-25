var express = require("express");
// var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");
const mongoose = require('mongoose');
 
// mongoose.connect('mongodb://localhost/my_database', {useNewUrlParser: true});

var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoLion";

mongoose.connect(MONGODB_URI);

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
            // Save an empty result object
            var result = {};
      
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
              .children("h2")
              .children("a")
              .text();

            result.summary = $(this)
              .children("p.excerpt")  
              .text();
              
            result.link = $(this)
              .children("h2")
              .children("a")
              .attr("href");
             

      
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
              })
              .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
              });
          });
      
          // Send a message to the client
          res.send("Scrape Complete");
        });
      });




//         $("header").each(function(i, element) {
//             // Save the text and href of each link enclosed in the current element
//             // console.log(element);
            // var title = $(element).children("h2").children("a").text();
            // var link = $(element).children("h2").children("a").attr("href");

//             console.log(title);
//             console.log(link);
            
//              // If this found element had both a title and a link
//       if (title && link) {
//         // Insert the data in the scrapedData db
//         db.huntedData.insert({
//           title: title,
//           link: link
//         },
//         function(err, inserted) {
//           if (err) {
//             // Log the error if one is encountered during the query
//             console.log(err);
//           }
//           else {
//             // Otherwise, log the inserted data
//             console.log(inserted);
//           }
//         });
//       }
//      });
//   });
//     // Send a "Scrape Complete" message to the browser
//   res.send("Scrape Complete");
// });







app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });