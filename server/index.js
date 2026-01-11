import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import propertiesRouter from './routes/properties.js';
import messagesRouter from './routes/messages.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => res.send('CasasEG backend proxy running'));

app.listen(port, () => console.log(`Server listening on port ${port}`));
