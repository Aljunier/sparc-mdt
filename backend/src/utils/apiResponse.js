export function sendError(res, statusCode, message, errors = []) {
  const response = { message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
}

export function sendSuccess(
  res,
  data = {},
  statusCode = 200,
  resObj = {},
  message = "Success"
) {
  return res.status(statusCode).json({ message, data, ...resObj });
}
