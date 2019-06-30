var express = require("express");
// var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");
const mongoose = require('mongoose');
var exphbs = require("express-handlebars");

 
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

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


mongoose.connect(MONGODB_URI);


var DB = mongoose.connection;

// Show any mongoose errors
DB.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
DB.once("open", function() {
  console.log("Connected to Mongoose");
});

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.get("/", function(req, res) {
    db.Article.find({"saved": false}, function(error, data) {
        var hbsObject = {
          article: data
        };
        console.log(hbsObject);
        res.render("index", hbsObject);
      });
    });

app.get("/saved", function(req, res) {
  db.Article.find({"saved": true}).populate("comment").exec(function(error, articles) {
    var hbsObject = {
      article: articles
    };
    res.render("saved", hbsObject);
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

      // Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  
  // Route for grabbing a specific Article by id
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ "_id": req.params.id })
      // ..and populate all of the notes associated with it
      .populate("comment")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Route for posting comments to an article

app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
      .then(function(dbComment) {
        return db.Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": dbComment._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Save an Article

  app.post("/articles/save/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      }
      else {
        res.send(doc);
      }
    });
});

// Delete an article

app.post("/articles/delete/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false})
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      }
      else {
        res.send(doc);
      }
    });
});


// Create a new note
// app.post("/comments/save/:id", function(req, res) {
// var newComment = new Comment({
//   title: req.body.text,
//   body: req.body.text,
//   article: req.params.id
// });
// console.log(req.body)
// newComment.save(function(error, note) {
//   if (error) {
//     console.log(error);
//   }
//   else {
//     db.Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "comment": comment } })
//     .exec(function(err) {
//       if (err) {
//         console.log(err);
//         res.send(err);
//       }
//       else {
//         res.send(comment);
//       }
//     });
//   }
// });
// });

// Delete a note
// app.delete("/comments/delete/:comment_id/:article_id", function(req, res) {
// db.Comment.findOneAndRemove({ "_id": req.params.note_id }, function(err) {
//   if (err) {
//     console.log(err);
//     res.send(err);
//   }
//   else {
//    db.Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"comment": req.params.comment_id}})
//       .exec(function(err) {
//         if (err) {
//           console.log(err);
//           res.send(err);
//         }
//         else {
//           res.send("Comment Removed");
//         }
//       });
//   }
// });
// }); 




app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });