import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function createTestPendingOrder() {
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
    
    const ordersCollection = db?.collection('orders');
    const customersCollection = db?.collection('users');
    const productsCollection = db?.collection('products');

    if (!ordersCollection || !customersCollection || !productsCollection) {
      throw new Error('Collections not found');
    }

    // Get a customer
    const customer = await customersCollection.findOne({ role: 'CUSTOMER' });
    if (!customer) {
      console.log('✗ No customer found. Please register a customer first.');
      process.exit(1);
    }

    // Get a product
    const product = await productsCollection.findOne({});
    if (!product) {
      console.log('✗ No products found.');
      process.exit(1);
    }

    // Create a PENDING order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = {
      orderNumber,
      customerId: customer._id,
      items: [
        {
          productId: product._id,
          name: product.name,
          quantity: 2,
          price: product.price,
        }
      ],
      subtotal: product.price * 2,
      deliveryFee: 5,
      totalAmount: (product.price * 2) + 5,
      status: 'PENDING',
      paymentMethod: 'COD',
      deliveryAddress: {
        street: '123 Main St',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        latitude: 6.9271,
        longitude: 80.6369,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection?.insertOne(order as any);
    
    console.log(`✓ Test PENDING order created successfully!`);
    console.log(`  - Order Number: ${orderNumber}`);
    console.log(`  - Order ID: ${result?.insertedId}`);
    console.log(`  - Status: PENDING`);
    console.log(`  - Customer: ${customer.fullName}`);
    console.log(`  - Address: Colombo, Colombo`);
    console.log(`  - Coordinates: 6.9271, 80.6369`);
    console.log(`\n📝 Use this order to test delivery person assignment in CSR dashboard`);

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  } catch (error: any) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

createTestPendingOrder();
