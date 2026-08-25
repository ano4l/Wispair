const { sendEmail, statusEmailTemplates } = require("./_email-templates");

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

  const { reference, status, fulfilmentNote, order: passedOrder } = req.body || {};
  const template = statusEmailTemplates[status];

  if (!reference || !template) {
    return json(res, 400, { error: "Invalid status or missing order reference" });
  }

  let order = passedOrder || null;
  let dbFound = false;

  try {
    const lookup = await fetch(`${supabaseUrl}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}&select=*`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });
    if (lookup.ok) {
      const rows = await lookup.json();
      if (rows && rows[0]) {
        order = { ...rows[0], ...(passedOrder || {}) };
        dbFound = true;
      }
    }
  } catch (lookupErr) {
    console.warn("[Status API] Supabase lookup notice:", lookupErr);
  }

  if (!order || !order.email) {
    if (passedOrder && passedOrder.email) {
      order = passedOrder;
    } else {
      return json(res, 404, { error: "Order details not found to dispatch email update" });
    }
  }

  // Update order object with new status and note
  order.status = status;
  order.fulfilment_note = fulfilmentNote || order.fulfilment_note || order.fulfilmentNote || "";

  // Attempt database patch
  if (dbFound) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          status,
          fulfilment_note: order.fulfilment_note,
          updated_at: new Date().toISOString()
        })
      });
    } catch (patchErr) {
      console.warn("[Status API] Supabase patch notice:", patchErr);
    }
  }

  // Send Resend status notification email to customer
  const emailSent = await sendEmail(order, template, order.email);

  return json(res, 200, { ok: true, reference, status, emailSent });
};

