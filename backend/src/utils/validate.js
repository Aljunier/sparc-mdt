// Check if a value is a non-empty string
export function isNonEmptyString(value, maxLength = Infinity, minLength = 1) {
  const length = value.trim().length;
  return (
    typeof value === "string" && length >= minLength && length <= maxLength
  );
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

// Validate Warrant //
export function validateWarrant(data) {
  const errors = [];

  // Issued by: required
  if (!isValidInteger(data.issued_by)) {
    errors.push("Issued by must be a valid integer.");
  }
  // Person ID: required
  if (!isValidInteger(data.person_id)) {
    errors.push("Person ID must be a valid integer.");
  }
  // Report ID: optional
  if (data.report_id && !isValidInteger(data.report_id, true)) {
    errors.push("Report ID must be a valid integer.");
  }
  // Type: required
  // Options: arrest, search, bench, other
  if (!isValidEnum(data.type, ["arrest", "search", "bench", "other"])) {
    errors.push("Type must be one of: arrest, search, bench, other.");
  }
  // Description: required
  if (!isNonEmptyString(data.description)) {
    errors.push("Description is required and must be a non-empty string.");
  }
  // Status: required
  // Options: active, served, revoked, expired
  if (!isValidEnum(data.status, ["active", "served", "revoked", "expired"])) {
    errors.push("Status must be one of: active, served, revoked, expired.");
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

// Validate User //
export function validateUser(data, isNew = true) {
  const errors = [];

  // Username: required
  if (
    isNew &&
    (!isNonEmptyString(data.username) || data.username.length > 30)
  ) {
    errors.push(
      "Username is required and must be a non-empty string up to 30 characters."
    );
  }
  // Password: required
  if (
    isNew &&
    (!isNonEmptyString(data.password_hash) || data.password_hash.length < 8)
  ) {
    errors.push("Password is required and must be at least 8 characters long.");
  }
  // First Name: required
  if (!isNonEmptyString(data.first_name) && data.first_name.length > 50) {
    errors.push(
      "First name is required and must be a non-empty string up to 50 characters."
    );
  }
  // Last Name: required
  if (!isNonEmptyString(data.last_name) && data.last_name.length > 75) {
    errors.push(
      "Last name is required and must be a non-empty string up to 75 characters."
    );
  }
  // Call Sign: optional
  if (!isNonEmptyString(data.call_sign) && data.call_sign.length > 10) {
    errors.push("Call sign must be a string up to 10 characters.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate Person //
export function validatePerson(data) {
  const errors = [];

  // First Name: required
  if (!isNonEmptyString(data.first_name) || data.first_name.length > 50) {
    errors.push("First name is required and cannot exceed 50 characters.");
  }
  // Middle Name: optional
  if (data.middle_name && data.middle_name.length > 50) {
    errors.push("Middle name cannot exceed 50 characters.");
  }
  // Last Name: required
  if (!isNonEmptyString(data.last_name) || data.last_name.length > 75) {
    errors.push("Last name is required and cannot exceed 75 characters.");
  }
  // Date of Birth: required
  if (!isValidDate(data.dob)) {
    errors.push("Date of birth is required and must be a valid date.");
  }
  // Sex: required
  if (!isValidEnum(data.sex, ["M", "F", "X"])) {
    errors.push("Sex is required and must be one of: M, F, X.");
  }
  // Height: required
  if (!isValidInteger(data.height_in, false)) {
    errors.push("Height must be a valid integer.");
  }
  // Weight: required
  if (!isValidInteger(data.weight_lbs, false)) {
    errors.push("Weight must be a valid integer.");
  }
  // Eye Color: required
  if (!isNonEmptyString(data.eye_color) || data.eye_color.length > 20) {
    errors.push("Eye color is required and cannot exceed 20 characters.");
  }
  // Hair Color: required
  if (!isNonEmptyString(data.hair_color) || data.hair_color.length > 20) {
    errors.push("Hair color is required and cannot exceed 20 characters.");
  }
  // Address: required
  if (!isNonEmptyString(data.address) || data.address.length > 100) {
    errors.push("Address is required and cannot exceed 100 characters.");
  }
  // City: required
  if (!isNonEmptyString(data.city) || data.city.length > 50) {
    errors.push("City is required and cannot exceed 50 characters.");
  }
  // State: required
  if (!isNonEmptyString(data.state) || data.state.length != 2) {
    errors.push("State is required and must be exactly 2 characters.");
  }
  // Zip Code: required
  if (!isNonEmptyString(data.zip_code) || data.zip_code.length > 10) {
    errors.push("Zip code is required and cannot exceed 10 characters.");
  }
  // Phone Number: optional
  if (data.phone_number && data.phone_number.length > 15) {
    errors.push("Phone number cannot exceed 15 characters.");
  }
  // License Number: optional
  if (data.license_number && data.license_number.length > 20) {
    errors.push("License number cannot exceed 20 characters.");
  }
  // License State: optional
  if (data.license_state && data.license_state.length != 2) {
    errors.push("License state must be exactly 2 characters.");
  }
  // Notes: optional
  if (data.notes && data.notes.length > 65000) {
    errors.push("Notes cannot exceed 65000 characters.");
  }
  // Photo URL: optional
  if (data.photo_url && data.photo_url.length > 255) {
    errors.push("Photo URL cannot exceed 255 characters.");
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
