import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateOrder() {
  try {
    console.log('Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get collections
    const ordersCollection = db?.collection('orders');
    const usersCollection = db?.collection('users');

    if (!ordersCollection || !usersCollection) {
      throw new Error('Collections not found');
    }

    // Find a delivery person
    const deliveryPerson = await usersCollection.findOne({ 
      role: 'DELIVERY_PERSON' 
    });
    
    if (!deliveryPerson) {
      console.log('✗ No delivery person found');
      console.log('Available users:');
      const allUsers = await usersCollection.find({}).limit(5).toArray();
      console.log(allUsers.map(u => ({ email: u.email, role: u.role })));
      process.exit(1);
    }

    console.log(`✓ Found delivery person: ${deliveryPerson.fullName}`);

    // Get the first order
    const order = await ordersCollection.findOne({});
    
    if (!order) {
      console.log('✗ No orders found');
      process.exit(1);
    }

    // Update it to DELIVERED
    const updateResult = await ordersCollection.updateOne(
      { _id: order._id },
      {
        $set: {
          status: 'DELIVERED',
          deliveryPersonId: deliveryPerson._id,
        },
      }
    );

    console.log(`✓ Order updated successfully!`);
    console.log(`  - Order Number: ${order.orderNumber}`);
    console.log(`  - New Status: DELIVERED`);
    console.log(`  - Delivery Person: ${deliveryPerson.fullName}`);

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error: any) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

updateOrder();
