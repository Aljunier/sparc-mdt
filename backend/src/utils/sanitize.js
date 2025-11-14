// Sanitize string input
export function sanitizeString(value) {
  if (typeof value !== "string") return "";
  // List of characters to remove: < > / \ ' "
  return value.replace(/[<>\/\\'"]/g, "");
}

// Sanitize integer value
export function sanitizeInteger(value) {
  const sanitizedValue = parseInt(value, 10);
  return isNaN(sanitizedValue) ? null : sanitizedValue;
}

// Sanitize date value
export function sanitizeDate(value) {
  const sanitizedValue = new Date(value);
  return isNaN(sanitizedValue.getTime()) ? null : sanitizedValue;
}

// Sanitize boolean value
export function sanitizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    return value.toLowerCase() === "true";
  } else if (typeof value === "number") {
    return value === 1;
  } else {
    return null;
  }
}

// Sanitize enum value against allowed values
export function sanitizeEnum(value, allowedValues, defaultValue) {
  if (allowedValues.includes(value)) {
    return value;
  } else {
    return defaultValue;
  }
}
