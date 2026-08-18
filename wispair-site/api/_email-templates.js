const money = (value) => `R${Number(value || 0).toFixed(2)}`;

const itemsText = (order) => (order.items || []).map((item) => `${item.qty || 1} x ${item.name || "WISPAIR item"}`).join("\n");

const templates = {
  submitted: (order) => ({ subject: `Order received · ${order.reference}`, text: `Hi ${order.customer || "there"},\n\nWe received your WISPAIR order ${order.reference}.\n\n${itemsText(order)}\n\nTotal: ${money(order.total)}\n\nYour order is now awaiting EFT payment review. We will confirm it once the payment is matched.\n\nThank you,\nWISPAIR`, html: `<h1>Order received</h1><p>Hi ${order.customer || "there"},</p><p>We received your WISPAIR order <strong>${order.reference}</strong>.</p><p>${itemsText(order).replace(/\n/g, "<br>")}</p><p><strong>Total: ${money(order.total)}</strong></p><p>Your order is awaiting EFT payment review. We will confirm it once the payment is matched.</p><p>Thank you,<br>WISPAIR</p>` }),
  confirmed: (order) => ({ subject: `Payment confirmed · ${order.reference}`, text: `Hi ${order.customer || "there"},\n\nYour payment for WISPAIR order ${order.reference} has been confirmed. We are preparing your order now.\n\nTotal: ${money(order.total)}\n\nWISPAIR`, html: `<h1>Payment confirmed</h1><p>Hi ${order.customer || "there"},</p><p>Your payment for order <strong>${order.reference}</strong> has been confirmed. We are preparing it now.</p><p>Total: ${money(order.total)}</p><p>WISPAIR</p>` }),
  on_the_way: (order) => ({ subject: `Your WISPAIR order is on its way · ${order.reference}`, text: `Hi ${order.customer || "there"},\n\nYour WISPAIR order ${order.reference} is on its way.\n\nWISPAIR`, html: `<h1>Your order is on its way</h1><p>Hi ${order.customer || "there"},</p><p>Your WISPAIR order <strong>${order.reference}</strong> is on its way.</p><p>WISPAIR</p>` }),
  delivered: (order) => ({ subject: `Order delivered · ${order.reference}`, text: `Hi ${order.customer || "there"},\n\nYour WISPAIR order ${order.reference} has been marked delivered. We hope you love your lashes.\n\nWISPAIR`, html: `<h1>Order delivered</h1><p>Hi ${order.customer || "there"},</p><p>Your WISPAIR order <strong>${order.reference}</strong> has been marked delivered. We hope you love your lashes.</p><p>WISPAIR</p>` })
};

async function sendEmail(order, templateName, recipient) {
  const { RESEND_API_KEY, ORDER_EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !ORDER_EMAIL_FROM || !recipient) return false;
  const email = templates[templateName](order);
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: ORDER_EMAIL_FROM, to: [recipient], subject: email.subject, text: email.text, html: email.html }) });
  return response.ok;
}

module.exports = { templates, sendEmail };
