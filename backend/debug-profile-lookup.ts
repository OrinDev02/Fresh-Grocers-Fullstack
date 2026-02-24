import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://grocerydelivery:grocerydelivery@cluster0.dqzbo.mongodb.net/fresh-grocers?retryWrites=true&w=majority';

async function debugProfileLookup() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const users = db?.collection('users');
    const profiles = db?.collection('deliveryprofiles');

    // Get delivery1 user
    const delivery1User = await users?.findOne({ email: 'delivery1@grocerydelivery.com' });
    
    if (!delivery1User) {
      console.error('❌ Delivery user not found!');
      process.exit(1);
    }

    const userId = delivery1User._id;
    console.log('✓ Delivery user found:');
    console.log(`  - ID (as ObjectId): ${userId}`);
    console.log(`  - ID (as string): ${userId.toString()}`);
    console.log(`  - Email: ${delivery1User.email}`);
    console.log(`  - Role: ${delivery1User.role}\n`);

    // Try different lookup methods
    console.log('=== TESTING PROFILE LOOKUPS ===\n');

    // Method 1: Direct ObjectId lookup
    console.log('1. Looking up by ObjectId directly:');
    const profileByObjectId = await profiles?.findOne({ userId: userId });
    console.log(`   Found: ${!!profileByObjectId}`);

    // Method 2: String lookup
    console.log('2. Looking up by string ID:');
    const profileByString = await profiles?.findOne({ userId: userId.toString() });
    console.log(`   Found: ${!!profileByString}`);

    // Method 3: Explicit ObjectId creation
    console.log('3. Looking up by new ObjectId from string:');
    const profileByNewObjectId = await profiles?.findOne({ userId: new mongoose.Types.ObjectId(userId.toString()) });
    console.log(`   Found: ${!!profileByNewObjectId}`);

    // Get all profiles to understand structure
    console.log('\n=== ALL PROFILES IN DATABASE ===');
    const allProfiles = await profiles?.find({}).toArray();
    allProfiles?.forEach((p: any, index: number) => {
      console.log(`\nProfile ${index + 1}:`);
      console.log(`  - ID: ${p._id}`);
      console.log(`  - userId type: ${typeof p.userId} (${p.userId?.constructor?.name})`);
      console.log(`  - userId value: ${p.userId}`);
      console.log(`  - Status: ${p.status}`);
      console.log(`  - Approved: ${p.isApproved}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Debug complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugProfileLookup();
