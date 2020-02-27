import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';

export const advancedResults = (model: Model<any>, populate: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const queryStr = JSON.stringify(req.query);
  const queryStrWith$Sign = queryStr.replace(/\b(lt|gte|lte|gt|in)\b/g, (match) => '$' + match);
  const modifiedQuery = JSON.parse(queryStrWith$Sign);

  const keysToBeDeletedFromOriginalQueryStr = ['select', 'sort', 'page', 'limit'];

  keysToBeDeletedFromOriginalQueryStr.forEach((key) => delete modifiedQuery[key]);

  let query = model.find(modifiedQuery);

  if (req.query.select) {
    const selectBy = req.query.select.split(',').join(' ');
    query = query.select(selectBy);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('createdAt');
  }

  // pagination
  const pagination: any = {};
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 25;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;

  const total = await model.countDocuments();

  if (endIdx < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIdx > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  query = query.skip(startIdx).limit(limit);
  query = query.populate(populate);

  const data = await query.exec();

  next();
};
