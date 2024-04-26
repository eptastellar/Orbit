import { afterAll, describe, expect, it } from "@jest/globals"
import { SupernovaAlgorithm } from "algorithms"
import { close } from "config"

//jest.mock("..\\config\\neo4j.config.ts") //TODO Servirà un mock di test per impedire al testing di fare richieste al vero db

describe("supernova test suite", () => {
   it("should find a suitable match", async () => {
      const user: string = "8DBxwxXYIhSnyJEeFtY20nQaoBa2"
      const expectedFriend: string = "WfntpfW5x8glDtEAfDgCKWrSSfw1"

      const result: string = await new SupernovaAlgorithm().supernova(user)
      expect(result).toBe(expectedFriend)
   })
   it("should return an error because it cant find the user", async () => {
      const user: string = "EasterEgg"

      await new SupernovaAlgorithm().supernova(user).catch((error) => { expect(error.message).toBe("User not found") })

   })

   it("should return an error because it cant find new friends", async () => {
      const user: string = "W2LpFm9EjDfduD3NqpN1XpeRVbJ2"

      await new SupernovaAlgorithm().supernova(user).catch((error) => { expect(error.message).toBe("Impossible to find new friends") })
   })

   it("should find the friend of the friend in the database", async () => {
      const startingUser: string = "h3yZKtMRYfUvxLeijmSr5SKeCnl2"

      const result: string = await new SupernovaAlgorithm().supernova(startingUser)
      expect(result).toBe("jLlAgYRXh5XD5DaABy8zLy3fqUf1")
   })
})

describe("meteor test suite", () => {
   it.todo("testcase for meteor functioning")
   it.todo("testcase for meteor in breaking conditions")
})

afterAll(() => {
   close()
})
