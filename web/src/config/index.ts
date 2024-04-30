import { err, resError } from "./error"
import { firebase, firestorage, firestore } from "./firebase-admin.config"
import { close, neo } from "./neo4j.config"

export {
   close,
   err,
   firebase,
   firestorage,
   firestore,
   neo,
   resError
}
