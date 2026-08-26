function isOwnerRequest(req) {
  const configuredPin = String(process.env.OWNER_PIN || "");
  const requestPin = String(req.headers?.["x-owner-pin"] || "");
  return Boolean(configuredPin && requestPin && requestPin === configuredPin);
}

module.exports = { isOwnerRequest };
