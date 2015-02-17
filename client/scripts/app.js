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

 setInterval(updateRoom, 2000);
 $("#sendMessage").submit(function(event){
  event.preventDefault();
  var text = $("input[name=message]").val();
  sendMessage(text);
  $("input[name=message]").val('');
 })

 $("#allrooms").on("click", function(){
    room = undefined;
    changeRoom();
    $(this).hide();
  });
 $("#createroom").on("click", function(){
    var roomname = prompt("Enter your desire room name");
    room = roomname;
    changeRoom(room);
 });
 $(".user").on("click", function(){
  if (friends.hasOwnProperty($(this).attr("data-user"))){
    delete friends($(this).attr("data-user"));
  }
 })
});

var friends = {};
var firstRun = true;
var rooms = {};

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
    someGlobal = msg;
    if(firstRun){
      lastCheckTime = msg.results[0].createdAt;
    }
    $.each(msg.results, function(index, object){

      if (object.roomname) {
        rooms[object.roomname] = '';
      }

      if(!firstRun){
        lastCheckTime = object.createdAt;
      }
      if(!room || room === object.roomname){
        if (object.text && object.username){
          $("#chat")[addMethod]("<p>" + '<span class="user" data-user="' + escapeHtml(object.username) + '"' + ">"+escapeHtml(object.username)+"</span>: " + escapeHtml(object.text) + object.roomname + "</p>");
        }
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
  var message = {username: username, text: text, roomname: room};

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

var room;

var updateRoom = function(){
  $("#rooms div").empty();
  for (var key in rooms){
    $("#rooms div").append("<a data-id=" + key + ">" + key + "</a>");
  }
  $("#rooms a").on("click", function(){
    room = $(this).attr("data-id");
    changeRoom(room);
  });

};

function changeRoom(newRoomName){
  $("h1 small").remove();
  $("#chat").empty();

  if (newRoomName){
    $("h1").append("<small> - " + room + "</small>");
  }
  $("#allrooms").show();
}




