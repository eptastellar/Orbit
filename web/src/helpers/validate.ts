//TODO
export function isValidBday(bday: number): boolean {
   return (((Date.now() - 441806400) - bday) >= 0)
}
