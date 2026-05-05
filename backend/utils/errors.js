export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const notFound = (res, resource = 'Resource') => {
  return res.status(404).json({ message: `${resource} not found` });
};
