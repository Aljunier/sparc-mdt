// Check if a value is a non-empty string
export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Check if a value is a valid integer
export function isValidInteger(value, allowZero = false) {
  const num = parseInt(value, 10);
  return Number.isInteger(num) && (allowZero ? num >= 0 : num > 0);
}

// Check if a value is a valid date
export function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// Check if a value is a valid enum
export function isValidEnum(value, allowedValues) {
  return allowedValues.includes(value);
}

// Check if a value is a boolean
export function isBoolean(value) {
  return typeof value === "boolean";
}

// Validate pagination parameters
export function validatePaginationParams(page, pageSize) {
  const errors = [];

  // Page: required, positive integer
  if (!isValidInteger(page) || page < 1) {
    errors.push("Page must be a positive integer.");
  }

  // Page Size: required, positive integer
  if (!isValidInteger(pageSize) || pageSize < 1) {
    errors.push("Page size must be a positive integer.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate Bolo //
export function validateBolo(data) {
  const errors = [];

  // Issued by: required
  if (!isValidInteger(data.issued_by)) {
    errors.push("Issued by must be a valid integer.");
  }

  // Report ID: optional
  if (data.report_id && !isValidInteger(data.report_id, true)) {
    errors.push("Report ID must be a valid integer.");
  }

  // Type: required
  if (!isValidEnum(data.type, ["person", "vehicle", "other"])) {
    errors.push("Type must be one of: person, vehicle, other.");
  }

  // Title: required
  if (!isNonEmptyString(data.title)) {
    errors.push("Title is required and must be a non-empty string.");
  }

  // Description: required
  if (!isNonEmptyString(data.description)) {
    errors.push("Description is required and must be a non-empty string.");
  }

  // Status: optional
  // Options: active, resolved, cancelled, expired
  if (
    data.status &&
    !isValidEnum(data.status, ["active", "resolved", "cancelled", "expired"])
  ) {
    errors.push("Status must be one of: active, resolved, cancelled, expired.");
  }

  // Priority: optional
  // Options: low, medium, high
  if (data.priority && !isValidEnum(data.priority, ["low", "medium", "high"])) {
    errors.push("Priority must be one of: low, medium, high.");
  }

  // Expires at: optional
  if (data.expires_at && !isValidDate(data.expires_at)) {
    errors.push("Expires at must be a valid date.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate User Notification //
export function validateUserNotification(data) {
  const errors = [];

  // User ID: required
  if (!isValidInteger(data.user_id)) {
    errors.push("User ID must be a valid integer.");
  }

  // Type: required
  if (!isValidEnum(data.type, ["general", "error", "success"])) {
    errors.push("Type must be one of: general, error, success.");
  }
  // Title: required
  if (!isNonEmptyString(data.title)) {
    errors.push("Title is required and must be a non-empty string.");
  }
  // Message: required
  if (!isNonEmptyString(data.message)) {
    errors.push("Message is required and must be a non-empty string.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
