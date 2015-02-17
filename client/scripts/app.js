var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };
function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}
var lastCheckTime;

$(document).ready(function(){
 getMessage();
  $("#inputSubmit").on("click", function(){
    var text = $("#inputMessage").val();
    sendMessage(text);
  });
});

var firstRun = true;

var getMessage = function(){
  var getURL = "https://api.parse.com/1/classes/chatterbox";

  var addMethod = firstRun ? "append" : "prepend";

  if (!firstRun){
    getURL += '?order=createdAt&where={"createdAt":{"$gt":{"__type":"Date","iso":"' + lastCheckTime + '"}}}';
  }else{
    getURL += "?order=-createdAt";
  }

  $.ajax({
    type: "GET",
    url: getURL
  })
  .done(function( msg ) {
    if(firstRun){
      lastCheckTime = msg.results[0].createdAt;
    }
    $.each(msg.results, function(index, object){
      if(!firstRun){
        lastCheckTime = object.createdAt;
      }
      if (object.text && object.username){
        $("#chat")[addMethod]("<p>" + '<em>' + object.createdAt + '</em>' + escapeHtml(object.username) + ": " + escapeHtml(object.text) + "</p>");
      }
    });

    firstRun = false;
    setTimeout(getMessage, 5000);

  })
  .fail(function() {
    alert("Something's wrong. Panic. Refresh.");
  });
};


var sendMessage = function(text){
  var username = location.search.split('username=')[1];
  var sendURL = 'https://api.parse.com/1/classes/chatterbox';
  var message = {username: username, text: text, roomname: 'hr25'}

  $.ajax({
    url: sendURL,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};


