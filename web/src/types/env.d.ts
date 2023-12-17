declare global {
   namespace NodeJS {
      interface ProcessEnv {
         WORK_FACTOR: number

         SUPABASE_KEY: string
         SUPABASE_URL: string

         AURA_INSTANCE_ID: string
         AURA_INSTANCE_NAME: string
         NEO4J_URI: string
         NEO4J_USERNAME: string
         NEO4J_PASSWORD: string
      }
   }
}

export { }
