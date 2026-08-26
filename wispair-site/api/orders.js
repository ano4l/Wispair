const { sendEmail } = require("./_email-templates");

function json(res, status, body) {
  if (typeof res.status === "function") {
    res.status(status);
  }
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json");
  }
  if (typeof res.json === "function") {
    return res.json(body);
  }
  return res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { ORDER_EMAIL_TO } = process.env;

  if (req.method === "GET") {
    if (!supabaseUrl || !supabaseKey) return json(res, 503, { error: "Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });
    try {
      const lookup = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc&limit=200`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
      });
      if (!lookup.ok) return json(res, 502, { error: "Could not load orders from database" });
      return json(res, 200, { orders: await lookup.json() });
    } catch (error) {
      console.warn("[Orders API] Supabase lookup notice:", error);
      return json(res, 502, { error: "Could not load orders from database" });
    }
  }
  
  const input = req.body || {};
  if (!input.reference || !input.email || !Array.isArray(input.items) || !input.items.length) {
    return json(res, 400, { error: "Missing order details" });
  }
  if (!supabaseUrl || !supabaseKey) return json(res, 503, { error: "Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });

  const order = {
    reference: String(input.reference),
    customer: String(input.customer || ""),
    email: String(input.email),
    phone: String(input.phone || ""),
    delivery_method: String(input.deliveryMethod || "Delivery"),
    address: input.address && typeof input.address === "object" ? input.address : {},
    notes: String(input.notes || ""),
    items: input.items,
    subtotal: Number(input.subtotal || 0),
    discount: Number(input.discount || 0),
    total: Number(input.total || 0),
    status: "Payment review",
    proof_name: String(input.proofName || ""),
    proof_note: String(input.proofNote || ""),
    created_at: new Date().toISOString()
  };

  let dbSaved = false;
  try {
    const saved = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(order)
    });
    dbSaved = saved.ok;
    if (!saved.ok) {
      const detail = await saved.text();
      console.warn("[Orders API] Supabase rejected order:", saved.status, detail);
      return json(res, 502, { error: "Database rejected the order. Check that public.orders matches supabase/schema.sql." });
    }
  } catch (dbErr) {
    console.warn("[Orders API] Supabase store notice:", dbErr);
    return json(res, 502, { error: "Could not connect to the order database." });
  }

  // Dispatch Resend emails in parallel
  const emailTasks = [
    sendEmail(order, "submitted", order.email)
  ];
  if (ORDER_EMAIL_TO && ORDER_EMAIL_TO !== order.email) {
    emailTasks.push(sendEmail(order, "submitted", ORDER_EMAIL_TO));
  }

  await Promise.allSettled(emailTasks);

  return json(res, 201, { order, saved: true });
};
