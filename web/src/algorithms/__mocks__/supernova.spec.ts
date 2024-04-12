import { supernova } from "../supernova"

// jest.mock("@config/neo4j.config")

describe("supernova function", () => {
   it("should find a suitable match", async () => {
      const user = "Test"
      const expectedFriend = "Friend1"

      //TODO @TheInfernalNick prova ad eseguire supernova per vedere i risultati, comando pnpm test, devono essere mockati i moduli di neo

      const result = await supernova(user)
      expect(result).toBe(expectedFriend)
   })
})
