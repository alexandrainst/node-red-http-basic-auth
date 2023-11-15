#!/bin/sh

# Accept password saved as bcrypt, also a second attempt (cached)

test=$(
	cat <<EOF | node ./index.js http-basic-auth --realm='"node-red"' --username='"test"' --password='"$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6"'
{"req":{"headers":{"authorization":"Basic $(printf 'test:test' | base64 -w 0)"}}}
{"req":{"headers":{"authorization":"Basic $(printf 'test:test' | base64 -w 0)"}}}
EOF
)

if [ "$test" = "" ]; then
	echo 'ERROR 1'
	exit 1
fi

# Accept password saved as plain-text

test=$(
	cat <<EOF | node ./index.js http-basic-auth --realm='"node-red"' --username='"test"' --password='"test"'
{"req":{"headers":{"authorization":"Basic $(printf 'test:test' | base64 -w 0)"}}}
EOF
)

if [ "$test" = "" ]; then
	echo 'ERROR 2'
	exit 1
fi

# Reject wrong user

test=$(
	cat <<EOF | node ./index.js http-basic-auth --realm='"node-red"' --username='"wrong"' --password='"test"'
{"req":{"headers":{"authorization":"Basic $(printf 'test:test' | base64 -w 0)"}}}
EOF
)

if [ "$test" != "" ]; then
	echo 'ERROR 3'
	exit 1
fi

# Reject wrong password

test=$(
	cat <<EOF | node ./index.js http-basic-auth --realm='"node-red"' --username='"test"' --password='"wrong"'
{"req":{"headers":{"authorization":"Basic $(printf 'test:test' | base64 -w 0)"}}}
EOF
)

if [ "$test" != "" ]; then
	echo 'ERROR 4'
	exit 1
fi

# Do not accept bcrypt passwords as input (only plain-text passwords)

test=$(
	cat <<EOF | node ./index.js http-basic-auth --realm='"node-red"' --username='"test"' --password='"$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6"'
{"req":{"headers":{"authorization":"Basic $(printf 'test:$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6' | base64 -w 0)"}}}
EOF
)

if [ "$test" != "" ]; then
	echo 'ERROR 5'
	exit 1
fi
