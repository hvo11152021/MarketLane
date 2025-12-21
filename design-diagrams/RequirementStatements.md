Requirement Statements

## 1. Introduction
A simple marketplace e-commerce platform supporting two main actors: **Buyer** and **Seller**.

## 2. Functional Requirements

### 2.1 Buyer Features
- **FR-01**: The system shall allow the buyer to browse all available products.  
- **FR-02**: The system shall allow the buyer to search products by name, category, or keyword.  
- **FR-03**: The system shall display product details including price, stock, description, and seller info.  
- **FR-04**: The system shall allow the buyer to add products to the shopping cart.  
- **FR-05**: The system shall allow the buyer to edit or remove items from the cart.  
- **FR-06**: The system shall allow the buyer to perform checkout and complete payment.  
- **FR-07**: The system shall generate an order after successful payment.  
- **FR-08**: The system shall allow the buyer to view order history and status.  
- **FR-09**: The system shall allow the buyer to submit ratings and reviews for purchased products.

### 2.2 Seller Features
- **FR-10**: The system shall allow the seller to create new product listings.  
- **FR-11**: The system shall allow the seller to edit product details.  
- **FR-12**: The system shall allow the seller to delete product listings.  
- **FR-13**: The system shall allow the seller to manage product inventory.  
- **FR-14**: The system shall allow the seller to view orders placed for their products.  
- **FR-15**: The system shall allow the seller to update order status (e.g., processing, shipped).  
- **FR-16**: The system shall provide sellers with access to basic sales analytics or reports.

### 2.3 System-Level Functionalities
- **FR-17**: The system shall authenticate buyers and sellers using secure login.  
- **FR-18**: The system shall manage roles with different permissions for buyers and sellers.  
- **FR-19**: The system shall store all product and order data in a persistent database.  
- **FR-20**: The system shall send notifications for order confirmations and order updates.

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-01**: Product search results shall load within 2 seconds.  
- **NFR-02**: The system shall support at least 1,000 concurrent users.

### 3.2 Usability
- **NFR-03**: The user interface shall be intuitive and support desktop and mobile layouts.  
- **NFR-04**: The checkout process shall require no more than 3 user actions.

### 3.3 Security
- **NFR-05**: All passwords shall be stored using industry-standard hashing.  
- **NFR-06**: All payment operations shall use secure, encrypted connections (HTTPS/TLS).  
- **NFR-07**: User sessions shall expire after a period of inactivity.

### 3.4 Reliability
- **NFR-08**: The system shall have 99.5% uptime.  
- **NFR-09**: The system shall automatically back up data daily.

### 3.5 Scalability
- **NFR-10**: The system shall scale to accommodate increased product count and traffic without redesign.  

### 3.6 Maintainability
- **NFR-11**: The system’s backend and frontend code shall follow modular architecture.  
- **NFR-12**: All services shall include logging for debugging and monitoring.

## 4. Constraints
- **C-01**: The system must be developed using open-source technologies.  
- **C-02**: Payment must be processed through a supported external gateway.

## 5. Assumptions
- **A-01**: Buyers have stable internet access.  
- **A-02**: Sellers manage their own inventory accuracy.  
