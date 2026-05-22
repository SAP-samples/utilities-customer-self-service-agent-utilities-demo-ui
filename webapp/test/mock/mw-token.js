import axios from 'axios'
import https from 'https'
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = JSON.parse(fs.readFileSync(resolve(__dirname, '../../../', `config.json`), 'utf8'))
const fetchIasToken = async () => { 
    try {
      return (await axios.post(
        `${config.auth.url}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.auth.clientId,
          client_secret: config.auth.clientSecret,
          resource: `urn:sap:identity:application:provider:name:${config.auth.resource}`
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      )).data
    } catch (error) {
      console.log(error)
    }
  }

  let token = await fetchIasToken()
  let expirationDate = new Date(new Date().getTime() + token.expires_in * 1000)

  


  export default function () {
    return async function (req, res, next) {
        if (req.url.indexOf("/dssa/Conversation") > -1) {
            if (new Date() > expirationDate) {
                token = await fetchIasToken(secret)
                expirationDate = new Date(new Date().getTime() + token.expires_in * 1000)
            }
            req.headers.Authorization = `Bearer ${token.access_token}`
            next()
        } else {
          next()
        }
    };
}