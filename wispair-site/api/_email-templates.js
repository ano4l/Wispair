const money = (value) => `R${Number(value || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusEmailTemplates = {
  "Order confirmed": "confirmed",
  "On its way": "on_the_way",
  "Delivered": "delivered"
};

const itemsText = (order) => (order.items || []).map((item) => `• ${item.qty || 1}x ${item.name || "WISPAIR Lash"} — ${money(Number(item.price || 0) * Number(item.qty || 1))}`).join("\n");

const itemsHtmlRows = (order) => (order.items || []).map((item) => `
  <tr>
    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;">
      <strong>${item.name || "WISPAIR Lash Item"}</strong> <span style="color: #888;">&times; ${item.qty || 1}</span>
    </td>
    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #100b0e; font-size: 14px; text-align: right; font-weight: 700;">
      ${money(Number(item.price || 0) * Number(item.qty || 1))}
    </td>
  </tr>
`).join("");

const emailWrap = (title, preheader, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171316;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e7e1e5;">
          <!-- Header -->
          <tr>
            <td style="background-color: #100b0e; padding: 26px 30px; text-align: center;">
              <span style="display: block; font-size: 24px; font-weight: 900; letter-spacing: 0.08em; color: #ffffff; text-transform: uppercase;">WISPAIR</span>
              <span style="display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; color: #faa1d4; text-transform: uppercase; margin-top: 4px;">Softness You Can Feel</span>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px 24px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8fa; padding: 22px 30px; text-align: center; border-top: 1px solid #eee8ec; font-size: 12px; color: #756b72; line-height: 1.5;">
              <p style="margin: 0 0 6px; font-weight: 700; color: #100b0e;">WISPAIR Luxury Lashes</p>
              <p style="margin: 0 0 6px;">Questions about your order? Message us on Instagram <a href="https://instagram.com/wispairofficial" style="color: #c23d8d; font-weight: 700; text-decoration: none;">@wispairofficial</a></p>
              <p style="margin: 0; color: #a0979e; font-size: 11px;">&copy; 2026 WISPAIR. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const templates = {
  submitted: (order) => ({
    subject: `Order Received · ${order.reference}`,
    text: `Hi ${order.customer || "there"},\n\nThank you for your WISPAIR order (${order.reference})!\n\nORDER SUMMARY:\n${itemsText(order)}\n${order.discount ? `Discount: -${money(order.discount)}\n` : ""}Total: ${money(order.total)}\n\nEFT PAYMENT DETAILS:\nBank: First National Bank (FNB)\nAccount: 62793660103\nBranch: 250655\nReference: ${order.reference}\n\nYour order is currently awaiting EFT payment verification. Once payment is confirmed, we will begin packing your order.\n\nThank you,\nWISPAIR Team`,
    html: emailWrap(
      `Order Received · ${order.reference}`,
      `Thank you for your order with WISPAIR. Reference: ${order.reference}`,
      `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 4px 12px; background: #fff3d8; color: #7c5310; border-radius: 999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Payment Review</span>
        <h1 style="margin: 12px 0 6px; font-size: 22px; color: #100b0e; font-weight: 800;">Order Received</h1>
        <p style="margin: 0; color: #6b646a; font-size: 14px;">Hi <strong>${order.customer || "there"}</strong>, we've received your order and reserved your items.</p>
      </div>

      <!-- Reference Card -->
      <div style="background: #fdf2f8; border: 1.5px dashed #f5c4df; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 24px;">
        <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #9d2d70;">Your EFT Payment Reference</span>
        <strong style="display: block; font-size: 24px; letter-spacing: 0.06em; color: #100b0e; margin: 4px 0;">${order.reference}</strong>
        <span style="display: block; font-size: 12px; color: #6b646a;">Please use this exact reference when making your EFT payment.</span>
      </div>

      <!-- Bank Transfer Details -->
      <div style="background: #faf8fa; border: 1px solid #eee8ec; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <strong style="display: block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #100b0e; margin-bottom: 10px;">WISPAIR Bank Details</strong>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #4b4248;">
          <tr>
            <td style="padding: 4px 0; color: #756b72;">Bank</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #100b0e;">First National Bank (FNB)</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #756b72;">Account Number</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #100b0e;">62793660103</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #756b72;">Branch Code</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #100b0e;">250655</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #756b72;">Account Name</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #100b0e;">WISPAIR</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #756b72;">Amount Due</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 900; color: #c23d8d; font-size: 15px;">${money(order.total)}</td>
          </tr>
        </table>
      </div>

      <!-- Order Items Summary -->
      <div style="margin-bottom: 24px;">
        <strong style="display: block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #100b0e; margin-bottom: 10px;">Order Items</strong>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%;">
          ${itemsHtmlRows(order)}
          ${order.discount ? `
            <tr>
              <td style="padding: 8px 0; color: #9d2d70; font-size: 13px; font-weight: 700;">Bundle Discount</td>
              <td style="padding: 8px 0; text-align: right; color: #9d2d70; font-size: 13px; font-weight: 700;">−${money(order.discount)}</td>
            </tr>
          ` : ""}
          <tr>
            <td style="padding: 12px 0 0; color: #100b0e; font-size: 15px; font-weight: 800;">Total Due</td>
            <td style="padding: 12px 0 0; text-align: right; color: #100b0e; font-size: 16px; font-weight: 900;">${money(order.total)}</td>
          </tr>
        </table>
      </div>

      ${order.notes ? `
        <div style="background: #faf8fa; border: 1px solid #eee8ec; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #6b646a;">
          <strong style="color: #100b0e;">Your Delivery/Collection Note:</strong> ${order.notes}
        </div>
      ` : ""}

      <p style="margin: 0; color: #6b646a; font-size: 13px; text-align: center; line-height: 1.5;">
        As soon as the bank transfer is confirmed by our team, we will begin packing your order and send you a dispatch update.
      </p>
      `
    )
  }),

  confirmed: (order) => ({
    subject: `Payment Confirmed · ${order.reference}`,
    text: `Hi ${order.customer || "there"},\n\nGreat news! Your payment for WISPAIR order ${order.reference} has been confirmed.\n\nWe are now packing your lash order.\n\nTotal: ${money(order.total)}\n\nThank you,\nWISPAIR Team`,
    html: emailWrap(
      `Payment Confirmed · ${order.reference}`,
      `Your payment for order ${order.reference} has been verified.`,
      `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 4px 12px; background: #e8f8ee; color: #1d6c3f; border-radius: 999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Payment Confirmed ✓</span>
        <h1 style="margin: 12px 0 6px; font-size: 22px; color: #100b0e; font-weight: 800;">We're Preparing Your Lashes!</h1>
        <p style="margin: 0; color: #6b646a; font-size: 14px;">Hi <strong>${order.customer || "there"}</strong>, your EFT payment for order <strong>${order.reference}</strong> has been successfully verified.</p>
      </div>

      <div style="margin-bottom: 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${itemsHtmlRows(order)}
          <tr>
            <td style="padding: 12px 0 0; color: #100b0e; font-size: 15px; font-weight: 800;">Total Paid</td>
            <td style="padding: 12px 0 0; text-align: right; color: #100b0e; font-size: 16px; font-weight: 900;">${money(order.total)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #effaf3; border: 1px solid #b8e5c8; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <strong style="color: #1d6c3f; display: block; font-size: 14px; margin-bottom: 4px;">What happens next?</strong>
        <span style="color: #2e6040; font-size: 13px; line-height: 1.4;">Your order is moving to the packing station. You will receive another notification as soon as it is dispatched or ready for collection.</span>
      </div>
      `
    )
  }),

  on_the_way: (order) => ({
    subject: `Your Lash Order Is On Its Way · ${order.reference}`,
    text: `Hi ${order.customer || "there"},\n\nYour WISPAIR order ${order.reference} is on its way!\n\n${order.fulfilment_note || order.fulfilmentNote ? `Fulfilment note: ${order.fulfilment_note || order.fulfilmentNote}\n\n` : ""}Thank you,\nWISPAIR Team`,
    html: emailWrap(
      `Order On Its Way · ${order.reference}`,
      `Your WISPAIR lash order ${order.reference} has been dispatched.`,
      `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 4px 12px; background: #eaf2ff; color: #28528f; border-radius: 999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Dispatched 📦</span>
        <h1 style="margin: 12px 0 6px; font-size: 22px; color: #100b0e; font-weight: 800;">Your Lashes Are On The Way!</h1>
        <p style="margin: 0; color: #6b646a; font-size: 14px;">Hi <strong>${order.customer || "there"}</strong>, your order <strong>${order.reference}</strong> has been fulfilled and is on its way to you.</p>
      </div>

      ${(order.fulfilment_note || order.fulfilmentNote) ? `
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <strong style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #28528f; margin-bottom: 4px;">Fulfilment & Tracking Details</strong>
          <span style="font-size: 14px; color: #1a335a; font-weight: 600;">${order.fulfilment_note || order.fulfilmentNote}</span>
        </div>
      ` : ""}

      <div style="margin-bottom: 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${itemsHtmlRows(order)}
        </table>
      </div>

      <p style="margin: 0; color: #6b646a; font-size: 13px; text-align: center; line-height: 1.5;">
        Get ready to love your new lash look! Reach out to <a href="https://instagram.com/wispairofficial" style="color: #c23d8d; font-weight: 700; text-decoration: none;">@wispairofficial</a> if you need any application tips.
      </p>
      `
    )
  }),

  delivered: (order) => ({
    subject: `Order Delivered · ${order.reference} 💖`,
    text: `Hi ${order.customer || "there"},\n\nYour WISPAIR order ${order.reference} has been marked as delivered.\n\nWe hope you absolutely love your lashes!\n\nTag @wispairofficial in your photos.\n\nThank you,\nWISPAIR Team`,
    html: emailWrap(
      `Order Delivered · ${order.reference}`,
      `Your WISPAIR lash order has been delivered!`,
      `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 4px 12px; background: #efe9ff; color: #5b3a98; border-radius: 999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Delivered 💖</span>
        <h1 style="margin: 12px 0 6px; font-size: 22px; color: #100b0e; font-weight: 800;">Enjoy Your New Lashes!</h1>
        <p style="margin: 0; color: #6b646a; font-size: 14px;">Hi <strong>${order.customer || "there"}</strong>, your WISPAIR order <strong>${order.reference}</strong> has been marked as delivered.</p>
      </div>

      <div style="background: linear-gradient(135deg, #fff8fc 0%, #ffffff 100%); border: 1.5px solid #f5c4df; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <strong style="display: block; font-size: 16px; color: #100b0e; margin-bottom: 6px;">Show off your lash look!</strong>
        <p style="margin: 0 0 14px; font-size: 13px; color: #6b646a; line-height: 1.4;">We'd love to see how your WISPAIR lashes look on you. Tag us on Instagram to be featured!</p>
        <a href="https://instagram.com/wispairofficial" style="display: inline-block; background: #100b0e; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 800; text-decoration: none;">Tag @wispairofficial</a>
      </div>

      <p style="margin: 0; color: #756b72; font-size: 12px; text-align: center;">
        Thank you for choosing WISPAIR · Softness you can feel.
      </p>
      `
    )
  })
};

async function sendEmail(order, templateName, recipient) {
  const { RESEND_API_KEY, ORDER_EMAIL_FROM } = process.env;
  const template = templates[templateName];
  if (!RESEND_API_KEY || !ORDER_EMAIL_FROM || !recipient || !template) {
    console.warn(`[Resend] Missing required email config or recipient: API_KEY=${Boolean(RESEND_API_KEY)}, FROM=${Boolean(ORDER_EMAIL_FROM)}, to=${recipient}`);
    return false;
  }
  try {
    const email = template(order);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: ORDER_EMAIL_FROM,
        to: [recipient],
        subject: email.subject,
        text: email.text,
        html: email.html
      })
    });
    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[Resend] API Error (${response.status}):`, errBody);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Resend] Network/Send Error:", error);
    return false;
  }
}

module.exports = { templates, statusEmailTemplates, sendEmail };

