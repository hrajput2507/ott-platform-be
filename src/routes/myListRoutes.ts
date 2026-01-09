import { Router } from 'express';
import myListController from '../controllers/myListController';
import { 
  validateUserId, 
  validateAddToList, 
  validatePagination, 
  validateContentId 
} from '../middleware/validation';

const router = Router();

// All routes require user ID validation
router.use(validateUserId);

// Add to list - requires validation middleware
router.post('/', validateAddToList, (req, res) => myListController.addToList(req, res));

// Remove from list - requires contentId validation
router.delete('/:contentId', validateContentId, (req, res) => myListController.removeFromList(req, res));

// Get list - requires pagination validation
router.get('/', validatePagination, (req, res) => myListController.getList(req, res));

export default router;

