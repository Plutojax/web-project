exports.init = function(io){
    const connectedUsers = new Set();
    io.on('connection', (socket) => {
        console.log('A user connected.');

        // Add the connected user to the list
        socket.on('join', (username) => {
            connectedUsers.add(username);
            io.emit('user joined', Array.from(connectedUsers));
        });

        // Listen for chat messages
        socket.on('chat message', (data) => {
            const { username, message, recipient } = data;
            console.log('Received message:', message, 'from', username, 'to', recipient);

            // Send the private message to the intended recipient
            if (recipient) {
                socket.to(recipient).emit('chat message', { username, message, recipient });
            } else {
                io.emit('chat message', { username, message });
            }
        });

        // Listen for disconnections
        socket.on('disconnect', () => {
            console.log('A user disconnected.');

            // Remove the disconnected user from the list
            connectedUsers.delete(socket.username);
            io.emit('user left', Array.from(connectedUsers));
        });
    });
}