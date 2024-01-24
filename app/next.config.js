/** @type {import(import("next").NextConfig)} */
module.exports = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "firebasestorage.googleapis.com",
            pathname: "/v0/b/eptastellar-orbit.appspot.com/**",
         },
      ],
   },
}
