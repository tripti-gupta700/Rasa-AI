import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file at the root
dotenv.config({ path: '../.env' });

const app: Application = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---
// TODO: Import and use routes from the routes/ directory
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Rasa AI Backend is running!');
});

// --- Database Connection ---
// TODO: Import and call the database connection function
// connectDB();

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});