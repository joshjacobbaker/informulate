# GitHub Actions Setup Guide

## Overview

Your GitHub Actions CI/CD pipeline is now configured with the following workflow:

### 1. CI Workflow (`.github/workflows/ci.yml`)
- **Triggers**: Push to `main`/`develop` branches, Pull Requests
- **Jobs**: Lint, Test, Build, Integration Tests, Security Audit

## Jobs Breakdown

### 🔍 **Lint Job**
- Runs ESLint
- TypeScript type checking
- Fails fast if code quality issues

### 🧪 **Test Job**
- Runs Jest tests with coverage
- Uploads coverage to Codecov
- Generates XML test results
- Uploads test artifacts

### 🏗️ **Build Job**
- Builds Next.js application
- Uses mock environment variables if secrets unavailable
- Uploads build artifacts

### 🔗 **Integration Test Job**
- Runs only on Pull Requests
- Tests API endpoints and configuration
- Depends on lint and test jobs

### 🛡️ **Security Job**
- npm audit for vulnerabilities
- Snyk security scanning
- Continues on error (non-blocking)

## Required Secrets

You need to configure these secrets in your GitHub repository settings:

### Repository Secrets (Settings → Secrets and variables → Actions)

#### For CI Pipeline:
```
CODECOV_TOKEN                   # Optional: Codecov upload token
SNYK_TOKEN                     # Optional: Snyk security scanning
NEXT_PUBLIC_SUPABASE_URL       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY      # Your Supabase service role key
OPENAI_API_KEY                 # Your OpenAI API key
```

## Environment Setup

### For Codecov (Optional):
1. Go to [Codecov](https://codecov.io)
2. Connect your repository
3. Get the upload token

### For Snyk (Optional):
1. Go to [Snyk](https://snyk.io)
2. Get your authentication token
3. Add to repository secrets

## Workflow Features

### ✅ **What's Working:**
- Parallel job execution for faster CI
- Comprehensive test coverage reporting
- Security vulnerability scanning
- Build artifact caching
- Manual deployment capability

### 🔧 **Recent Improvements:**
- Updated to latest GitHub Actions versions (v4)
- Added XML test reporting with jest-junit
- Enhanced error handling and reporting
- Better secret management

## Usage

### Automatic Triggers:
- **CI**: Runs on every push/PR to main/develop

## Monitoring

### Check Workflow Status:
- Go to Actions tab in your repository
- View individual job logs and artifacts
- Download coverage reports and test results

### Coverage Reports:
- View in Codecov dashboard (if configured)
- Download from workflow artifacts
- Check coverage trends over time

## Troubleshooting

### Common Issues:
1. **Missing Secrets**: Workflows will use mock values for build testing
2. **Test Failures**: Check Jest output in workflow logs
3. **Build Failures**: Verify environment variables and dependencies

### Debug Steps:
1. Check workflow logs in Actions tab
2. Verify all required secrets are set
3. Test locally with same Node.js version (18)
4. Check for dependency conflicts

## Next Steps

1. **Configure Secrets**: Add all required secrets for full functionality
2. **Monitor Coverage**: Set up Codecov integration
3. **Security**: Configure Snyk scanning
4. **Customize**: Adjust workflows based on your deployment needs

## Local Development

To run the same checks locally:
```bash
# Lint
npm run lint
npx tsc --noEmit

# Test with coverage
npm test -- --coverage

# Build
npm run build

# Integration tests
npm run test:all
```

Your GitHub Actions setup is now production-ready! 🚀
