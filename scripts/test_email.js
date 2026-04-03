import { sendOrderConfirmationEmail } from '../lib/email.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testEmail() {
  const dummyOrder = {
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    orderItems: [
      {
        name: "Test Product",
        image: "https://via.placeholder.com/150",
        size: "M",
        color: "Black",
        quantity: 1,
        price: 999
      }
    ],
    shippingAddress: {
      fullName: "Test User",
      addressLine1: "123 Test St",
      city: "Testville",
      state: "TS",
      zipCode: "12345",
      country: "Testland",
      phone: "1234567890"
    },
    itemsPrice: 999,
    taxPrice: 99.9,
    totalPrice: 1098.9
  };

  try {
    const result = await sendOrderConfirmationEmail(dummyOrder, process.env.EMAIL_USER, "Test User");
    console.log("Result:", result);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testEmail();
