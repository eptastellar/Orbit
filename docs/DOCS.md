# Technical documentation

#### Introduction

---

## API documentation

#### Authentication

> ##### Response status

<table>
   <th>Status</th>
   <th>Summary</th>

   <tr>
      <td>auth/invalid-token</td>
      <td>Firebase or session's token are invalid</td>
   </tr>
   <tr>
      <td>auth/email-unverified</td>
      <td>User personal email is unverified</td>
   </tr>
   <tr>
      <td>auth/invalid-username</td>
      <td>Requested username is already in use </td>
   </tr>
   <tr>
      <td>auth/user-not-signed-up</td>
      <td>User need to be signed up to make any request</td>
   </tr>
   <tr>
      <td>auth/expired-token</td>
      <td>Returned if the session (4w) or access token (1h) are expired</td>
   </tr>
</table>

> ##### Endpoints

<details>
   <summary>
      <code>POST</code>
      <code><b>/auth/sign-up</b></code>
   </summary>

   <h4>Request</h4>

   <h5>Body</h5>
   <table>
      <th><code>Name</code></th>
      <th><code>Type</code></th>
      <tr>
         <td>username</td>
         <td>string</td>
      </tr>
   </table>

   <h5>Parameters</h5>
   <code>None</code>

   <h5>Headers</h5>
   <code>Content-Type: application/json</code>

   <h5>Authorization</h5>
   <table>
      <th><code>Type</code></th>
      <th><code>Description</code></th>
      <tr>
         <td>Bearer</td>
         <td>Firebase Auth JWT</td>
      </tr>
   </table>

   <h4>Response</h4>
   <details>
      <summary><code>{ success: true, status: 200, jwt: jwt, username: username }</code></summary>
      </br>
      <table>
      <th><code>Name</code></th>
      <th><code>Description</code></th>
      <tr>
         <td>jwt</td>
         <td>Session JWT</td>
      </tr>
      <tr>
         <td>username</td>
         <td>Personal user logged username</td>
      </tr>
      </table>
   </details>
</details>

---

#### Validation

> ##### Response status

> ##### Endpoints

---

#### Resource

> ##### Response status

> ##### Endpoints

---

#### Server

> ##### Response status

<table>
   <th>Status</th>
   <th>Summary</th>

   <tr>
      <td>server/driver-not-found</td>
      <td>Neo4j driver has crushed</td>
   </tr>
</table>

> ##### Endpoints
>
> <code>None</code>

---
