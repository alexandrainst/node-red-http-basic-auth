# node-red-http-basic-auth

Node-RED node for HTTP Basic Auth.

This Node-RED module performs HTTP Basic authentication.
It is to be used in conjunction with an HTTP Input node.

![flow.png](images/flow.png)

## Config

![flow.png](images/config.png)

There are three type of configuration:

 1. File: the user credentials are stored in a file. (mutliple credentials)
 2. Shared: credentials shared which multiple nodes. (one credential)
 3. Not Shared: each node has it's own credentials. (one credential)

With all three config types you must specify the following:

 - Realm: what realm will be used with this node
 - Hashed: are the passwords in the Password field or in the credentials file hashed.

With Shared and Not Shared config types you must specify the following:

 - Username: the username
 - Password: the password
   If you entered a hashed password you must check the Hashed checkbox.

With File config type you must specify the following:

 - File: location of the file containing the credentials relative to the presently working directory
   If the password are hashed you must check the Hashed checkbox.

### File Configuration

![file.png](images/file.png)

### Shared config

![cred.png](images/cred.png)

## Credits

Forked from [endemecio02/node-red-contrib-httpauth](https://github.com/endemecio02/node-red-contrib-httpauth) (abandonned)
by [Alexandre Alapetite](https://github.com/Alkarex) for the [Alexandra Institute](https://alexandra.dk/), October 2023.
