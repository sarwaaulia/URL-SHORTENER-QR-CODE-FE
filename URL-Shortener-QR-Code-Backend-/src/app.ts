import express from 'express';
import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/link.routes';
import redirectRoutes from './routes/redirect.routes';
import cors from "cors";

const app = express();
app.use(express.json())

app.use(cors({
  origin: 'https://linkzip-zeta.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/', redirectRoutes);

export default app;
