# Aztecs

[![Dependabot Updates](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/dependabot/dependabot-updates)
[![Build and push](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/build-and-push.yml)
[![pages-build-deployment](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/pages/pages-build-deployment)

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Contributing

### Git hooks (Husky v9)

Husky hooks are committed to the repo. After cloning, just install dependencies and the `pre-commit` hook will run automatically.

Quick start:

```sh
git clone <repo-url>
cd aztecs.github.io
npm ci   # or: npm install
```

The pre-commit hook runs `lint-staged` (Prettier + ESLint) on staged files.

If you need to add another hook (e.g. commit-msg):

```sh
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
chmod +x .husky/commit-msg
```

(No `husky install` needed for v9+.)

If dependencies are missing, the hook will fail fast; run `npm ci` and retry.

### Adding / updating lint rules

Edit `eslint.config.js`, then run:

```sh
npx eslint . --fix
```

Commit your changes; CI enforces zero warnings (`--max-warnings=0`).
