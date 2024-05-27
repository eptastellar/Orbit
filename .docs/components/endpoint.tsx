import styles from './enpoint.module.css'

const Endpoint = ({
   method,
   path,
   reqType,
   resType,
   contentType,
   parameters,
   tokenType
} : {
   method: string,
   path: string,
   reqType: string,
   resType: string,
   contentType: string,
   parameters: string[],
   tokenType: string
}) => {
   // TODO rendere leggibile il testo
   return (
      <>
         <br />
         <b><p className={styles.method}>{method}</p></b>

         <code>
            <b>{path}</b>
         </code>



         <h5 color='red'>Request</h5>
         <b><h6>Body</h6></b>
         <table>
            <th>
               <code>TypeScript Type</code>
            </th>
            <tr>
               <td>{reqType}</td>
            </tr>
         </table>

         <b><h6>Parameters</h6></b>
         {parameters ? (
            parameters.map((el) => (
               <code>{el}</code>
            ))
         ) : (
            <code>None</code>
         )}

         <b><h6>Headers</h6></b>
         <code>Content-Type: {contentType}</code>

         <b><h6>Authorization</h6></b >
         <table>
            <th><code>Type</code></th>
            <th><code>Description</code></th>
            <tr>
               <td>Bearer</td>
               <td>{tokenType}</td>
            </tr>
         </table>

         <h5>Response</h5>
         <table>
            <th><code>TypeScript Type</code></th>
            <tr>
               <td>{resType}</td>
            </tr>
         </table>
         <br />
      </>
   );
};

export default Endpoint