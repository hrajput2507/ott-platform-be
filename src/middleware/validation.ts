import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate user ID header
 */
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId || userId.trim() === '') {
    res.status(401).json({ 
      error: 'User ID is required',
      code: 'MISSING_USER_ID'
    });
    return;
  }
  
  next();
};

/**
 * Middleware to validate add to list request body
 */
export const validateAddToList = (req: Request, res: Response, next: NextFunction): void => {
  const { contentId, contentType } = req.body;
  
  if (!contentId || typeof contentId !== 'string' || contentId.trim() === '') {
    res.status(400).json({ 
      error: 'contentId is required and must be a non-empty string',
      code: 'INVALID_CONTENT_ID'
    });
    return;
  }
  
  if (!contentType || typeof contentType !== 'string') {
    res.status(400).json({ 
      error: 'contentType is required and must be a string',
      code: 'INVALID_CONTENT_TYPE'
    });
    return;
  }
  
  if (contentType !== 'movie' && contentType !== 'tvshow') {
    res.status(400).json({ 
      error: 'contentType must be either "movie" or "tvshow"',
      code: 'INVALID_CONTENT_TYPE_VALUE'
    });
    return;
  }
  
  next();
};

/**
 * Middleware to validate pagination query parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = req.query.page;
  const pageSize = req.query.pageSize;
  
  if (page !== undefined) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({ 
        error: 'page must be a positive integer',
        code: 'INVALID_PAGE'
      });
      return;
    }
  }
  
  if (pageSize !== undefined) {
    const pageSizeNum = parseInt(pageSize as string, 10);
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      res.status(400).json({ 
        error: 'pageSize must be a positive integer between 1 and 100',
        code: 'INVALID_PAGE_SIZE'
      });
      return;
    }
  }
  
  next();
};

/**
 * Middleware to validate contentId parameter
 */
export const validateContentId = (req: Request, res: Response, next: NextFunction): void => {
  const { contentId } = req.params;
  
  if (!contentId || contentId.trim() === '') {
    res.status(400).json({ 
      error: 'contentId parameter is required',
      code: 'MISSING_CONTENT_ID'
    });
    return;
  }
  
  next();
};


