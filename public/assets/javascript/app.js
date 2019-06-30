
  
  $("#scrape-button").on("click", function() {
    //   alert("scrape");
      $("#content-wrapper").empty();
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
        window.location.reload();
    })
});

$(".save").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/articles/save/" + thisId
  }).done(function(data) {
      window.location = "/"
  })
});

//Handle Delete Article button
$(".delete").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/articles/delete/" + thisId
  }).done(function(data) {
      window.location = "/saved"
  })
});

// Save Note button
$(".saveComment").on("click", function() {
  var thisId = $(this).attr("data-id");
    $.ajax({
          method: "POST",
          url: "/comments/save/" + thisId,
          data: {
            text: $("#commentText" + thisId).val()
          }
        }).done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#commentText" + thisId).val("");
            $(".modalComment").modal("hide");
            window.location = "/saved"
        });
  
});

// Delete Note button
$(".deleteComment").on("click", function() {
  var commentId = $(this).attr("data-comment-id");
  var articleId = $(this).attr("data-article-id");
  $.ajax({
      method: "DELETE",
      url: "/comments/delete/" + commentId + "/" + articleId
  }).done(function(data) {
      console.log(data)
      $(".modalComment").modal("hide");
      window.location = "/saved"
  })
});


//   $("#comment-button").on("click", function() {
//     // $("#comments").empty();
//     var thisId = $(this).attr("data-id");
  
//     $.ajax({
//       method: "GET",
//       url: "/articles/" + thisId
//     })
//       .then(function(data) {
//         console.log(data);
//         // The title of the article
//         $("#exampleModalLabel").append("hello" +data.title);
//         // An input to enter a new title
//         $("#comments").append("<input id='titleinput' name='title' >");
//         // A textarea to add a new note body
//         $(".modal-body").append("<textarea id='bodyinput' name='body'></textarea>");
//         // A button to submit a new note, with the id of the article saved to it
//         $("#comments").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
//         // If there's a note in the article
//         if (data.comment) {
//           // Place the title of the note in the title input
//           $("#titleinput").val(data.comment.title);
//           // Place the body of the note in the body textarea
//           $("#bodyinput").val(data.comment.body);
//         }
//       });
//   });
