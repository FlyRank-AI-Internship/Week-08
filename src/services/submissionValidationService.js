export function validateAgainstWidgetFields(
  widgetFields,
  submittedData
) {
  const errors = [];

  for (const field of widgetFields) {
    const value = submittedData[field.name];

    if (
      field.required &&
      (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      )
    ) {
      errors.push({
        field: field.name,
        message: `${field.label} is required`,
      });

      continue;
    }

    if (
      value !== undefined &&
      value !== null &&
      field.type === "email"
    ) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(String(value))) {
        errors.push({
          field: field.name,
          message: `${field.label} must be a valid email`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}