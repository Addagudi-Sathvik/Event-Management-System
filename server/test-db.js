require('dotenv').config();
const mongoose = require('mongoose');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI starts with srv://:', process.env.MONGO_URI?.startsWith('mongodb+srv://'));
async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ CONNECTION SUCCESS!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}
testConnection();

