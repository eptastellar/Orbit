
export function isValidEmail(email: string): boolean {
   const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   return regex.test(email)
}

export function isValidPassword(password: string): boolean {
   const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
   return regex.test(password)
}

export function isValidName(name: string): boolean {
   if (!name)
      return false;
   const regex = /^[a-zA-Z]+(?:-[a-zA-Z]+)*$/;
   return regex.test(name);
}

export function isValidBirthday(bday: number[]): boolean {
   const day = bday[0]
   const month = bday[1]
   const year = bday[2]

   if (
      !/^[1-9]|[12]\d|3[01]$/.test(day.toString()) &&
      !/^0?[1-9]|1[012]$/.test(month.toString()) &&
      !/^\d{4}$/.test(year.toString())
   )
      return false
   return true
}

export function isValidPfp(pfp: string): boolean {
   //TODO:
   return true;
}
