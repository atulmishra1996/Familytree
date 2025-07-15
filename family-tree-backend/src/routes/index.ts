import { Router } from 'express';
import personRoutes from './persons';
import treeRoutes from './tree';

const router = Router();

// Mount route modules
router.use('/persons', personRoutes);
router.use('/tree', treeRoutes);

export default router;