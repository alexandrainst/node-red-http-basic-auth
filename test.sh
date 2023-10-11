#!/bin/sh

test=$(
	cat <<'EOF' | node ./index.js http-basic-auth --realm='"node-red"' --username='"test"' --password='"$2y$10$5TSZDldoJ7MxDZdtK/SG2O3cwORqLDhHabYlKX9OsM.W/Z/oLwKW6"'
{"req":{"headers":{"authorization":"Basic dGVzdDp0ZXN0"}}}
EOF
)

ref=$(
	cat <<'EOF'
{"payload":"A"}
EOF
)

if [ "$test" = "$ref" ]; then
	echo 'OK'
	exit 0
else
	echo 'ERROR'
	exit 1
fi
