# @alexandrainst/node-red-http-basic-auth

[Node-RED](https://nodered.org/) node for HTTP Basic Auth.

This Node-RED module performs [HTTP Basic authentication](https://developer.mozilla.org/docs/Web/HTTP/Authentication).
It is to be used in conjunction with an [HTTP Input node](https://cookbook.nodered.org/http/create-an-http-endpoint).

Supports [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) to store passwords
(such as in the [Apache password format](https://httpd.apache.org/docs/current/misc/password_encryptions.html)).

## Example

Example of flow, with username `test` and password `test`: [`flow.json`](./examples/flow.json)

[![flow.png](images/flow.png)](./examples/flow.json)

Can be tested with e.g.:

```sh
curl 'https://test:test@nodered.example.net/basic-auth-demo'
```

## Config

There are three types of configuration:

1. *Simple*: each node has its own credentials. (one credential)
2. *Multiple credentials*: credentials shared with multiple nodes. (multiple credentials)
3. *File with multiple credentials*: the user credentials are stored in a file. (multiple credentials)

## Definitions

* *Realm*
	* Authorization realm for which the credentials will be valid
	* Example: `node-red`

* *Username*
	* The username
	* Example: `alice`

* *Password*
	* The password may be in plain-text or hashed (only bcrypt is supported)
	* Example in plain-text: `test`
	* Example in bcrypt: `$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6`

* *File*
	* Location of the file containing the credentials relative to the presently working directory
	* Example: `/data/.htpasswd`
	* The format for each line is `username:password`

</dl>

Example of file: (see also [Apache `htpasswd`](https://httpd.apache.org/docs/current/programs/htpasswd.html))

```plain
user1:test
user2:$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6
```

## Outputs

The first node output is used when the authentication succeeded, and it contains the username:

```json
"msg": {
	"username": "alice",
	"req": "...",
	"res": "...",
	"...": "..."
}
```

The second node output is used when the authentication failed, and it contains error information:

```json
"msg": {
	"username": "",
	"authError": "Unknown user 'test'",
	"req": "...",
	"res": "...",
	"...": "..."
}
```

Both outputs contain the `req` object, which can be inspected for detailed information about HTTP request headers, IP address, etc.

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
