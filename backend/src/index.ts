import app from './app';
import { env } from './config/env';

app.get('/', (req, res) => {
	res.send('Hello, World!');
});

app.listen(env.port, () => {
	console.log(`API running on http://localhost:${env.port}`);
});
