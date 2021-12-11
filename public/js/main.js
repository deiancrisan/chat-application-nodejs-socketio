const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });


/*

Firstly, we use the DOM to target HTML elements that will be updated. Then, we use QS library to parse username and room from the URL. Setting ignoreQueryPrefix to true will omit the characters in the URL string.

Next, we initialised client-side socket.io. Then, we emit the joinRoom event to the server. Earlier, we saw how the server listened and handled this event. 


*/

/* 

Receiving events the server sent.
The server emits the roomUsers event, which sends the current users in a room and the room name. In our frontend code, we listen to this event and use the DOM to update the room name and active users list. We will handle the outputRoomName(name) and outputUsers(users) functions much later. 

*/

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
}) ;


/* 

  The server emits a message event and sends "Messages are limited to this room!" as payload. On the frontend, we listen to the event and update the UI with the payload. We'll handle the outputMessage(message) soon. The chatMessages.scrollTop = chatMessages.scrollHeight enables the page to always scroll to the latest message. 



*/


socket.on('message', (message) =>{

  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


/* 

  We begin by adding a submit event listener and preventing the form default behaviour with e.preventDefault(). Next, we target the text value the value in the message box. In chat.html, the form input has an id of msg, and so we targe the element by using e.target.elements.msg.value. THe msg.trim() removes whitespace from both sides of the message string. If there is no message, end the function call. On the other hand, if there's a message, emit the chatMessage event and the message as payload to the server. Finally, clear the message box and add keep focus on it. 

*/

// Handle the message box
// Message submit
chatForm.addEventListener('submit', (e) =>{
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
})



// We update the name of the room the user is currently in. 
//The room argument has the room as payload
// Add room name to DOM

function outputRoomName(room){
  roomName.innerText = room;
}


// We update the current users in a room. 
/* The users argument is an array object containing the id, room and username of a user.
*/
//Add users to DOM

function outputUsers(users){
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}


// Finally, we confirm the user wants to leave a room. 

//Promt the user before leave chat room

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');

  if(leaveRoom) {
    window.location = '../index.html';
  }
})