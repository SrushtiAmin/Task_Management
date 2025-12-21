import { Request, Response, NextFunction } from 'express';
import { upload } from '../uploads/upload';

export const uploadTaskAttachment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
    next();
  });
};
