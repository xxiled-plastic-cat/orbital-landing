import { Request, Response, NextFunction } from 'express';

interface SequelizeError extends Error {
  status?: number;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

export const errorHandler = (err: SequelizeError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
    return;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      details: err.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
    return;
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: 'Referenced record does not exist'
    });
    return;
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
};

