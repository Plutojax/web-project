/**
 * Initializes a Socket.IO server instance.
 *
 * This function sets up event listeners for when a client connects,
 * sends a chat message, and disconnects. It maintains a set of currently
 * connected users and emits updates when a user joins or leaves.
 *
 * @function
 * @param {Object} io - A Socket.IO server instance.
 */
exports.init = function(io){
    const connectedUsers = new Set();
    /**
     * Event listener for client connections.
     *
     * On a 'connection' event, this function emits 'user joined' updates and
     * sets up listeners for 'chat message' and 'disconnect' events.
     */
    io.on('connection', (socket) => {
        console.log('A user connected.');

        // Add the connected user to the list
        socket.on('join', (username) => {
            connectedUsers.add(username);
            io.emit('user joined', Array.from(connectedUsers));
        });

        // Listen for chat messages
        /**
         * Event listener for 'chat message' events.
         *
         * On a 'chat message' event, this function emits the chat message either
         * to a specific recipient (if a recipient is specified), or to all connected
         * users.
         */
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
        /**
         * Event listener for 'disconnect' events.
         *
         * On a 'disconnect' event, this function removes the disconnected user from
         * the list of connected users and emits a 'user left' update.
         */
        socket.on('disconnect', () => {
            console.log('A user disconnected.');

            // Remove the disconnected user from the list
            connectedUsers.delete(socket.username);
            io.emit('user left', Array.from(connectedUsers));
        });
    });
}