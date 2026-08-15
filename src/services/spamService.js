export function detectSpam(submission) {
  // Honeypot:
  // legitimate users should never fill this hidden field.
  if (
    submission.website &&
    submission.website.trim() !== ""
  ) {
    return {
      spam: true,
      reason: "honeypot",
    };
  }

  return {
    spam: false,
    reason: null,
  };
}