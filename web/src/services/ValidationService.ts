import { interests } from "assets"
import { err, firebase, firestorage, firestore } from "config"
import { DocumentData, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"

export default class ValidationService {
   private db: Firestore
   private bucket

   constructor() {
      firebase()
      this.db = firestore()
      this.bucket = firestorage()
   }

   public birthdateValidation = async (bday: number): Promise<null> => {
      return new Promise((resolve, reject) => {
         try {
            if (!bday || bday > Date.now() / 1000 || bday < -2208988800)
               reject(err("validation/invalid-birthdate"))

            if (((Date.now() / 1000 - 441806400) - bday) <= 0)
               reject(err("validation/too-young"))

            resolve(null)
         } catch { reject(err("validation/malformed-input")) }
      })
   }

   public usernameValidation = async (username: string): Promise<null> => {
      return new Promise((resolve, reject) => {
         try {
            const regex: RegExp = /[^a-zA-Z0-9\_\-\.]/

            if (!username || !username.startsWith("@") || username.substring(1).match(regex)) //check if the username i approved by the regex
               reject(err("validation/invalid-username"))

            if (username.length > 24 + 1)
               reject(err("validation/username-too-long"))

            if (username.length < 6 + 1)
               reject(err("validation/username-too-short"))

            const usersRef: Query = this.db.collection("users").where("username", "==", username) //search where the username is equal to the input username

            usersRef.get().then(async (snapshot: QuerySnapshot) => {
               if (snapshot.empty) //check if username is already used
                  resolve(null)
               else reject(err("validation/username-already-in-use"))
            })
         } catch { reject(err("validation/malformed-input")) }
      })
   }

   public interestsValidation = async (interestsList: string[]): Promise<null> => {
      return new Promise((resolve, reject) => {
         try {
            if (interestsList.length > 5 || interestsList.length < 1)
               reject(err("validation/invalid-number-of-interests"))

            interestsList.forEach(element => {
               if (!interests.includes(element))
                  reject(err("validation/invalid-interests"))
            })
            resolve(null)
         } catch { reject(err("validation/malformed-input")) }
      })
   }

   public postIdValidation = (postId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = await this.db.collection("posts").doc(postId).get()

            if (docRef.exists)
               resolve(null)
            else reject(err("validation/invalid-document-id"))
         } catch { reject(err("validation/invalid-document-id")) }
      })
   }

   public commentRootIdValidation = async (rootId: string, postId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = await this.db.collection("comments").doc(rootId).get() //retrieve the root comment

            if (docRef.exists) {
               if (docRef.data()?.postId === postId)
                  resolve(null)
               else reject(err("validation/invalid-document-id"))
            } else reject(err("validation/invalid-document-id"))
         } catch { reject(err("validation/invalid-document-id")) }
      })
   }

   public commentLeafIdValidation = async (leafId: string, rootId: string, postId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const leafRef: DocumentData = await this.db.collection("comments").doc(leafId).get() //retrieve the leaf comment
            const rootRef: DocumentData = await this.db.collection("comments").doc(rootId).get() //retrieve the root comment

            if (rootRef.exists) {
               if (rootRef.data()?.postId === postId) {
                  if (leafRef.data()?.postId === postId) {
                     if (leafRef.data()?.root === rootId)
                        resolve(null)
                     else reject(err("validation/invalid-document-id"))
                  } else reject(err("validation/invalid-document-id"))
               } else reject(err("validation/invalid-document-id"))
            } else reject(err("validation/invalid-document-id"))
         } catch { reject(err("validation/invalid-document-id")) }
      })
   }

   public contentValidation = async (text?: string, content?: string, type?: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            if (content) {
               if (text) await this.harmfulContentValidation(text)

               if (type === "image" || type === "audio")
                  await this.mediaValidation(content)
               else reject(err("validation/malformed-input"))
            } else {
               if (text)
                  await this.harmfulContentValidation(text)
               else reject(err("validation/malformed-input"))
            }
            resolve(null)
         } catch (error) { reject(error) }
      })
   }


   public mediaValidation = (media: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         const cleanURL: string = media.split("appspot.com/o/")[1]
         const removeToken: string = cleanURL.split("?")[0]

         const formattedPath: string = removeToken.replace(/%2F/g, "/")
         const fileRef = this.bucket.file(decodeURIComponent(formattedPath))

         fileRef.exists().then((exists) => {
            if (exists[0])
               resolve(null)
            else reject(err("validation/invalid-image-path"))
         })
      })
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public harmfulContentValidation = (text: string): Promise<null> => { //TODO
      return new Promise((resolve) => {
         resolve(null)
      })
   }
}
