declare global {
   namespace NodeJS {
      interface ProcessEnv {
         PORT: number
         WORK_FACTOR: number

         FIREBASE_PRIVATE_KEY: string
         FIREBASE_CLIENT_EMAIL: string
         FIREBASE_PROJECT_ID: string

         AURA_INSTANCE_ID: string
         AURA_INSTANCE_NAME: string
         NEO4J_URI: string
         NEO4J_USERNAME: string
         NEO4J_PASSWORD: string
      }
   }
}

export { }
