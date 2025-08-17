const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { glob } = require('glob');
const chokidar = require('chokidar');

const INPUT_DIR = './photos';
const OUTPUT_DIR = './public/images';

const SIZES = {
  thumbnail: { width: 400, height: 400 },
  small: { width: 640, height: 480 },
  medium: { width: 1024, height: 768 },
  large: { width: 1920, height: 1080 },
  original: { width: 2560, height: 1440 }
};

const FORMATS = ['webp', 'jpg'];

// Check if file needs processing based on modification times
async function needsProcessing(sourcePath) {
  try {
    const sourceStats = await fs.stat(sourcePath);
    const sourceTime = sourceStats.mtime.getTime();
    const nameWithoutExt = path.parse(path.basename(sourcePath)).name;
    
    // Check if ALL output files exist and are newer than source
    for (const [sizeName] of Object.entries(SIZES)) {
      for (const format of FORMATS) {
        const outputPath = path.join(OUTPUT_DIR, sizeName, `${nameWithoutExt}.${format}`);
        try {
          const targetStats = await fs.stat(outputPath);
          const targetTime = targetStats.mtime.getTime();
          
          // If target is older than source, needs processing
          if (targetTime < sourceTime) {
            return true;
          }
        } catch {
          // Output file doesn't exist, needs processing
          return true;
        }
      }
    }
    
    // All targets exist and are newer than source
    return false;
  } catch (error) {
    // Error checking source, assume needs processing
    return true;
  }
}

async function ensureDirectories() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    for (const size of Object.keys(SIZES)) {
      await fs.mkdir(path.join(OUTPUT_DIR, size), { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

async function processImage(imagePath) {
  const filename = path.basename(imagePath);
  const nameWithoutExt = path.parse(filename).name;
  const ext = path.extname(filename).toLowerCase();
  
  // Skip HEIC files if sharp doesn't support them
  if (ext === '.heic' || ext === '.heif') {
    try {
      await sharp(imagePath).metadata();
    } catch (error) {
      if (error.message.includes('heif') || error.message.includes('compression format')) {
        console.log(`⚠️  Skipping ${filename} - HEIC not supported. Run './convert-heic.sh' first.`);
        return false;
      }
      throw error;
    }
  }
  
  // Check if processing is needed (target older than source)
  const needs = await needsProcessing(imagePath);
  if (!needs) {
    console.log(`✓ Skipping ${filename} (up to date)`);
    return false;
  }
  
  console.log(`📸 Processing: ${filename}`);
  
  try {
    // Process all sizes and formats
    let processedCount = 0;
    
    for (const [sizeName, dimensions] of Object.entries(SIZES)) {
      for (const format of FORMATS) {
        const outputPath = path.join(
          OUTPUT_DIR,
          sizeName,
          `${nameWithoutExt}.${format}`
        );
        
        // Check if this specific output needs updating
        let needsUpdate = true;
        try {
          const sourceStats = await fs.stat(imagePath);
          const targetStats = await fs.stat(outputPath);
          needsUpdate = targetStats.mtime.getTime() < sourceStats.mtime.getTime();
        } catch {
          // Target doesn't exist, needs update
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          let pipeline = sharp(imagePath)
            .resize(dimensions.width, dimensions.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .rotate(); // Auto-rotate based on EXIF
          
          if (format === 'webp') {
            pipeline = pipeline.webp({ quality: 85 });
          } else if (format === 'jpg') {
            pipeline = pipeline.jpeg({ quality: 90, progressive: true });
          }
          
          await pipeline.toFile(outputPath);
          processedCount++;
        }
      }
    }
    
    if (processedCount > 0) {
      console.log(`✅ Generated ${processedCount} image variants for ${filename}`);
    }
    return processedCount > 0;
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return false;
  }
}

async function processAllImages() {
  await ensureDirectories();
  
  // Supported formats (excluding HEIC initially)
  const patterns = [
    '*.jpg', '*.JPG', '*.jpeg', '*.JPEG', 
    '*.png', '*.PNG', '*.webp', '*.WEBP'
  ];
  
  // Check for HEIC files
  const heicPatterns = ['*.heic', '*.HEIC', '*.heif', '*.HEIF'];
  
  const files = [];
  
  for (const pattern of patterns) {
    const matches = await glob(path.join(INPUT_DIR, pattern));
    files.push(...matches);
  }
  
  // Check for HEIC files separately
  const heicFiles = [];
  for (const pattern of heicPatterns) {
    const matches = await glob(path.join(INPUT_DIR, pattern));
    heicFiles.push(...matches);
  }
  
  if (heicFiles.length > 0) {
    console.log(`\n📝 Found ${heicFiles.length} HEIC files.`);
    console.log('   Run ./convert-heic.sh to convert them to JPG first.\n');
  }
  
  if (files.length === 0) {
    console.log('No processable images found in photos/ directory');
    return;
  }
  
  console.log(`Found ${files.length} images to check...`);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const result = await processImage(file);
    if (result) {
      processedCount++;
    } else {
      skippedCount++;
    }
  }
  
  if (processedCount > 0) {
    console.log(`\n✨ Processed ${processedCount} images!`);
  }
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped ${skippedCount} up-to-date images.`);
  }
  
  await generateImageManifest();
}

async function generateImageManifest() {
  const manifest = {};
  
  try {
    for (const size of Object.keys(SIZES)) {
      const sizeDir = path.join(OUTPUT_DIR, size);
      const files = await fs.readdir(sizeDir);
      
      manifest[size] = files
        .filter(f => f.endsWith('.jpg'))
        .map(f => ({
          jpg: path.join('images', size, f).replace(/\\/g, '/'),  // Use relative path and ensure forward slashes
          webp: path.join('images', size, f.replace('.jpg', '.webp')).replace(/\\/g, '/'),
          name: path.parse(f).name
        }));
    }
    
    // Only update manifest if it has changed
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    let existingManifest = {};
    try {
      const existing = await fs.readFile(manifestPath, 'utf8');
      existingManifest = JSON.parse(existing);
    } catch {
      // No existing manifest
    }
    
    // Check if manifest has changed
    if (JSON.stringify(manifest) !== JSON.stringify(existingManifest)) {
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`📋 Image manifest updated (${manifest.thumbnail?.length || 0} images)`);
    }
  } catch (error) {
    console.error('Error generating manifest:', error);
  }
}

async function watchImages() {
  console.log(`👁️  Watching ${INPUT_DIR} for changes...`);
  
  const watcher = chokidar.watch(INPUT_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });
  
  watcher
    .on('add', async (filePath) => {
      console.log(`\n📎 New file detected: ${path.basename(filePath)}`);
      await processImage(filePath);
      await generateImageManifest();
    })
    .on('change', async (filePath) => {
      console.log(`\n✏️  File changed: ${path.basename(filePath)}`);
      await processImage(filePath);
      await generateImageManifest();
    })
    .on('unlink', async (filePath) => {
      console.log(`\n🗑️  File removed: ${path.basename(filePath)}`);
      // Remove corresponding output files
      const nameWithoutExt = path.parse(path.basename(filePath)).name;
      for (const [sizeName] of Object.entries(SIZES)) {
        for (const format of FORMATS) {
          const outputPath = path.join(OUTPUT_DIR, sizeName, `${nameWithoutExt}.${format}`);
          try {
            await fs.unlink(outputPath);
          } catch {
            // File doesn't exist, ignore
          }
        }
      }
      await generateImageManifest();
    });
}

async function main() {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch');
  const forceMode = args.includes('--force');
  
  console.log('🎨 Sinister Dexter Image Processor');
  console.log('===================================\n');
  
  if (forceMode) {
    console.log('🔄 Force mode: Clearing all processed images...\n');
    // Remove all processed images to force regeneration
    for (const size of Object.keys(SIZES)) {
      const sizeDir = path.join(OUTPUT_DIR, size);
      try {
        const files = await fs.readdir(sizeDir);
        for (const file of files) {
          await fs.unlink(path.join(sizeDir, file));
        }
      } catch {
        // Directory doesn't exist, ignore
      }
    }
  }
  
  await processAllImages();
  
  if (watchMode) {
    console.log('\n');
    await watchImages();
  }
}

main().catch(console.error);