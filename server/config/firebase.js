import admin from 'firebase-admin';
import dotenv from "dotenv";
dotenv.config();
// Debug: Check if env vars are loaded
console.log('Firebase Config Debug:');
console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

// Parse the private key - handle both escaped and literal newlines
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Remove quotes if present
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: privateKey,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

console.log('Config object:', {
  projectId: firebaseConfig.projectId,
  clientEmail: firebaseConfig.clientEmail,
  privateKeyLength: firebaseConfig.privateKey?.length
});

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default admin;
