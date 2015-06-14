// Connects to the server that serves the page //
var socket = io.connect(window.location.hostname);
var username = '';
var definition;

// Adds message to the specified room //
function addMessageToRoom(room, message){
    var timestamp = new Date();
    initializeEmoticons();
    var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    $('.tab-content .' + room).append("<li class=\"left clearfix\"><span class=\"chat-img pull-left\">"+
                                        "<img src=\"http://placehold.it/50/55C1E7/fff&amp;text=Me\" alt=\"User Avatar\" class=\"img-circle\">"+
                                    "</span>"+
                                        "<div class=\"chat-body clearfix\">"+
                                            "<div class=\"header\">"+
                                                "<strong class=\"primary-font\">Me</strong> <small class=\"pull-right text-muted\">"+
                                                    "<span class=\"glyphicon glyphicon-time\"></span>"+time+"</small>"+
                                            "</div>"+
                                            "<p>"+
                                                 $.emoticons.replace($('#' + room + ' input').val()) + 
                                            "</p>"+
                                        "</div>"+
                                    "</li>");   
    scrollChat(room);
}

// Add messsage received to a room //
function addMessageFromRoom(username, room, message){
    var timestamp = new Date();
    console.log($.emoticons.replace(message));
    var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    $('.tab-content .' + room).append("<li class=\"left clearfix\"><span class=\"chat-img pull-left\">"+
                                         "<img src=\"http://placehold.it/50/FA6F57/fff&amp;text="+username+"\" alt=\"User Avatar\" class=\"img-circle\">"+
                                    "</span>"+
                                        "<div class=\"chat-body clearfix\">"+
                                            "<div class=\"header\">"+
                                                "<strong class=\"primary-font\">"+username+"</strong> <small class=\"pull-right text-muted\">"+
                                                    "<span class=\"glyphicon glyphicon-time\"></span>"+time+"</small>"+
                                            "</div>"+
                                            "<p>"+
                                                 $.emoticons.replace(message) + 
                                            "</p>"+
                                        "</div>"+
                                    "</li>");
    scrollChat(room);
}

// Add message from private user //
function addMessageFromPrivateUser(sender, message){
    var timestamp = new Date();
    var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    $('.tab-content .' + sender).append("<li class=\"left clearfix\"><span class=\"chat-img pull-left\">"+
                                         "<img src=\"http://placehold.it/50/FA6F57/fff&amp;text="+sender+"\" alt=\"User Avatar\" class=\"img-circle\">"+
                                    "</span>"+
                                        "<div class=\"chat-body clearfix\">"+
                                            "<div class=\"header\">"+
                                                "<strong class=\"primary-font\">"+sender+"</strong> <small class=\"pull-right text-muted\">"+
                                                    "<span class=\"glyphicon glyphicon-time\"></span>"+time+"</small>"+
                                            "</div>"+
                                            "<p>"+
                                                 $.emoticons.replace(message) + 
                                            "</p>"+
                                        "</div>"+
                                    "</li>");
    scrollChat(sender);
}

function addAtchToRoom(username, room, message){
    var timestamp = new Date();
    var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    $('.tab-content .'+room).append("<li class=\"left clearfix\"><span class=\"chat-img pull-left\">"+
                                       "<img src=\"http://placehold.it/50/55C1E7/fff&amp;text="+username+"\" alt=\"User Avatar\" class=\"img-circle\">"+
                                    "</span>"+
                                        "<div class=\"chat-body clearfix\">"+
                                            "<div class=\"header\">"+
                                                "<strong class=\"primary-font\">"+username+"</strong> <small class=\"pull-right text-muted\">"+
                                                    "<span class=\"glyphicon glyphicon-time\">"+time+"</span></small>"+
                                            "</div>"+
                                            "<p>"+
                                                "<a href='"+message+"'>" + message + "</a>" +
                                            "</p>"+
                                        "</div>"+
                                    "</li>");
                            
    scrollChat(room);
}

// Function to move 
function assertChatWithMessages(name){
    $('#' + name + 'chat').scrollTop = $('#' + name + 'chat').scrollHeight;
    console.log($('#' + name + 'chat').scrollHeight);
}

// Function to move 
function assertChatWithMessages(name){
    $('#' + name + 'chat').scrollTop = $('#' + name + 'chat').scrollHeight;
    console.log($('#' + name + 'chat').scrollHeight);
}

// Send message the specified room //
function sendMessageToRoom(room){
    var message = $('#' + room + ' input').val();
    console.log("Message in : "+ room + " " + message);
    if(message != ""){
        socket.emit('messageToRoom', room, message);
        addMessageToRoom(room, message);
        $('#' + room + ' input').val('');
    }
}

// Send a private message //
function sendPrivateMessage(user){
    var message = $('#' + user + ' input').val();
    if (message != ""){
        socket.emit("privateMessage", user, message);
        addMessageToRoom(user, message);
        $('#' + user + ' input').val('');
    }
}

// Send attachment //
function sendAttachToRoom(room){
    var message = $('input[type=file]').val().split('\\').pop();
    if(message != ""){
        socket.emit("askForFileToRoom", room, message);
        addAtchToRoom("Me", room, message);
    }
}

// Send attachment //
function sendAttachToUser(user){
    var message = $('input[type=file]').val().split('\\').pop();
    if(message != ""){
        socket.emit("askForFileToUser", user, message);
        addAtchToRoom("Me", user, message);
    }
}

// Sets the nick of the user //
function addUser(){
    var user = $("#userName").val();
    console.log("User : " + user);
    if(user=='')
        socket.emit('getUsername');
    else
        username = user;
    socket.emit('addUsername', user);
    $("#userName").val('');
}

// Creates and opens a private talk window //
function newPrivateTalk(username){
   if(checkIfTalkAlreadyExists(username) == false){
      joinARoom(username); 
      $("#myRooms li").removeClass("active");
      $(".tab-content .active").removeClass("active");
      $("#myRooms ul").append('<li onclick=changeChat("' + username + '") id="'+username+'" class="active">'+
                                '<a data-toggle="tab"><span class="glyphicon glyphicon-user"></span> '+username+'</a>'+
                            '</li>');
     $(".tab-content").append('<div class=\"tab-pane active\" id="' + username + '">'+
                                '<div class="col-md-12">'+
                                '   <div class="panel panel-primary">'+
                                '       <div class="panel-heading">'+
                                '           <span class="glyphicon glyphicon-comment"></span> '+username+
                                '           <div class="btn-group pull-right">'+
                                '               <button onclick=closeChat("'+username+'") type="button" class="btn btn-default btn-xs">'+
                                '                   <span class="glyphicon glyphicon-remove"></span>'+
                                '               </button>'+
                                '           </div>'+
                                '       </div>'+
                                '       <div class="panel-body">'+
                                '           <ul class="chat '+username+'">'+
                                '           </ul>'+
                                '       </div>'+
                                '       <div class="panel-footer">'+
                                '           <div class="input-group">'+
                                '               <input id="btn-input '+ username +'" onkeydown=\'if (event.keyCode == 13) enterClicked("'+username+'", "user")\' class="form-control input-sm" placeholder="Escreva aqui a tua mensagem..." type="text">'+
                                '               <span class="input-group-btn">'+
                                '                   <button class="btn btn-warning btn-sm" id="btn-chat" onclick=sendPrivateMessage("' + username + '")>Enviar</button>'+
                                '               </span></div>'+
                                '                <div class="input-group-btn">'+
                                '                    <form action="/upload" enctype="multipart/form-data" method="post">'+  
                                '                       <input class="btn btn-info btn-sm" type="file" name="upload" multiple="multiple">'+
                                '                       <button id="'+username+'" class="btn btn-info btn-sm" type="submit" value="Enviar" onclick=sendAttachToUser("' + username + '")>Enviar anexo(s) <span class="glyphicon glyphicon-paperclip"></span></button>'+
                                '                    </form>'+
                                '               </div>'+
                                '       </div>'+
                                '   </div>'+
                                '</div>'+
                            '</div>');
    }
}

// Creates a new room //
function newRoom(){
    var roomName = $("#roomName").val();
    
    var user_pat = /^[a-z][a-z0-9-@!?_\.]{4,20}$/i;
    if (!user_pat.test(roomName)){
        if ($('.error-room').is(':empty'))
            $(".error-room").append('Entre 5 a 20 caracteres, sem espaços.<br>Obrigatório começar por uma letra.');

        return;
    }else
        $(".error-room").empty();

    if(roomName != ''){
        socket.emit('newRoom', roomName);
        socket.emit('joinRoom', roomName);
        $("#roomName").val('');
    }
}

// Opens a chat window for the room //
function expandRoom(room){ 
    if(checkIfTalkAlreadyExists(room) == false){
      joinARoom(room); 
      $("#myRooms ul").append("<li onclick=changeChat(\""+room+"\") class=\"active "+room+"\" room ><a href=\"#"+room+"\" data-toggle=\"tab\">"+room+"</a></li>");
      $(".tab-content>div.active").removeClass("active");
      $(".tab-content").append("<div class=\"tab-pane active\" id=\""+room+"\"><div class=\"col-md-12 tab-content\" style=\"text-align: justify;\"><div class=\"tab-inside-content\"> <div class=\"panel panel-primary\"><div class=\"panel-heading\"><span class=\"glyphicon glyphicon-comment\"></span> "+room+" <div class=\"btn-group pull-right\"><button type=\"button\" class=\"btn btn-default btn-xs dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"glyphicon glyphicon-chevron-down\"></span></button></div></div><div class=\"panel-body chat\"></div><div class=\"panel-footer\"><div class=\"input-group\"><input id=\"btn-input\" type=\"text\" onkeydown=\"if (event.keyCode == 13) document.getElementById('btn-chat').click()\" class=\"form-control input-sm\" placeholder=\"Escreve aqui a tua mensagem...\"><span class=\"input-group-btn\"><button class=\"btn btn-warning btn-sm\" onclick=sendMessageToRoom(\"" + room + "\") id=\"btn-chat\">Enviar</button><button class=\"btn btn-info btn-sm\" id=\"btn-chat\">Anexar ficheiro <span class=\"glyphicon glyphicon-paperclip\"></span> </button></span></div></div></div></div></div>");
    }
}

function expandRoom(roomName){ 
    if(checkIfTalkAlreadyExists(roomName) == false){
      joinARoom(roomName); 
      $("#myRooms li").removeClass("active");
      $(".tab-content .active").removeClass("active");
      $("#myRooms ul").append('<li onclick=changeChat("' + roomName + '") id="'+roomName+'" class="active">'+
                                '<a data-toggle="tab"><span class="glyphicon glyphicon-globe"></span> '+roomName+'</a>'+
                            '</li>');
      $(".tab-content").append('<div class=\"tab-pane active\" id="' + roomName + '">'+
                                    '<div class="col-md-12">'+
                                    '   <div class="panel panel-primary">'+
                                    '       <div class="panel-heading">'+
                                    '           <span class="glyphicon glyphicon-comment"></span> '+roomName+
                                    '           <div class="btn-group pull-right">'+
                                    '               <button onclick=closeChat("'+roomName+'") type="button" class="btn btn-default btn-xs">'+
                                    '                   <span class="glyphicon glyphicon-remove"></span>'+
                                    '               </button>'+
                                    '           </div>'+
                                    '       </div>'+
                                    '       <div class="panel-body">'+
                                    '           <ul class="chat '+roomName+'">'+
                                    '           </ul>'+
                                    '       </div>'+
                                    '       <div class="panel-footer">'+
                                    '           <div class="input-group">'+
                                    '               <input id="btn-input '+ roomName +'" onkeydown=\'if (event.keyCode == 13) enterClicked("'+roomName+'", "room")\' class="form-control input-sm" placeholder="Escreva aqui a tua mensagem..." type="text">'+
                                    '               <span class="input-group-btn">'+
                                    '                   <button class="btn btn-warning btn-sm" id="btn-chat" onclick=sendMessageToRoom("' + roomName + '")>Enviar</button>'+
                                    '               </span></div>'+
                                    '                <div class="input-group-btn">'+
                                    '                    <form action="/upload" enctype="multipart/form-data" method="post">'+  
                                    '                       <input class="btn btn-info btn-sm" type="file" name="upload" multiple="multiple">'+
                                    '                       <button id="'+roomName+'" class="btn btn-info btn-sm" type="submit" value="Enviar" onclick=sendAttachToRoom("' + roomName + '")>Enviar anexo(s) <span class="glyphicon glyphicon-paperclip"></span></button>'+
                                    '                    </form>'+
                                    '               </div>'+
                                    '       </div>'+
                                    '   </div>'+
                                    '</div>'+
                                '</div>');
    }
}

// Change active chat //
function changeChat(chatName){
    $(".tab-content .active").removeClass('active');
    $("#myRooms .active").removeClass('active');
    $('.tab-content #'+chatName).addClass('active');
    $('#myRooms #'+chatName).addClass('active');
}

function checkIfTalkAlreadyExists(name){
    if($("."+name+"").length != 0)
        return true;
    else
        return false;
}

// Join a room //
function joinARoom(room){
    socket.emit('joinRoom', room);
}

// Leave a room //
function leaveARoom(room){
    socket.emit('leaveRoom', room);
}

// Initialize icons //
function initializeEmoticons(){
    definition = {smile:{title:"Smile",codes:[":)",":=)",":-)"]},"sad-smile":{title:"Sad Smile",codes:[":(",":=(",":-("]},"big-smile":{title:"Big Smile",codes:[":D",":=D",":-D",":d",":=d",":-d"]},crying:{title:"Crying",codes:[";(",";-(",";=("]},kiss:{title:"Kiss",codes:[":*",":=*",":-*"]},"tongue-out":{title:"Tongue Out",codes:[":P",":=P",":-P",":p",":=p",":-p"]},worried:{title:"Worried",codes:[":S",":-S",":=S",":s",":-s",":=s"]},heart:{title:"Heart",codes:["(h)","<3","(H)","(l)","(L)"]},drunk:{title:"Drunk",codes:["(drunk)"]},tmi:{title:"TMI",codes:["(tmi)"]}};
    $.emoticons.define(definition);
}

function scrollChat(name){
    $('#' + name + ' .panel-body')[0].scrollTop = $('#' + name + ' .panel-body')[0].scrollHeight;
}

function closeChat(id){
    console.log("closing " + id);
    $(".tab-content .active").removeClass('active');
    $(".tab-content #"+id).remove();
    var children = $("#myRooms ul").children().length;
    $('#myRooms #'+id).remove();
    leaveARoom(id);

    if(children != 1){
        idr = $("#myRooms ul li:first-child").attr('id');
        $('.tab-content #'+idr).addClass('active');
        $('#myRooms #'+idr).addClass('active');
    }
}



function enterClicked(name, type){
    console.log("here");
    if(type=="room")
        sendMessageToRoom(name);
    else
        if(type=="user")
            sendPrivateMessage(name);
}           

// When a new user enters the chat //
socket.on('updateUsers', function(users){
    console.log("Users : " + users);
    console.log('Username : ' + username)
    $('#users').empty();
    for(var i=0; i<users.length; i++){
        if(users[i].username!=username)
            $('#users').append('<li><a href="#" onclick="newPrivateTalk(\''+users[i].username+'\')" id="'+users[i].username+'"><span class=\"glyphicon glyphicon-user\"></span>' + users[i].username + '</a></li>');
    }
});

// When a new room is created - update the information on the client //
socket.on('updateRooms', function(rooms){
    $('#newRooms').empty();
    for(var i=0; i<rooms.length; i++){
        $("#newRooms").append('<li onclick="expandRoom(\''+rooms[i]+'\')"><a data-toggle="tab"><span class="glyphicon glyphicon-globe">' +
                                '</span>'+rooms[i]+'</a></li>');
    }
});

// Updates chat with server messages //
socket.on('updateChat', function (username, data) {
    $("#chatEntries").append('<div class="message"><p>' + username + ' : ' + data + '</p></div>');
});

// When it receives a message from a room //
socket.on('newRoomMessage', function(username, room, message){
    addMessageFromRoom(username, room, message);
});

// When it receives a privateMessage //
socket.on('newPrivateMessage', function(sender, message){
    if(checkIfTalkAlreadyExists(sender) == false)
        newPrivateTalk(sender);
    addMessageFromPrivateUser(sender, message);
});

socket.on('newAnonymous', function(name){
    username = name; 
});

socket.on('sendFileToRoom', function(username, room, file){
    addAtchToRoom(username, room, file);
});

socket.on('sendFileToUser', function(username, file){
    addAtchToRoom(username, username, file);
});

// Function to define the the function on click of the classes in the jade file //
$(function(){
    initializeEmoticons();
    $('#login-zone').css({
      position: 'relative',
      top     : 0,
      left    : 0,
      zIndex  : 10000
     });
     
    var w = $(window).width();
    var h = $(window).height();
    var $overlay = $('<div/>', {
      'id': 'overlay',
      css: {
       position   : 'absolute',
       height     : h + 'px',
       width      : w + 'px',
       left       : 0,
       top        : 0,
       background : '#000',
       opacity    : 0.5,
       zIndex     : 9999
      }
     }).appendTo('body');
    $("#btn-new-room").click(function() {newRoom()});
    $("#btn-new-user").click(function() {addUser()});
    $('#btn-login').click(function(){
        addUser();
        $('#overlay').remove();
        $('#login-zone').remove();
    });
});
