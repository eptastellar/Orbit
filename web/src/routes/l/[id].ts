import { checkIfSessionTokenIsValid } from "@contexts/AuthContext";
import { getPostOwner } from "@contexts/ContentContext";
import { areFriends, updateLike } from "@contexts/UserContext";
import { postIdValidation } from "@contexts/ValidationContext";
import { Request, Response } from "express";

export const POST = [checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const postId: string = req.params.id

   postIdValidation(postId).then(async () => {
      areFriends(tokenUid, await getPostOwner(postId)).then(() => {
         updateLike(postId, tokenUid).then((likes_number: number) => {
            res.status(200).json({ success: true, likes_number: likes_number })
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
