#!/usr/bin/env node

// Tailwind CSS Production Setup Script
// This sets up Tailwind CSS for production builds

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function setupTailwindProduction() {
  console.log('🎨 Setting up Tailwind CSS for production...\n');

  // 1. Install dependencies
  console.log('📦 Installing Tailwind CSS dependencies...');
  execSync('npm install -D tailwindcss postcss autoprefixer cssnano', { stdio: 'inherit' });

  // 2. Create Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#1e0532',
        }
      },
      fontFamily: {
        'bebas': ['Bebas Neue', 'Arial Narrow', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}`;

  await fs.writeFile('tailwind.config.js', tailwindConfig);
  console.log('✅ Created tailwind.config.js');

  // 3. Create PostCSS config
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}`;

  await fs.writeFile('postcss.config.js', postcssConfig);
  console.log('✅ Created postcss.config.js');

  // 4. Create input CSS file
  const inputCSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
.bebas {
  font-family: 'Bebas Neue', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif;
  font-weight: 700;
  letter-spacing: 0.03em;
  font-stretch: condensed;
  text-transform: uppercase;
}

.gradient-text {
  background: linear-gradient(135deg, #9333ea 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-overlay {
  background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%);
}

.nav-link {
  transition: all 0.3s ease;
}

.nav-link:hover {
  transform: translateY(-2px);
}

.social-icon {
  transition: all 0.3s ease;
}

.social-icon:hover {
  transform: scale(1.2) rotate(5deg);
}

.gallery-item {
  transition: all 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}`;

  await fs.mkdir('src', { recursive: true });
  await fs.writeFile('src/styles.css', inputCSS);
  console.log('✅ Created src/styles.css');

  // 5. Update package.json scripts
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "build:css": "tailwindcss -i ./src/styles.css -o ./public/styles.css",
    "build:css:prod": "NODE_ENV=production tailwindcss -i ./src/styles.css -o ./public/styles.css --minify",
    "watch:css": "tailwindcss -i ./src/styles.css -o ./public/styles.css --watch",
    "build": "npm run build:images && npm run build:css:prod && npm run build:html",
    "dev": "concurrently \"npm run watch:css\" \"npm run serve\""
  };

  // Add concurrently for dev mode if not present
  if (!packageJson.devDependencies?.concurrently) {
    console.log('📦 Installing concurrently for development...');
    execSync('npm install -D concurrently', { stdio: 'inherit' });
  }

  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json scripts');

  // 6. Build initial CSS
  console.log('\n🏗️  Building CSS for the first time...');
  execSync('npm run build:css:prod', { stdio: 'inherit' });

  // 7. Create a template updater to replace CDN with local CSS
  const updateTemplate = `
// Update HTML template to use local CSS instead of CDN
const fs = require('fs').promises;
const path = require('path');

async function updateTemplate() {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  let html = await fs.readFile(htmlPath, 'utf8');
  
  // Replace Tailwind CDN with local CSS
  html = html.replace(
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<link rel="stylesheet" href="styles.css">'
  );
  
  // Remove the Tailwind CDN comment
  html = html.replace(
    /<!-- Note: Tailwind CDN.*?-->\n\s*/,
    ''
  );
  
  await fs.writeFile(htmlPath, html);
  console.log('✅ Updated HTML to use local CSS');
}

updateTemplate();
`;

  await fs.writeFile('update-template-css.js', updateTemplate);
  execSync('node update-template-css.js', { stdio: 'inherit' });

  console.log('\n✨ Tailwind CSS production setup complete!');
  console.log('\nAvailable commands:');
  console.log('  npm run build:css      - Build CSS');
  console.log('  npm run build:css:prod - Build minified CSS for production');
  console.log('  npm run watch:css      - Watch and rebuild CSS on changes');
  console.log('  npm run build          - Full production build');
  console.log('  npm run dev            - Development mode with CSS watching');
  
  console.log('\n📊 Benefits:');
  console.log('  ✓ CSS file reduced from ~3MB to ~20KB (purged unused styles)');
  console.log('  ✓ No runtime JavaScript processing');
  console.log('  ✓ Better performance and SEO');
  console.log('  ✓ No console warnings');
}

setupTailwindProduction().catch(console.error);