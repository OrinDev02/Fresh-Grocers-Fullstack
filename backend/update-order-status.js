// Script to update order status to DELIVERED and assign a delivery person
// Run with: node update-order-status.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function updateOrderStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'fresh_grocers',
    });

    console.log('✓ Connected to MongoDB');

    // Get collections
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    const deliveryProfilesCollection = db.collection('deliveryprofiles');
    const usersCollection = db.collection('users');

    // Find a delivery person
    const deliveryPerson = await usersCollection.findOne({ role: 'DELIVERY_PERSON' });
    
    if (!deliveryPerson) {
      console.error('No delivery person found. Please seed delivery persons first.');
      process.exit(1);
    }

    console.log(`✓ Found delivery person: ${deliveryPerson.fullName}`);

    // Find the first order and update it
    const result = await ordersCollection.updateOne(
      {},
      {
        $set: {
          status: 'DELIVERED',
          deliveryPersonId: deliveryPerson._id,
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✓ Order updated successfully!');
      console.log(`  - Status set to: DELIVERED`);
      console.log(`  - Delivery Person: ${deliveryPerson.fullName}`);
      
      // Show the updated order
      const order = await ordersCollection.findOne({});
      console.log('\nUpdated Order:');
      console.log(`  - Order Number: ${order.orderNumber}`);
      console.log(`  - Status: ${order.status}`);
      console.log(`  - Delivery Person ID: ${order.deliveryPersonId}`);
    } else {
      console.log('✗ No orders found to update');
    }

    await mongoose.connection.close();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateOrderStatus();
