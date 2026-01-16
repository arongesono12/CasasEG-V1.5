import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import usersRouter from './routes/users.js';
import propertiesRouter from './routes/properties.js';
import messagesRouter from './routes/messages.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use('/api/users', usersRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => res.send('CasasEG backend proxy running'));

app.listen(port, () => console.log(`Server listening on port ${port}`));
