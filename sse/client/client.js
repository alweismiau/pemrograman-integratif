const EventSource = require('eventsource');

const eventSource = new EventSource("http://localhost:3030");

function updateMessage(message) {
	console.log(message);
}

eventSource.onmessage = (event) => {
	updateMessage(event.data);
};

eventSource.onerror = () => {
	updateMessage("Server closed connection");
	eventSource.close();
};