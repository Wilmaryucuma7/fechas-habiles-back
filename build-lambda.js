const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

/**
 * Optimized build configuration for AWS Lambda deployment
 * Focus on bundle size reduction and performance optimization
 */

const buildOptions = {
  // Entry point - Lambda handler
  entryPoints: ['src/lambda/handler.ts'],
  
  // Output optimization
  bundle: true,
  minify: true,
  sourcemap: false, // Disable for production to reduce size
  target: 'node20', // Match Lambda runtime
  platform: 'node',
  format: 'cjs',
  outdir: 'dist',
  
  // Tree shaking and optimization
  treeShaking: true,
  metafile: true, // For bundle analysis
  
  // External dependencies optimization
  plugins: [
    nodeExternalsPlugin({
      // Include these packages in bundle for better cold start
      allowList: [
        'date-fns',
        'date-fns-tz',
        'zod',
        // Keep business logic bundled
      ],
    }),
  ],
  
  // Exclude AWS SDK (available in Lambda runtime)
  external: [
    'aws-sdk',
    '@aws-sdk/*',
    // Lambda runtime externals
    'crypto',
    'fs',
    'path',
  ],
  
  // Path resolution
  alias: {
    '@': './src',
  },
  
  // Bundle splitting for optimization
  splitting: false, // Lambda doesn't support ES modules well yet
  
  // Define environment for dead code elimination
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  
  // Advanced optimizations
  dropLabels: ['DEV'], // Remove development code
  legalComments: 'none', // Remove comments to reduce size
};

// Build function with error handling
async function build() {
  try {
    console.log('🔨 Building optimized Lambda bundle...');
    
    const result = await esbuild.build(buildOptions);
    
    // Bundle size analysis
    if (result.metafile) {
      const analysis = await esbuild.analyzeMetafile(result.metafile);
      console.log('\n📊 Bundle Analysis:');
      console.log(analysis);
    }
    
    console.log('✅ Build completed successfully!');
    console.log('📦 Output: dist/handler.js');
    
    // Show build statistics
    const fs = require('fs');
    const stats = fs.statSync('dist/handler.js');
    console.log(`📏 Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Watch mode for development
async function watch() {
  try {
    console.log('👀 Starting watch mode...');
    
    const ctx = await esbuild.context({
      ...buildOptions,
      sourcemap: true, // Enable sourcemap for development
      minify: false, // Disable minification for faster builds
    });
    
    await ctx.watch();
    console.log('✅ Watch mode started');
    
  } catch (error) {
    console.error('❌ Watch failed:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--watch')) {
  watch();
} else {
  build();
}

module.exports = { buildOptions, build };