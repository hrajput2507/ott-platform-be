import { Request, Response } from 'express';
import myListService from '../services/myListService';

export class MyListController {
  /**
   * Add item to My List
   * POST /api/my-list
   */
  async addToList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { contentId, contentType } = req.body;

      await myListService.addToList(userId, contentId, contentType);
      res.status(201).json({ 
        message: 'Item added to list successfully',
        data: { contentId, contentType }
      });
    } catch (error: any) {
      if (error.message === 'Movie not found' || error.message === 'TV Show not found') {
        res.status(404).json({ 
          error: error.message,
          code: 'CONTENT_NOT_FOUND'
        });
        return;
      }
      if (error.message === 'Item already in list') {
        res.status(409).json({ 
          error: error.message,
          code: 'DUPLICATE_ITEM'
        });
        return;
      }
      console.error('Error adding to list:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Remove item from My List
   * DELETE /api/my-list/:contentId
   */
  async removeFromList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { contentId } = req.params;

      await myListService.removeFromList(userId, contentId);
      res.status(200).json({ 
        message: 'Item removed from list successfully',
        data: { contentId }
      });
    } catch (error: any) {
      if (error.message === 'Item not found in list') {
        res.status(404).json({ 
          error: error.message,
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }
      console.error('Error removing from list:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get user's list with pagination
   * GET /api/my-list?page=1&pageSize=10
   */
  async getList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const startTime = Date.now();
      const result = await myListService.getList(userId, page, pageSize);
      const duration = Date.now() - startTime;

      // Log performance (for monitoring)
      if (duration > 10) {
        console.warn(`⚠️  List query took ${duration}ms (target: <10ms)`);
      } else {
        console.log(`✅ List query completed in ${duration}ms`);
      }

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error getting list:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

export default new MyListController();

