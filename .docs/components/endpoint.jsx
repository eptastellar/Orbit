import styles from './endpoint.module.css';

const Endpoint = ({
   method,
   path,
   reqType,
   resType,
   contentType,
   parameters,
   tokenType
}) => {
   // TODO rendere leggibile il testo
   return (
      <>
         <p className={styles.method}>{method}</p>
         <code>
            <b>{path}</b>
         </code>

         <h5>Request</h5>
         <h6>Body</h6>
         <table>
            <th>
               <code>TypeScript Type</code>
            </th>
            <tr>
               <td>{reqType}</td>
            </tr>
         </table>

         <h6>Parameters</h6>
         {parameters ? (
            parameters.map((el) => (
               <code>{el}</code>
            ))
         ) : (
            <code>None</code>
         )}

         <h6>Headers</h6>
         <code>Content-Type: {contentType}</code>

         <h6>Authorization</h6>
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
      </>
   );
};

export default Endpoint
