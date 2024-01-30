import { uploadPost } from '@contexts/ContentContext'
import { isValidContentType } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.post('/', async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const type: string = req.body.type
   const content: string = req.body.content

   Promise.all([
      isValidContentType(content, type)
   ])
      .then(() => {
         uploadPost(uid, type, content).then((postId) => {
            res.status(201).json({ success: true, post: postId }) //return the post id
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

// app.get('/:id', async (req: Request, res: Response) => { //get the specific post based from is id
//    const id: string = req.params.id

//    const db: Firestore = admin.firestore()
//    const docRef: DocumentReference = db.collection('posts').doc(id) //set the docRef to posts and id

//    const doc: DocumentData = await docRef.get()
//    if (doc.exists) { //if the document exists
//       const { username, name, pfp } = await retrieveUserDataFromUID(doc.data()?.owner) //retrive post owner informations
//       const content: string = doc.data()?.content
//       const type: string = doc.data()?.type
//       const likes_number: number = doc.data()?.likes_number
//       // const comments_number = doc.data()?.comments_number

//       res.statusjson({
//          success: true,
//          status: 200,
//          type: type,
//          content: content,
//          likes_number: likes_number,
//          //TODO comments_number: comments_number,
//          created: doc.createTime.seconds,
//          username: username,
//          name: name,
//          pfp: pfp,
//       })
//    } else res.statusjson({ success: false, status: 404, message: 'resource/post-not-found' })
// })

//TODO patch e delete
export default app
