import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://grocerydelivery:grocerydelivery@cluster0.dqzbo.mongodb.net/fresh-grocers?retryWrites=true&w=majority';

async function verifyDeliveryProfile() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if users collection exists and find delivery1
    const users = db?.collection('users');
    const delivery1User = await users?.findOne({ email: 'delivery1@grocerydelivery.com' });
    
    console.log('\n=== CHECKING DELIVERY USER ===');
    console.log('Delivery1 User found:', !!delivery1User);
    if (delivery1User) {
      console.log('User ID:', delivery1User._id);
      console.log('Email:', delivery1User.email);
      console.log('Role:', delivery1User.role);
      console.log('Full Name:', delivery1User.fullName);
      console.log('Active:', delivery1User.isActive);
    }

    // Check delivery profiles collection
    const profiles = db?.collection('deliveryprofiles');
    console.log('\n=== CHECKING DELIVERY PROFILES ===');
    const allProfiles = await profiles?.countDocuments();
    console.log('Total delivery profiles in DB:', allProfiles);

    if (delivery1User) {
      const userIdString = delivery1User._id.toString();
      const userIdObj = delivery1User._id;
      
      // Try to find profile by userId (both as string and ObjectId)
      const profileByString = await profiles?.findOne({ userId: userIdString });
      const profileByObjectId = await profiles?.findOne({ userId: userIdObj });
      const profile = profileByString || profileByObjectId;

      console.log(`\nDeliveryProfile for user ${userIdString}:`);
      console.log('Profile found:', !!profile);
      
      if (profile) {
        console.log('Profile ID:', profile._id);
        console.log('User ID in profile:', profile.userId);
        console.log('Status:', profile.status);
        console.log('Approved:', profile.isApproved);
        console.log('City:', profile.city);
        console.log('District:', profile.district);
      } else {
        console.log('\n⚠️ NO PROFILE FOUND FOR THIS USER!');
        console.log('\nAll profiles in database:');
        const profiles_all = await profiles?.find({}).toArray();
        profiles_all?.forEach((p: any) => {
          console.log(`  - Profile: ${p._id}, UserId: ${p.userId}, Status: ${p.status}, Approved: ${p.isApproved}`);
        });
      }
    }

    await mongoose.connection.close();
    console.log('\nDatabase check complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyDeliveryProfile();
