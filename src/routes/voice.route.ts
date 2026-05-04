import { Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { processVoiceTransaction, uploadMiddleware } from '../controllers/voice.controller';

const router = Router();

// Enable CORS for voice routes specifically
router.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173",
      "https://smart-money-tracker.vercel.app",
      "https://smart-money-tracker-git-frontend-branch-smart-money-tracker.vercel.app"
    ];
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.includes('smart-money-tracker') && origin.includes('vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 200
}));

// Handle preflight requests for voice routes
router.options('*', (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

/**
 * @route POST /api/voice/process
 * @desc Process voice file and extract transaction data
 * @access Public
 */
router.post('/process', uploadMiddleware, processVoiceTransaction);

export default router;

