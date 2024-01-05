import { ServiceAccount, cert, getApps, initializeApp } from 'firebase-admin/app';

export function baas() {
   const privateKey = process.env.FIREBASE_PRIVATE_KEY;

   if (privateKey) {
      const formattedPrivateKey: string = formatPrivateKey(privateKey)

      const firebaseAccount: ServiceAccount = {
         privateKey: formattedPrivateKey,
         projectId: process.env.FIREBASE_PROJECT_ID,
         clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      }

      const firebaseAdminConfig = {
         credential: cert(firebaseAccount),
         storageBucket: process.env.FIREBASE_BUCKET_ID
      }

      if (getApps().length <= 0)
         initializeApp(firebaseAdminConfig)
   }
}

function formatPrivateKey(key: string): string {
   return key.replace(/\\n/g, "\n");
}
