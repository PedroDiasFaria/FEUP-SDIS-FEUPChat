# FEUPChat

FEUPChat is a responsive web application used for chat conversations that can be accessed by people on every device to chat in group or individually. This project was done to improve our knowledge about distributed system applications. Since we could chose the languages and the frameworks for its development, we chose Node.js/Express for our server, since we never worked with it, and standart HTML/CSS/Javascript for the client layout.

The application allows users to :
* Send and receive messages;
* Create chat groups;
* Open private conversations;
* Multiple simaltanious chats; 
* Send and receive emoticons;
* Send and receive files;

The application uses socket.io which makes it socket-based, which basically means that all the communications are made trough sockets. When a client sends a message, the message is redirected trought the server for the other clients trought the respective socket. This is due to Node.js security characteristics, that dont allow us to send the messages directly from peer-to-peer. All the message processment is made in the respective client. 









