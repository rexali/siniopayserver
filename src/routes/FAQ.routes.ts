import { Router } from 'express';
import FAQController from '../controllers/FAQ.controller';
import { 
  validateFAQ, 
  validateFAQReorder 
} from '../validators/FAQ.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', FAQController.getAllFAQs);
router.get('/categories', FAQController.getFAQCategories);
router.get('/search', FAQController.searchFAQs);
router.get('/:id', FAQController.getFAQById);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'super_admin']), validateFAQ, FAQController.createFAQ);
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), validateFAQ, FAQController.updateFAQ);
router.delete('/:id', authenticate, authorize(['super_admin']), FAQController.deleteFAQ);
router.post('/reorder', authenticate, authorize(['admin', 'super_admin']), validateFAQReorder, FAQController.reorderFAQs);

export default router;