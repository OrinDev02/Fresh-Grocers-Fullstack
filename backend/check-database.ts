import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDeliveryPersons() {
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
    
    const usersCollection = db?.collection('users');
    const deliveryProfilesCollection = db?.collection('deliveryprofiles');

    if (!usersCollection || !deliveryProfilesCollection) {
      throw new Error('Collections not found');
    }

    // Find delivery persons
    const deliveryPersons = await usersCollection
      .find({ role: 'DELIVERY_PERSON' })
      .toArray();
    
    console.log(`\n✓ Found ${deliveryPersons.length} delivery persons:`);
    deliveryPersons.forEach((person, index) => {
      console.log(`  ${index + 1}. ${person.fullName} (${person.email})`);
      console.log(`     ID: ${person._id}`);
    });

    // Find delivery profiles
    const profiles = await deliveryProfilesCollection
      .find({})
      .toArray();
    
    console.log(`\n✓ Found ${profiles.length} delivery profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. Profile for user: ${profile.userId}`);
      console.log(`     Status: ${profile.status || 'NOT SET'}`);
      console.log(`     isApproved: ${profile.isApproved}`);
      console.log(`     Location: ${profile.city}, ${profile.district}`);
      console.log(`     Coordinates: ${profile.latitude}, ${profile.longitude}`);
      console.log(`     Rating: ${profile.averageRating}`);
    });

    // Find orders
    const ordersCollection = db?.collection('orders');
    const orders = await ordersCollection?.find({}).limit(3).toArray();
    
    console.log(`\n✓ Found orders:`);
    orders?.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.orderNumber} (${order.status})`);
      console.log(`     Customer ID: ${order.customerId}`);
      console.log(`     Delivery Person: ${order.deliveryPersonId || 'NOT ASSIGNED'}`);
      console.log(`     Address: ${order.deliveryAddress?.city}, ${order.deliveryAddress?.district}`);
      console.log(`     Coordinates: ${order.deliveryAddress?.latitude}, ${order.deliveryAddress?.longitude}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  } catch (error: any) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

checkDeliveryPersons();
