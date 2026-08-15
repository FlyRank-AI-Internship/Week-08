export async function sendSubmissionNotification({
  submission,
  widget,
}) {
  if (
    process.env.SIDE_EFFECT_ENABLED !== "true"
  ) {
    return;
  }

  if (
    process.env.SIDE_EFFECT_FORCE_FAIL === "true"
  ) {
    throw new Error(
      "Forced side-effect failure for testing"
    );
  }

  // Fake email / notification.
  // This is intentionally enough for the capstone core.
  console.log(
    JSON.stringify({
      type: "submission_notification",
      status: "sent",
      submissionId: submission.id,
      widgetId: widget.id,
    })
  );
}