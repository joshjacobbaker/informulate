#!/usr/bin/env node

/**
 * Test runner for Edge Functions
 */

import { runEdgeFunctionTests } from './src/lib/tests/edge-functions.test.js'

async function main() {
  try {
    await runEdgeFunctionTests()
    process.exit(0)
  } catch (error) {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  }
}

main()
