# GitHub Upload Guide

This folder is ready to upload to GitHub.

## Recommended upload steps

1. Create a new empty GitHub repository.
2. Upload all files in this folder except anything ignored by `.gitignore`.
3. After upload, clone the repository on another machine and run:

```bash
npm install
npm run dev
```

## Vercel note

This project is now structured for Vercel deployment with:

- Vercel serverless API route
- Postgres database
- Vite frontend build output in `dist`

Before deploying, configure the Vercel environment variables listed in `README.md`.
