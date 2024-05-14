declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      JWT_SECRET_KEY: string;
      CRON_SECRET: string;

      FIREBASE_PRIVATE_KEY: string;
      FIREBASE_CLIENT_EMAIL: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_BUCKET_ID: string;

      AURA_INSTANCE_ID: string;
      AURA_INSTANCE_NAME: string;
      NEO4J_URI: string;
      NEO4J_USERNAME: string;
      NEO4J_PASSWORD: string;
    }
  }
}

export {};
