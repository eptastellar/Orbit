import { describe, expect, it } from "@jest/globals"
import { supernova } from "../supernova"

//jest.mock("..\\config\\neo4j.config.ts") //TODO Servirà un mock di test per impedire al testing di fare richieste al vero db

describe("supernova test suite", () => {
   it("should find a suitable match", async () => {
      const user = "8DBxwxXYIhSnyJEeFtY20nQaoBa2"
      const expectedFriend = "WfntpfW5x8glDtEAfDgCKWrSSfw1"

      //TODO @TheInfernalNick prova ad eseguire supernova per vedere i risultati, comando pnpm test, devono essere mockati i moduli di neo

      const result: string = await supernova(user)
      expect(result).toBe(expectedFriend)
   })
   it("should return an error because it cant find the user", async () => {
      const user = "EasterEgg"

      await supernova(user).catch((error) => { expect(error.message).toBe("User not found") })

   })
   it.todo("should return an error because it cant find new friends")
})

describe("meteor test suite", () => {
   it.todo("testcase for meteor functioning")
   it.todo("testcase for meteor in breaking conditions")
})
