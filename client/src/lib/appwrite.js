import { Client, ID, Databases, Account, Query } from 'appwrite'

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'shiori-v1'

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)

const account = new Account(client)
const databases = new Databases(client)

export { client, account, databases, ID, Query }

export default client
