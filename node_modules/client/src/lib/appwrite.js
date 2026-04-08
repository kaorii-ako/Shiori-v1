import { Client, ID, Databases, Account, Query } from 'appwrite'

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('shiori-dev')

const account = new Account(client)
const databases = new Databases(client)

export { client, account, databases, ID, Query }

export default client
