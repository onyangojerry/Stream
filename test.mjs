#!/usr/bin/env node

/**
 * Striim Video Platform Test Suite
 * Validates project structure, dependencies, and basic functionality
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warn: '⚠️'
    };
    console.log(`${prefix[type]} ${message}`);
  }

  async runTest(name, testFn) {
    try {
      await testFn();
      this.passed++;
      this.log(`${name}`, 'success');
    } catch (error) {
      this.failed++;
      this.log(`${name}: ${error.message}`, 'error');
    }
  }

  // Test if essential files exist
  async testProjectStructure() {
    const requiredFiles = [
      'package.json',
      'tsconfig.json', 
      'vite.config.ts',
      'index.html',
      'src/main.tsx',
      'src/App.tsx',
      'src/index.css'
    ];

    for (const file of requiredFiles) {
      const filePath = join(this.projectRoot, file);
      if (!existsSync(filePath)) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
  }

  // Test package.json validity
  async testPackageJson() {
    const packagePath = join(this.projectRoot, 'package.json');
    const content = readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);
    
    if (!pkg.name || !pkg.scripts || !pkg.dependencies) {
      throw new Error('package.json missing essential fields');
    }
  }

  // Test if core dependencies are available  
  async testDependencies() {
    const { stdout } = await execAsync('npm ls --depth=0 --json');
    const deps = JSON.parse(stdout);
    
    const requiredDeps = ['react', 'react-dom', 'typescript', 'vite'];
    for (const dep of requiredDeps) {
      if (!deps.dependencies || !deps.dependencies[dep]) {
        throw new Error(`Missing core dependency: ${dep}`);
      }
    }
  }

  // Test TypeScript configuration
  async testTypeScriptConfig() {
    const tsconfigPath = join(this.projectRoot, 'tsconfig.json');
    const content = readFileSync(tsconfigPath, 'utf-8');
    const config = JSON.parse(content);
    
    if (!config.compilerOptions || !config.include) {
      throw new Error('Invalid TypeScript configuration');
    }
  }

  // Test if source files can be parsed (basic syntax check)
  async testSourceFileSyntax() {
    const mainFiles = ['src/main.tsx', 'src/App.tsx'];
    
    for (const file of mainFiles) {
      const filePath = join(this.projectRoot, file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for obvious syntax issues
        if (content.includes('\\n') && !content.includes('\n')) {
          throw new Error(`File ${file} has escaped newlines - encoding issue`);
        }
        
        // Check for basic React/TS patterns
        if (file.endsWith('.tsx') && !content.includes('import') && content.length > 50) {
          throw new Error(`File ${file} may have syntax issues`);
        }
      }
    }
  }

  // Test environment and tools
  async testEnvironment() {
    const commands = [
      { cmd: 'node --version', name: 'Node.js' },
      { cmd: 'npm --version', name: 'NPM' }
    ];

    for (const { cmd, name } of commands) {
      try {
        await execAsync(cmd);
      } catch (error) {
        throw new Error(`${name} not available`);
      }
    }
  }

  // Run all tests
  async runAll() {
    this.log('Starting Striim Video Platform Tests', 'info');
    this.log('=====================================', 'info');

    await this.runTest('Project Structure', () => this.testProjectStructure());
    await this.runTest('Package.json Validity', () => this.testPackageJson());
    await this.runTest('Dependencies Check', () => this.testDependencies());
    await this.runTest('TypeScript Configuration', () => this.testTypeScriptConfig());
    await this.runTest('Source File Syntax', () => this.testSourceFileSyntax());
    await this.runTest('Environment Tools', () => this.testEnvironment());

    this.log('=====================================', 'info');
    this.log(`Tests completed: ${this.passed} passed, ${this.failed} failed`, 
      this.failed === 0 ? 'success' : 'warn');

    return this.failed === 0;
  }
}

// Run tests
const runner = new TestRunner();
runner.runAll().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});