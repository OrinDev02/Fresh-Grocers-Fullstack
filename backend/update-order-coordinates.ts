import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateOrderWithCoordinates() {
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

    // Find the DELIVERED order
    const order = await ordersCollection.findOne({ status: 'DELIVERED' });
    
    if (!order) {
      console.log('✗ No DELIVERED order found');
      process.exit(1);
    }

    console.log(`Found order: ${order.orderNumber}`);
    console.log(`Current coordinates: ${order.deliveryAddress?.latitude}, ${order.deliveryAddress?.longitude}`);

    // Update delivery address with Colombo coordinates
    const updateResult = await ordersCollection.updateOne(
      { _id: order._id },
      {
        $set: {
          'deliveryAddress.latitude': 6.9271,
          'deliveryAddress.longitude': 80.6369,
          'deliveryAddress.city': 'Colombo',
          'deliveryAddress.district': 'Colombo',
          'deliveryAddress.province': 'Western',
        },
      }
    );

    console.log(`✓ Order updated successfully!`);
    console.log(`  - Coordinates: 6.9271, 80.6369 (Colombo)`);
    console.log(`  - City: Colombo`);
    console.log(`  - District: Colombo`);
    console.log(`  - Province: Western`);

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error: any) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

updateOrderWithCoordinates();
