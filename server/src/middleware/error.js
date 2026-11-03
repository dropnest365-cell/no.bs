export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(error, req, res, _next) {
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  if (error?.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }
  if (error?.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (error?.code === 'P2003') {
    return res.status(409).json({ error: 'This record is still referenced by other data' });
  }

  const status = error instanceof ApiError ? error.status : 500;
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, error);
  }
  const body = {
    error: status >= 500 ? 'Something went wrong on the server' : error.message,
  };
  if (error instanceof ApiError && error.details) body.details = error.details;
  res.status(status).json(body);
}
