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
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rqscelvjgsfgjvyvxbhe.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_vO3_ZqcmQd1yUlcni-36lg_Uv0bkNYJ";
  const { ORDER_EMAIL_TO } = process.env;
  
  const input = req.body || {};
  if (!input.reference || !input.email || !Array.isArray(input.items) || !input.items.length) {
    return json(res, 400, { error: "Missing order details" });
  }

  const order = {
    reference: String(input.reference),
    customer: String(input.customer || ""),
    email: String(input.email),
    phone: String(input.phone || ""),
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
  } catch (dbErr) {
    console.warn("[Orders API] Supabase store notice:", dbErr);
  }

  // Dispatch Resend emails in parallel
  const emailTasks = [
    sendEmail(order, "submitted", order.email)
  ];
  if (ORDER_EMAIL_TO && ORDER_EMAIL_TO !== order.email) {
    emailTasks.push(sendEmail(order, "submitted", ORDER_EMAIL_TO));
  }

  await Promise.allSettled(emailTasks);

  return json(res, 201, { order, saved: dbSaved });
};

