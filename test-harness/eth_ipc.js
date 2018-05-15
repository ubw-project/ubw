// import the actual Api class 
import { Api } from '@parity/parity.js';
 
// do the setup 
const transport = new Api.Transport.Http('http://localhost:8545');
const api = new Api(transport);