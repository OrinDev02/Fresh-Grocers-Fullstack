// Test script to verify delivery person assignment functionality
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function testDeliveryAssignment() {
  try {
    console.log('=== Testing Delivery Assignment ===\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    // Disable NestJS bootstrap
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    const db = connection.connection.db;
    
    // Get collections
    const ordersCollection = db?.collection('orders');
    const usersCollection = db?.collection('users');
    const deliveryProfilesCollection = db?.collection('deliveryprofiles');

    if (!ordersCollection || !usersCollection || !deliveryProfilesCollection) {
      throw new Error('Collections not found');
    }

    // Find a PENDING order
    console.log('Looking for PENDING orders...');
    const pendingOrder = await ordersCollection.findOne({ status: 'PENDING' });
    
    if (!pendingOrder) {
      console.log('✗ No PENDING orders found');
      console.log('Hint: Create a PENDING order first using: npx ts-node create-test-order.ts');
      process.exit(1);
    }

    console.log(`✓ Found PENDING order: ${pendingOrder.orderNumber}`);
    console.log(`  - Order ID: ${pendingOrder._id}`);
    console.log(`  - Status: ${pendingOrder.status}`);
    console.log(`  - Customer: ${pendingOrder.customerId}`);
    console.log(`  - Address: ${pendingOrder.deliveryAddress?.city}, ${pendingOrder.deliveryAddress?.district}`);
    console.log(`  - Coordinates: ${pendingOrder.deliveryAddress?.latitude}, ${pendingOrder.deliveryAddress?.longitude}`);

    // Find approved delivery persons
    console.log('\n✓ Looking for approved delivery persons...');
    const deliveryPersons = await deliveryProfilesCollection
      .find({ isApproved: true, status: 'APPROVED' })
      .limit(5)
      .toArray();
    
    if (deliveryPersons.length === 0) {
      console.log('✗ No approved delivery persons found');
      process.exit(1);
    }

    console.log(`✓ Found ${deliveryPersons.length} approved delivery persons:`);
    deliveryPersons.forEach((person: any, idx: number) => {
      console.log(`  ${idx + 1}. ${person.userId} - ${person.city} (⭐ ${person.averageRating})`);
    });

    // Test assignment
    const deliveryPersonToAssign = deliveryPersons[0];
    console.log(`\n=== Simulating Assignment ===`);
    console.log(`Assigning order ${pendingOrder.orderNumber} to delivery person ${deliveryPersonToAssign.userId}`);
    
    const updateResult = await ordersCollection.updateOne(
      { _id: pendingOrder._id, status: 'PENDING' },
      {
        $set: {
          status: 'ASSIGNED',
          deliveryPersonId: deliveryPersonToAssign.userId,
          assignedAt: new Date(),
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Assignment successful!`);
      console.log(`  - Status changed: PENDING → ASSIGNED`);
      console.log(`  - Delivery Person: ${deliveryPersonToAssign.userId}`);
    } else {
      console.log('✗ Assignment failed - order status may not be PENDING');
    }

    await mongoose.disconnect();
    console.log('\n✓ Test completed');
  } catch (error: any) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testDeliveryAssignment();
