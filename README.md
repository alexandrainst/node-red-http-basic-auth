# @alexandrainst/node-red-http-basic-auth

[Node-RED](https://nodered.org/) node for HTTP Basic Auth.

This Node-RED module performs [HTTP Basic authentication](https://developer.mozilla.org/docs/Web/HTTP/Authentication).
It is to be used in conjunction with an [HTTP Input node](https://cookbook.nodered.org/http/create-an-http-endpoint).

Supports [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) to store passwords
(such as in the [Apache password format](https://httpd.apache.org/docs/current/misc/password_encryptions.html)).

![flow.png](images/flow.png)

## Config

There are three type of configuration:

1. *Simple*: each node has it’s own credentials. (one credential)
2. *Shared*: credentials shared with multiple nodes. (one credential)
3. *File*: the user credentials are stored in a file. (multiple credentials)

With all three config types you must specify the following:

- *Realm*: what authorization realm will be used with this node.

With *Simple* and *Shared* config types you must specify the following:

- *Username*: the username
- *Password*: the password may be in plain-text or hashed (only bcrypt is supported).
	Example of hashed password `test`:

```plain
$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6
```

With *File* config type you must specify the following:

- File: location of the file containing the credentials relative to the presently working directory.
	The format for each line is `user:realm:password`.
	The passwords may be in plain-text or hashed (only bcrypt is supported).
	Example of file:

```plain
user1:application1:test
user2:application1:$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6
```

## Hints

Here are examples to create hashed passwords:

### In Linux Debian / Ubuntu command line

```sh
sudo apt install apache2-utils
htpasswd -nbB -C 10 '' 'my-password' | cut -d: -f2
```

### With Node.js

```sh
npm install bcryptjs
node -e "console.log(require('bcryptjs').hashSync('my-password', 10));"
```

## Credits

Forked from [endemecio02/node-red-contrib-httpauth](https://github.com/endemecio02/node-red-contrib-httpauth) (abandoned)
by [Alexandre Alapetite](https://github.com/Alkarex) for the [Alexandra Institute](https://alexandra.dk/), October 2023.
