 var app = {};

app.init = function(){
  return true;
};

var lastCheckTime;
var friends = {};
var firstRun = true;
var rooms = {};
var room;

// var entityMap = {
//     "&": "&amp;",
//     "<": "&lt;",
//     ">": "&gt;",
//     '"': '&quot;',
//     "'": '&#39;',
//     "/": '&#x2F;'
//   };
// function escapeHtml(string) {
//   return String(string).replace(/[&<>"'\/]/g, function (s) {
//     return entityMap[s];
//   });
// }
function jQueryEscape(string){
  $temp = $("<div></div>");
  $temp.text(string);
  return $temp.html()
}

$(document).ready(function(){
 getMessage();

 setInterval(updateRoom, 5000);
 setInterval(updateFriends, 1000);

 $("#sendMessage").submit(function(event){
  event.preventDefault();
  var text = $("textarea[name=message]").val();
  sendMessage(text);
  $("textarea[name=message]").val('');
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

  $("#rooms").on("click", "a", function(){
    room = $(this).attr("data-id");
    changeRoom(room);
  });

 $("#chat").on("click", "p", function(){
  /*
  var friend = $(this).attr("data-user");
  if (friends.hasOwnProperty(friend)){
    $(this).removeClass("friended");
    delete friends[friend];
  }
  else {
    friends[friend] = '';
  }*/
console.log("!", $(this).find(".message").text())

 });

});

var updateFriends = function(){
  $("#friends span").empty();
  $("span[data-friend-user]").parent().removeClass("friended");

  for (var key in friends){
      $("#friends span").append("<a data-friend-id='" + jQueryEscape(key) + "'>" + jQueryEscape(key) + "</a>");
      $("span[data-user='" + key + "']").parent().addClass("friended");
  }


}

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
      if (object.roomname && object.roomname != "") {
        rooms[object.roomname] = '';
      }
      if(!firstRun){
        lastCheckTime = object.createdAt;
      }
      if(!room || room === object.roomname){
        if (object.text && object.username){
          if (!object.room){ object.room = ""; }
          $("#chat")[addMethod]('<p><span class="user" data-user="'+jQueryEscape(object.username)+'">'+jQueryEscape(object.username)+"</span>: <span class='message'>"+jQueryEscape(object.text)+'</span> '+jQueryEscape(object.room));

        //     if (!firstRun){

        //   if (object.username.indexOf("Echo") === -1){
        //     sendMessage(jQueryEscape(object.text).split('').reverse().join(''), jQueryEscape(object.username) + ' Echo');
        //   }
        // }
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

var sendMessage = function(text, username){

  if (!username){
    var username = location.search.split('username=')[1];
  }

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

var updateRoom = function(){
  $("#rooms div").empty();
  for (var key in rooms){
    $("#rooms div").append("<a data-room-id=" + jQueryEscape(key) + ">" + jQueryEscape(key) + "</a>");
  }
};

function changeRoom(newRoomName){
  $("h1 small").remove();
  $("#chat").empty();

  if (newRoomName){
    $("h1").append("<small> - " + room + "</small>");
  }
  $("#allrooms").show();
}




