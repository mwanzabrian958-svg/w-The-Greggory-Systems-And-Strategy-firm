const test = require("node:test");
const assert = require("node:assert/strict");
const { describeMailFailure } = require("../services/emailService");

test("classifies SMTP authentication failures without exposing provider details", () => {
  const failure = describeMailFailure({
    code: "EAUTH",
    message: "Invalid login: private provider response",
  });

  assert.equal(failure.code, "SMTP_AUTH_FAILED");
  assert.match(failure.message, /SMTP_USER and SMTP_PASS/);
  assert.doesNotMatch(failure.message, /private provider response/);
});

test("classifies SMTP connection failures", () => {
  const failure = describeMailFailure({ code: "ETIMEDOUT" });

  assert.equal(failure.code, "SMTP_CONNECTION_FAILED");
  assert.match(failure.message, /SMTP_HOST, SMTP_PORT, and SMTP_SECURE/);
});

test("uses a safe generic message for other SMTP failures", () => {
  const failure = describeMailFailure({ code: "EENVELOPE" });

  assert.equal(failure.code, "SMTP_SEND_FAILED");
  assert.match(failure.message, /server logs/);
});
