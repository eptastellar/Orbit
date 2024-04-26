import { interests } from "assets"
import { err, firebase, firestorage, firestore } from "config"
import { DocumentData, Firestore, QuerySnapshot } from "firebase-admin/firestore"
import { AuthService } from "services"

export default class ValidationService {
   private db: Firestore
   private bucket
   private auth: AuthService

   constructor() {
      firebase()
      this.db = firestore()
      this.bucket = firestorage()
      this.auth = new AuthService()
   }

   public birthdateValidation = async (bday: number): Promise<null> => {
      return new Promise((resolve, reject) => {
         try {
            if (!bday || bday > Date.now() / 1000 || bday < -2208988800)
               return reject(err("validation/invalid-birthdate"))

            if (((Date.now() / 1000 - 441806400) - bday) <= 0)
               return reject(err("validation/too-young"))

            return resolve(null)
         } catch { return reject(err("validation/malformed-input")) }
      })
   }

   public usernameValidation = async (username: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const regex: RegExp = /[^a-zA-Z0-9\_\-\.]/

            if (!username || !username.startsWith("@") || username.substring(1).match(regex)) //check if the username i approved by the regex
               return reject(err("validation/invalid-username"))

            if (username.length > 24 + 1)
               return reject(err("validation/username-too-long"))

            if (username.length < 6 + 1)
               return reject(err("validation/username-too-short"))

            const snapshot: QuerySnapshot = await this.db.collection("users") //search where the username is equal to the input username
               .where("username", "==", username)
               .get()

            if (snapshot.empty) //check if username is already used
               return resolve(null)
            else return reject(err("validation/username-already-in-use"))
         } catch { return reject(err("validation/malformed-input")) }
      })
   }

   public interestsValidation = async (interestsList: string[]): Promise<null> => {
      return new Promise((resolve, reject) => {
         try {
            if (interestsList.length > 5 || interestsList.length < 1)
               return reject(err("validation/invalid-number-of-interests"))

            interestsList.forEach(element => {
               if (!interests.includes(element))
                  return reject(err("validation/invalid-interests"))
            })
            return resolve(null)
         } catch { return reject(err("validation/malformed-input")) }
      })
   }

   public documentIdValidation = (id: string, path: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = await this.db.collection(path).doc(id).get()

            if (docRef.exists)
               return resolve(null)
            else return reject(err("validation/invalid-document-id"))
         } catch { return reject(err("validation/invalid-document-id")) }
      })
   }

   public commentRootIdValidation = async (rootId: string, postId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = await this.db.collection("comments").doc(rootId).get() //retrieve the root comment

            if (docRef.exists) {
               const data: DocumentData = await docRef.data()
               if (data.post_id === postId)
                  return resolve(null)
               else return reject(err("validation/invalid-document-id"))
            } else return reject(err("validation/invalid-document-id"))
         } catch { return reject(err("validation/invalid-document-id")) }
      })
   }

   public commentLeafIdValidation = async (leafId: string, rootId: string, postId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const leafRef: DocumentData = await this.db.collection("comments").doc(leafId).get() //retrieve the leaf comment
            const rootRef: DocumentData = await this.db.collection("comments").doc(rootId).get() //retrieve the root comment
            const leafData: DocumentData[string] = rootRef.data()
            const rootData: DocumentData[string] = leafRef.data()

            if (rootRef.exists) {
               if (rootData.post_id === postId) {
                  if (leafData.post_id === postId) {
                     if (leafData.root_id === rootId)
                        return resolve(null)
                     else return reject(err("validation/invalid-document-id"))
                  } else return reject(err("validation/invalid-document-id"))
               } else return reject(err("validation/invalid-document-id"))
            } else return reject(err("validation/invalid-document-id"))
         } catch { return reject(err("validation/invalid-document-id")) }
      })
   }

   public contentValidation = async (text?: string, content?: string, type?: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            if (content) {
               if (text) await this.harmfulContentValidation(text)

               if (type === "image" || type === "audio")
                  await this.mediaValidation(content)
               else return reject(err("validation/malformed-input"))
            } else {
               if (text)
                  await this.harmfulContentValidation(text)
               else return reject(err("validation/malformed-input"))
            }
            return resolve(null)
         } catch (error) { return reject(error) }
      })
   }

   public mediaValidation = (media: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const cleanURL: string = media.split("appspot.com/o/")[1]
            const removeToken: string = cleanURL.split("?")[0]

            const formattedPath: string = removeToken.replace(/%2F/g, "/")
            const fileRef = this.bucket.file(decodeURIComponent(formattedPath))

            fileRef.exists().then((exists) => {
               if (exists[0])
                  return resolve(null)
               else return reject(err("validation/invalid-image-path"))
            })
         } catch { return reject(err("malformed url")) }
      })
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public harmfulContentValidation = (text: string): Promise<null> => { //TODO
      return new Promise((resolve) => {
         return resolve(null)
      })
   }

   public membersValidation = (uid: string, members: string[]): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            if (members.length < 2)
               return reject(err("troppi pochi utenti, almeno 2"))

            await Promise.all(members.map(async (member) => {
               const snapshot: QuerySnapshot = await this.db.collection("users")
                  .where("username", "==", member)
                  .get()

               if (!snapshot.empty) {
                  for (let i = 0; i < snapshot.docs.length; i++) {
                     const doc: DocumentData = snapshot.docs[i]
                     const data: DocumentData = await doc.data()

                     if (uid !== doc.id)
                        await this.auth.areFriendsGuard(uid, doc.id)

                     if (member !== data.username)
                        await this.auth.areFriendsGuard(member, doc.id) // if all friends are friends with everyone
                  }
               } else return reject(err("empty"))
            }))

            return resolve(null)
         } catch (error) { return reject(error) }
      })
   }
}
