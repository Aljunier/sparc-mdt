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

export function handleDatabaseError(error, res, from = "unknown location") {
  console.error(`[${from}] Database error: ${error.code} - ${error.message}`);

  switch (error.code) {
    case "ER_DUP_ENTRY":
      return sendError(res, 409, "Duplicate entry exists");

    case "ER_NO_REFERENCED_ROW":
      return sendError(res, 400, "Referenced resource does not exist");

    case "ER_NO_REFERENCED_ROW_2":
      return sendError(res, 400, "Referenced resource does not exist");

    case "ER_ROW_IS_REFERENCED_2":
      return sendError(
        res,
        409,
        "Cannot delete due to being referenced by other records"
      );

    case "ER_BAD_NULL_ERROR":
      return sendError(res, 400, "Required field cannot be null");

    case "ER_DATA_TOO_LONG":
      return sendError(res, 400, "Input value exceeds maximum length");

    case "ER_LOCK_DEADLOCK":
    case "ER_LOCK_WAIT_TIMEOUT":
      return sendError(
        res,
        503,
        "Service temporarily unavailable, please retry"
      );

    case "ECONNREFUSED":
    case "ER_ACCESS_DENIED_ERROR":
      return sendError(res, 503, "Database connection error");

    case "ER_BAD_FIELD_ERROR":
    case "ER_NO_SUCH_TABLE":
      // These are code/deployment errors, not user errors
      return sendError(res, 500, "Internal server error");

    default:
      return sendError(res, 500, "Internal server error");
  }
}
