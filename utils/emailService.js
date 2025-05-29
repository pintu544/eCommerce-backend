const axios = require('axios');
const config = require('../config');

// Helper functions to create email templates
const getApprovedEmailTemplate = (order) => {
  // Handle both legacy and multi-item orders
  if (order.items && order.items.length > 0) {
    // Multi-item order
    const itemsHtml = order.items.map(item => {
      const productTitle = item.product?.title || 'Product';
      const productVariant = item.variant ? `<p>Variant: ${item.variant}</p>` : '';
      return `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <p><strong>Product:</strong> ${productTitle}</p>
          ${productVariant}
          <p>Quantity: ${item.quantity}</p>
          <p>Price: $${(item.price || 0).toFixed(2)}</p>
          <p>Subtotal: $${(item.subtotal || 0).toFixed(2)}</p>
        </div>
      `;
    }).join('');

    return `
      <h1>Order Confirmed - #${order.orderNumber}</h1>
      <p>Thank you for your purchase!</p>
      
      <h2>Order Details:</h2>
      ${itemsHtml}
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
      
      <h2>Shipping Information:</h2>
      <p>${order.customer.fullName}</p>
      <p>${order.customer.address}</p>
      <p>${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}</p>
      
      <p>We'll notify you when your order ships!</p>
    `;
  } else {
    // Legacy single product order
    const productTitle = order.product?.title || 'Product';
    const variantInfo = order.variant ? `<p>Variant: ${order.variant}</p>` : '';
    
    return `
      <h1>Order Confirmed - #${order.orderNumber}</h1>
      <p>Thank you for your purchase!</p>
      
      <h2>Order Details:</h2>
      <p>Product: ${productTitle}</p>
      ${variantInfo}
      <p>Quantity: ${order.quantity}</p>
      <p>Total: $${order.total.toFixed(2)}</p>
      
      <h2>Shipping Information:</h2>
      <p>${order.customer.fullName}</p>
      <p>${order.customer.address}</p>
      <p>${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}</p>
      
      <p>We'll notify you when your order ships!</p>
    `;
  }
};

const getDeclinedEmailTemplate = (order) => {
  // Handle both legacy and multi-item orders
  if (order.items && order.items.length > 0) {
    // Multi-item order
    const itemsHtml = order.items.map(item => {
      const productTitle = item.product?.title || 'Product';
      const productVariant = item.variant ? `<p>Variant: ${item.variant}</p>` : '';
      return `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <p><strong>Product:</strong> ${productTitle}</p>
          ${productVariant}
          <p>Quantity: ${item.quantity}</p>
          <p>Subtotal: $${(item.subtotal || 0).toFixed(2)}</p>
        </div>
      `;
    }).join('');

    return `
      <h1>Transaction Declined - #${order.orderNumber}</h1>
      <p>We're sorry, but your transaction was declined.</p>
      
      <h2>Order Details:</h2>
      ${itemsHtml}
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
      
      <p>Please try again with a different payment method or contact your bank for assistance.</p>
      <p>If you need help, please contact our support team.</p>
    `;
  } else {
    // Legacy single product order
    const productTitle = order.product?.title || 'Product';
    const variantInfo = order.variant ? `<p>Variant: ${order.variant}</p>` : '';
    
    return `
      <h1>Transaction Declined - #${order.orderNumber}</h1>
      <p>We're sorry, but your transaction was declined.</p>
      
      <h2>Order Details:</h2>
      <p>Product: ${productTitle}</p>
      ${variantInfo}
      <p>Quantity: ${order.quantity}</p>
      <p>Total: $${order.total.toFixed(2)}</p>
      
      <p>Please try again with a different payment method or contact your bank for assistance.</p>
      <p>If you need help, please contact our support team.</p>
    `;
  }
};

const getErrorEmailTemplate = (order) => {
  // Similar pattern for error emails
  if (order.items && order.items.length > 0) {
    // Multi-item order implementation
    const itemsHtml = order.items.map(item => {
      const productTitle = item.product?.title || 'Product';
      const productVariant = item.variant ? `<p>Variant: ${item.variant}</p>` : '';
      return `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <p><strong>Product:</strong> ${productTitle}</p>
          ${productVariant}
          <p>Quantity: ${item.quantity}</p>
          <p>Subtotal: $${(item.subtotal || 0).toFixed(2)}</p>
        </div>
      `;
    }).join('');
    
    return `
      <h1>Transaction Error - #${order.orderNumber}</h1>
      <p>We're sorry, but there was an error processing your transaction.</p>
      
      <h2>Order Details:</h2>
      ${itemsHtml}
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
      
      <p>Our team has been notified of this issue. Please try again later or contact our support team for assistance.</p>
    `;
  } else {
    // Legacy single product order
    const productTitle = order.product?.title || 'Product';
    const variantInfo = order.variant ? `<p>Variant: ${order.variant}</p>` : '';
    
    return `
      <h1>Transaction Error - #${order.orderNumber}</h1>
      <p>We're sorry, but there was an error processing your transaction.</p>
      
      <h2>Order Details:</h2>
      <p>Product: ${productTitle}</p>
      ${variantInfo}
      <p>Quantity: ${order.quantity}</p>
      <p>Total: $${order.total.toFixed(2)}</p>
      
      <p>Our team has been notified of this issue. Please try again later or contact our support team for assistance.</p>
    `;
  }
};

// Send order confirmation email using Mailtrap API
const sendOrderEmail = async (order) => {
  // Safely extract customer email and name
  const customerEmail = order.customer?.email || 'customer@example.com';
  const customerName = order.customer?.fullName || 'Customer';
  const orderNumber = order.orderNumber || 'Unknown';

  let subject, html, text;

  switch (order.status) {
    case 'approved':
      subject = `Order Confirmed - #${order.orderNumber}`;
      html = getApprovedEmailTemplate(order);
      text = `Thank you for your order #${order.orderNumber}. Your transaction has been approved.`;
      break;
    case 'declined':
      subject = `Transaction Declined - #${order.orderNumber}`;
      html = getDeclinedEmailTemplate(order);
      text = `We're sorry, but your transaction for order #${order.orderNumber} was declined.`;
      break;
    case 'error':
      subject = `Transaction Error - #${order.orderNumber}`;
      html = getErrorEmailTemplate(order);
      text = `We encountered an error processing your transaction for order #${order.orderNumber}.`;
      break;
    default:
      subject = `Order Update - #${order.orderNumber}`;
      html = getApprovedEmailTemplate(order);
      text = `Order update for #${order.orderNumber}`;
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://sandbox.api.mailtrap.io/api/send/3733511',
      headers: {
        'Accept': 'application/json',
        'Api-Token': config.MAILTRAP_API_TOKEN,
        'Content-Type': 'application/json'
      },
      data: {
        to: [
          {
            email: order.customer.email,
            name: order.customer.fullName
          }
        ],
        from: {
          email: 'noreply@ecommercestore.com',
          name: 'eCommerce Store'
        },
        subject: subject,
        text: text,
        html: html,
        category: `Order-${order.status}`
      }
    });

    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendOrderEmail };
