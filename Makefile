node_modules/.bin/eslint:
	npm install

npm-fix: node_modules/.bin/eslint
	npm run-script fix

npm-test: node_modules/.bin/eslint
	npm test

.PHONY: fix
fix: npm-fix

.PHONY: test
test: npm-test
