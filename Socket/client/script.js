const socket = io(); // Establishes a WebSocket connection

socket.emit('message', 'Hi'); // Emits a 'message' event with the data 'Hi'

socket.on('notification', (data) => { // Listens for a 'notification' event
    console.log(`New notification: ${data}`); // Logs the received notification data
});
