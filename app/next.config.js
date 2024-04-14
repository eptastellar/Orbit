/** @type {import("next").NextConfig} */
module.exports = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "firebasestorage.googleapis.com",
            pathname: "/v0/b/eptastellar-orbit.appspot.com/**",
         },
         {
            protocol: "https",
            hostname: "storage.googleapis.com",
            pathname: "/eptastellar-orbit.appspot.com/default/**",
         },
         {
            protocol: "https",
            hostname: "firebasestorage.googleapis.com",
            pathname: "/v0/b/dev-orbit-1.appspot.com/**",
         },
         {
            protocol: "https",
            hostname: "storage.googleapis.com",
            pathname: "/dev-orbit-1.appspot.com/default/**",
         },
      ],
   },
}
