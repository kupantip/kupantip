import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { initializeSocket } from './socket/chat.socket';

app.get('/', (req, res) => {
	res.send('Hello, World!');
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

const server = httpServer.listen(env.port, () => {
	console.log(`API running on http://localhost:${env.port}`);
	console.log(`Socket.IO server initialized`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
	if (error.code === 'EADDRINUSE') {
		console.error('------------------------------------------------');
		console.error(`Error: Port ${env.port} is already in use.`);
		console.error('Please stop the other process or use a different port.');
		console.error('------------------------------------------------');
		process.exit(1);
	} else {
		console.error('An unknown error occurred:', error);
	}
});
