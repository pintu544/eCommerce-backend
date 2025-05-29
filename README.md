# eCommerce Checkout Flow Simulation

A full-stack application that simulates an eCommerce checkout flow, including product selection, checkout form with validation, payment processing simulation, and order confirmation with email notifications.

## Project Overview

This application includes three main pages:
- **Landing Page**: Product details, variant selection, and quantity selection
- **Checkout Page**: Form with validation for customer and payment info
- **Thank You Page**: Order confirmation details

## Features

- Product display with variant and quantity selection
- Form validation for customer and payment information
- Transaction simulation (approved, declined, error)
- Order storage in MongoDB
- Inventory management
- Email notifications using Mailtrap.io

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Email Service**: Mailtrap.io

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud instance)
- Mailtrap.io account (free tier)

### Installation

1. Clone the repository

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
```

4. Set up environment variables
   - Create a `.env` file in the server directory based on the provided example
   - Add your MongoDB connection string
   - Add your Mailtrap API token (previously SMTP credentials)

5. Start the backend server
```bash
cd server
npm run dev
```

6. Start the frontend development server
```bash
cd client
npm run dev
```

7. Access the application at http://localhost:3000

## Transaction Simulation

To simulate different transaction outcomes when entering CVV on the checkout page:
- Enter `1` for Approved Transaction (default)
- Enter `2` for Declined Transaction  
- Enter `3` for Gateway Error/Failure

## Troubleshooting

If you encounter issues with product validation when creating orders, make sure that:
1. You've initialized products using the `/api/products/init` endpoint
2. The product IDs being referenced in orders actually exist in your database
3. MongoDB is properly connected and running

## Project Structure

# API Routes Testing Guide

This guide provides instructions for testing and verifying all API endpoints in the eCommerce Checkout Flow application, including the email sending functionality.

## Prerequisites

- [Postman](https://www.postman.com/downloads/) or [Insomnia](https://insomnia.rest/download) for API testing
- MongoDB running locally or connection to cloud instance
- Node.js server running (`npm run dev` in the server directory)

## Product Routes

### 1. Create Initial Product
- **Endpoint**: `POST /api/products/init`
- **Description**: Creates a sample product if none exist
- **Test Steps**:
  ```
  curl -X POST http://localhost:5000/api/products/init
  ```
- **Expected Response**: 
  ```json
  {
    "message": "Initial product created successfully",
    "product": {
      "_id": "...",
      "title": "Converse Chuck Taylor All Star II Hi",
      "price": 85,
      ...
    }
  }
  ```
- **Verification**: Check MongoDB to confirm the product was added

### 2. Get All Products
- **Endpoint**: `GET /api/products`
- **Description**: Retrieves all products
- **Test Steps**:
  ```
  curl http://localhost:5000/api/products
  ```
- **Expected Response**: Array of products
- **Verification**: Compare with database contents

### 3. Get Product by ID
- **Endpoint**: `GET /api/products/:id`
- **Description**: Retrieves a specific product by ID
- **Test Steps**:
  ```
  curl http://localhost:5000/api/products/{PRODUCT_ID}
  ```
- **Expected Response**: Single product object
- **Verification**: Compare with specific product in database

## Cart Routes

### 1. Get Cart
- **Endpoint**: `GET /api/cart/:userId`
- **Description**: Retrieves the cart for a specific user
- **Test Steps**:
  ```
  curl http://localhost:5000/api/cart/test-user-123
  ```
- **Expected Response**: Cart object with products array
- **Verification**: View cart contents in response

### 2. Add to Cart
- **Endpoint**: `POST /api/cart/add`
- **Description**: Adds a product to the cart
- **Test Steps**:
  ```
  curl -X POST http://localhost:5000/api/cart/add \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "test-user-123",
      "productId": "PRODUCT_ID_HERE",
      "quantity": 1,
      "variant": "Color: Black, Size: 10"
    }'
  ```
- **Expected Response**: Updated cart with new item
- **Verification**: Check that the item was added with correct quantity and price

### 3. Update Cart Item
- **Endpoint**: `PUT /api/cart/update`
- **Description**: Updates the quantity of a cart item
- **Test Steps**:
  ```
  curl -X PUT http://localhost:5000/api/cart/update \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "test-user-123",
      "itemId": "CART_ITEM_ID_HERE",
      "quantity": 2
    }'
  ```
- **Expected Response**: Updated cart with modified quantity
- **Verification**: Check that the quantity and subtotal are updated correctly

### 4. Remove Cart Item
- **Endpoint**: `DELETE /api/cart/:userId/items/:itemId`
- **Description**: Removes an item from the cart
- **Test Steps**:
  ```
  curl -X DELETE http://localhost:5000/api/cart/test-user-123/items/CART_ITEM_ID_HERE
  ```
- **Expected Response**: Updated cart without the removed item
- **Verification**: Check that the item was removed

### 5. Clear Cart
- **Endpoint**: `DELETE /api/cart/:userId`
- **Description**: Removes all items from the cart
- **Test Steps**:
  ```
  curl -X DELETE http://localhost:5000/api/cart/test-user-123
  ```
- **Expected Response**: Empty cart
- **Verification**: Check that all items were removed

## Order Routes

### 1. Create Order
- **Endpoint**: `POST /api/orders`
- **Description**: Creates a new order
- **Test Steps**:
  ```
  curl -X POST http://localhost:5000/api/orders \
    -H "Content-Type: application/json" \
    -d '{
      "productId": "PRODUCT_ID_HERE",
      "variant": "Color: Black, Size: 10",
      "quantity": 1,
      "subtotal": 85,
      "total": 85,
      "customer": {
        "fullName": "Test User",
        "email": "test@example.com",
        "phone": "1234567890",
        "address": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "zipCode": "12345"
      },
      "paymentInfo": {
        "cardNumber": "4111111111111111",
        "expiryDate": "12/25",
        "cvv": "1"
      }
    }'
  ```
- **Expected Response**: Order object with populated product
- **Verification**: 
  1. Check MongoDB for the new order
  2. Verify inventory was updated
  3. Check for email delivery (see Email Testing section)

### 2. Get Order by Order Number
- **Endpoint**: `GET /api/orders/:orderNumber`
- **Description**: Retrieves an order by its order number
- **Test Steps**:
  ```
  curl http://localhost:5000/api/orders/ORD-12345678
  ```
- **Expected Response**: Order object with populated product
- **Verification**: Compare with specific order in database

## Transaction Outcome Testing

Use different CVV values to test different transaction outcomes:

1. **Approved Transaction (CVV: 1)**
   ```json
   "paymentInfo": {
     "cardNumber": "4111111111111111",
     "expiryDate": "12/25",
     "cvv": "1"
   }
   ```

2. **Declined Transaction (CVV: 2)**
   ```json
   "paymentInfo": {
     "cardNumber": "4111111111111111",
     "expiryDate": "12/25",
     "cvv": "2"
   }
   ```

3. **Error Transaction (CVV: 3)**
   ```json
   "paymentInfo": {
     "cardNumber": "4111111111111111",
     "expiryDate": "12/25",
     "cvv": "3"
   }
   ```

## Email Testing

### Mailtrap API Setup
1. Create an account on [Mailtrap](https://mailtrap.io/)
2. Generate an API token from Mailtrap dashboard
3. Add the token to your `.env` file as `Api-Token=your_token_here`

### Verifying Email Sending
1. Create an order using the Create Order endpoint
2. Log into your Mailtrap account
3. Navigate to the inbox
4. You should see an email with the order details
5. Check that:
   - Subject line matches order status (Approved/Declined/Error)
   - Email content includes correct order information
   - Formatting is proper

### Testing Different Email Templates
1. Create multiple orders with different CVV values (1, 2, 3)
2. Check Mailtrap for three different email templates:
   - Approved order confirmation
   - Declined transaction notification
   - Error transaction notification

## Troubleshooting

### Common Issues and Solutions

1. **"Product not found" Error**
   - Ensure you're using a valid product ID
   - Try creating an initial product with the `/api/products/init` endpoint

2. **"Not enough inventory" Error**
   - Check the product's inventory in MongoDB
   - Update the inventory with MongoDB commands if needed

3. **Email Not Sending**
   - Verify your Mailtrap API token is correct
   - Check server logs for email sending errors
   - Ensure the email service is properly configured

4. **MongoDB Connection Issues**
   - Verify MongoDB is running
   - Check the connection string in your `.env` file

5. **Invalid ObjectId Format**
   - Ensure product IDs follow the MongoDB ObjectId format

## API Response Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource was successfully created
- `400 Bad Request`: Invalid request (e.g., invalid data, not enough inventory)
- `404 Not Found`: Resource not found
- `500 Server Error`: Server-side error

## Test Data Reset

To reset test data:
1. Connect to MongoDB
2. Drop the products and orders collections
3. Create a new initial product using `/api/products/init`
