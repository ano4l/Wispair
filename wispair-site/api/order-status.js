const { sendEmail } = require("./_email-templates");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const { reference, status, fulfilmentNote } = req.body || {};
  const template = { "Order confirmed": "confirmed", "On its way": "on_the_way", Delivered: "delivered" }[status];
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !reference || !template) return res.status(400).json({ error: "Invalid status update" });
  const lookup = await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}&select=*`, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
  const rows = await lookup.json();
  if (!lookup.ok || !rows[0]) return res.status(404).json({ error: "Order not found" });
  const order = rows[0];
  const updated = await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}`, { method: "PATCH", headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ status, fulfilment_note: fulfilmentNote || "", updated_at: new Date().toISOString() }) });
  if (!updated.ok) return res.status(502).json({ error: "Could not update order" });
  await sendEmail(order, template, order.email);
  return res.status(200).json({ ok: true });
};
