import { checkIfSessionTokenIsValid } from "@contexts/AuthContext";
import { getPostOwner, updateLike } from "@contexts/ContentContext";
import { areFriends } from "@contexts/UserContext";
import { postIdValidation } from "@contexts/ValidationContext";
import { Request, Response } from "express";

export const POST = [checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const postId: string = req.params.id

   postIdValidation(postId).then(async () => {
      getPostOwner(postId).then((post_owner: string) => {
         areFriends(tokenUid, post_owner).then(() => {
            updateLike(postId, tokenUid).then(() => {
               res.status(200).json({ success: true })
            }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
