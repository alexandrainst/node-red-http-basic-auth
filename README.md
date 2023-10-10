# node-red-http-basic-auth

[Node-RED](https://nodered.org/) node for HTTP Basic Auth.

This Node-RED module performs [HTTP Basic authentication](https://developer.mozilla.org/docs/Web/HTTP/Authentication).
It is to be used in conjunction with an [HTTP Input node](https://cookbook.nodered.org/http/create-an-http-endpoint).

Supports [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) to store passwords
(such as in the [Apache password format](https://httpd.apache.org/docs/current/misc/password_encryptions.html)).

![flow.png](images/flow.png)

## Config

![flow.png](images/config.png)

There are three type of configuration:

1. *Simple*: each node has it’s own credentials. (one credential)
2. *Shared*: credentials shared with multiple nodes. (one credential)
3. *File*: the user credentials are stored in a file. (multiple credentials)

With all three config types you must specify the following:

- *Realm*: what authorization realm will be used with this node.

With *Simple* and *Shared* config types you must specify the following:

- *Username*: the username
- *Password*: the password may be in plain-text or hashed (only bcrypt is supported).

With *File* config type you must specify the following:

- File: location of the file containing the credentials relative to the presently working directory.
	The format for each line is `user:realm:password`.
	The passwords may be in plain-text or hashed (only bcrypt is supported).

### File Configuration

![file.png](images/file.png)

### Shared config

![cred.png](images/cred.png)

## Credits

Forked from [endemecio02/node-red-contrib-httpauth](https://github.com/endemecio02/node-red-contrib-httpauth) (abandoned)
by [Alexandre Alapetite](https://github.com/Alkarex) for the [Alexandra Institute](https://alexandra.dk/), October 2023.
