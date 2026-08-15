# Security

## Secret handling

This repository follows a strict no-secrets-in-Git policy.

### Never commit
- `.env`
- `.env.*` environment variants
- API keys
- access tokens
- signing certificates
- private keys
- provisioning profiles
- production credentials

### Allowed
- `.env.example`, containing variable names and safe placeholder values only.

### Local development
Create local environment files from `.env.example` when needed:

```bash
cp .env.example .env
```

Keep all real values in the ignored `.env` file.

### Before committing
Always inspect staged files:

```bash
git status
git diff --cached
```

If a secret is ever staged accidentally, remove it from the index before committing and rotate the exposed credential if it was already committed or pushed.
