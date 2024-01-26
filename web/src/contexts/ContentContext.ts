import { firebase, firestorage } from '@config/firebase-admin.config'

firebase()
const bucket = firestorage()

export async function randomProfilePicture(): Promise<string> {
   const prefix: string = 'default/images'

   return new Promise((resolve, _) => {
      bucket.getFiles({ prefix: prefix }, (_, files) => { // get the files from the bucket with the defined prefix
         const urls: string[] = []
         if (files) {
            files.splice(0, 1) // remove the first file from the files array

            Promise.all(
               files.map(file => // map over the files array and create a new promise for each file
                  file.getSignedUrl({
                     action: 'read',
                     expires: Date.now() + 30 * 24 * 60 * 60 * 1000 * 12 * 10, // expiration set to 10 years from now
                  })
               )
            ).then(results => {
               results.forEach(result => { // push the result of each promise (the generated URL) into the urls array
                  urls.push(result[0])
               })
               resolve(urls[Math.floor(Math.random() * urls.length)]) // resolve the promise with a random URL from the urls array
            })
         }
      })
   })
}
