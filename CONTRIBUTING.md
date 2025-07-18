# Contributing to AI Trivia Arena

Thank you for your interest in contributing to AI Trivia Arena! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- A Supabase account (for backend features)
- An OpenAI API key (for AI features)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-trivia-arena.git
   cd ai-trivia-arena
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Test Your Setup**
   ```bash
   npm run test:config
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting (Prettier + ESLint)
- Write descriptive commit messages following conventional commits
- Add JSDoc comments for complex functions

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(openai): add support for custom difficulty levels
fix(supabase): resolve connection timeout issues
docs(readme): update installation instructions
```

### Branch Naming
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

## 🧪 Testing

### Run Tests
```bash
# Configuration tests
npm run test:config

# OpenAI integration tests
node test-openai.mjs

# Linting
npm run lint
```

### Writing Tests
- Write tests for new features
- Ensure existing tests pass
- Test edge cases and error conditions
- Use descriptive test names

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node.js version, browser, etc.
6. **Screenshots**: If applicable

## 💡 Feature Requests

For new features:
1. **Check existing issues** to avoid duplicates
2. **Describe the feature** clearly
3. **Explain the use case** and benefits
4. **Provide examples** if possible

## 📋 Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow the coding guidelines
   - Add tests if applicable
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run test:config
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Add screenshots for UI changes
   - Ensure all checks pass

## 📚 Project Structure

```
src/
├── app/                    # Next.js app directory
├── lib/
│   ├── supabase/          # Database integration
│   ├── openai/            # AI integration
│   └── config.ts          # Configuration
├── components/            # React components
└── types/                 # Shared TypeScript types
```

## 🎯 Areas for Contribution

### High Priority
- Database schema implementation
- Edge Functions for backend logic
- React components for the game UI
- Real-time integration with Supabase

### Medium Priority
- UI/UX improvements
- Error handling enhancements
- Performance optimizations
- Additional game features

### Low Priority
- Code documentation
- Testing improvements
- Developer tooling
- Deployment automation

## 🤝 Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Maintain a positive environment

## 📞 Getting Help

- **Issues**: Create a GitHub issue
- **Questions**: Start a discussion
- **Urgent**: Contact maintainers

## 🎉 Recognition

Contributors will be recognized in:
- The README.md file
- Release notes
- Special thanks in major releases

Thank you for contributing to AI Trivia Arena! 🎯
