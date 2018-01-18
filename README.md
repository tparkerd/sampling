# sampling
### [Demo](http://cop4935group19.ddns.net/)

### Installation and Setup
#### Step 0: Dependencies<sup>1</sup>
1. [Node](https://nodejs.org/en/)
2. [MySQL](https://dev.mysql.com/downloads/installer/)
3. [Git](https://git-scm.com/)

<sup>1</sup> If you are running on a linux distro, install the appropriate dependencies with your package manager of choice

#### Step 1: Installation
###### Linux
```
# Download
git clone https://github.com/tparkerd/sampling.git
# Install
cd sampling && sudo npm install
# Create database
node created_database.js
# Run server
npm start
```

###### Windows
```
# Download
git clone https://github.com/tparkerd/sampling.git
# Install
cd sampling && npm install
# Create database
node created_database.js
# Run server
npm start
```

##### Step 2: Create an environment file in root directory (.env)
```
PORT=<an open port>
DBHOST=localhost
DBUSER=<user of database>
DBPASS=<password for database>
DBNAME=classifier
SECRET=<some secret passphrase>
USERTABLE=users
CLASSIFICATIONTABLE=classifications
```

Without any errors, you should see the following text in your terminal:
`Server started and listening on port 3000.`

## To-dos
- Add constraint to classifications table so that the user can only submit one
- evaluation per sample, so it would be `CONSTRAINT UNIQUE (sample_id, user_id)`
- `ALTER TABLE classifications ADD CONSTRAINT UNIQUE (sample_id, user_id)`
- Switch auto-deploy over to two separate scripts, `install.sh` and `update.sh`
- Consider putting in graphs
- Classify on more than just depressed or not, perhaps put flags for the symptoms of depression
- Remove password being passed back to the client
- Post Details: ID, full text, view page
  Be able to pull up samples by ID, get the full text, details and possible rate it themselves.
  It would be nice to be able to link it to someone else to also evaluate.

- Reset Password Setup
1. Create form asking for email
2. Create token for that email the user table, so this might require that the token is generated and saved in the user table along with an expiration date
