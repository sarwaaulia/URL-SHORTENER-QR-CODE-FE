import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  createShortLink, 
  getLinkStats, 
  updateLink, 
  deleteLink, 
  getUserLinks
} from '../controllers/link.controller';
import { downloadQrPng } from '../controllers/qr.controller';

const router = express.Router();

router.post('/', authenticate, createShortLink);
router.get('/', authenticate, getUserLinks)
router.get('/:id/qr', authenticate, downloadQrPng);
router.get('/:id/stats', authenticate, getLinkStats);
router.put('/:id', authenticate, updateLink);
router.delete('/:id', authenticate, deleteLink);

export default router;
