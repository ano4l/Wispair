const { sendEmail } = require("./_email-templates");

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ORDER_EMAIL_TO } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: "Order persistence is not configured" });
  const input = req.body || {};
  if (!input.reference || !input.email || !Array.isArray(input.items) || !input.items.length) return json(res, 400, { error: "Missing order details" });
  const order = { reference: String(input.reference), customer: String(input.customer || ""), email: String(input.email), phone: String(input.phone || ""), notes: String(input.notes || ""), items: input.items, subtotal: Number(input.subtotal || 0), discount: Number(input.discount || 0), total: Number(input.total || 0), status: "Payment review", proof_name: String(input.proofName || ""), proof_note: String(input.proofNote || ""), created_at: new Date().toISOString() };
  const saved = await fetch(`${SUPABASE_URL}/rest/v1/orders`, { method: "POST", headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(order) });
  if (!saved.ok) return json(res, 502, { error: "Could not save order" });
  await Promise.all([sendEmail(order, "submitted", order.email), sendEmail(order, "submitted", ORDER_EMAIL_TO)]);
  return json(res, 201, { order });
};
