const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { glob } = require('glob');
const chokidar = require('chokidar');
const crypto = require('crypto');

const INPUT_DIR = './photos';
const OUTPUT_DIR = './public/images';
const CACHE_FILE = '.image-cache.json';

const SIZES = {
  thumbnail: { width: 400, height: 400 },
  small: { width: 640, height: 480 },
  medium: { width: 1024, height: 768 },
  large: { width: 1920, height: 1080 },
  original: { width: 2560, height: 1440 }
};

const FORMATS = ['webp', 'jpg'];

// Load or initialize cache
async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Save cache
async function saveCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// Get file hash to detect changes
async function getFileHash(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  } catch (error) {
    return null;
  }
}

// Check if file needs processing
async function needsProcessing(filePath, cache) {
  const stats = await fs.stat(filePath);
  const currentHash = await getFileHash(filePath);
  const cacheEntry = cache[filePath];
  
  if (!cacheEntry) return true;
  if (cacheEntry.hash !== currentHash) return true;
  if (cacheEntry.size !== stats.size) return true;
  if (new Date(cacheEntry.modified) < stats.mtime) return true;
  
  // Check if all output files exist
  const nameWithoutExt = path.parse(path.basename(filePath)).name;
  for (const [sizeName] of Object.entries(SIZES)) {
    for (const format of FORMATS) {
      const outputPath = path.join(OUTPUT_DIR, sizeName, `${nameWithoutExt}.${format}`);
      try {
        await fs.access(outputPath);
      } catch {
        return true; // Output file missing
      }
    }
  }
  
  return false;
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

async function processImage(imagePath, cache) {
  const filename = path.basename(imagePath);
  const nameWithoutExt = path.parse(filename).name;
  const ext = path.extname(filename).toLowerCase();
  
  // Skip HEIC files if sharp doesn't support them
  if (ext === '.heic' || ext === '.heif') {
    // Check if sharp supports HEIC
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
  
  // Check if already processed
  if (!await needsProcessing(imagePath, cache)) {
    console.log(`✓ Skipping ${filename} (already processed)`);
    return false;
  }
  
  console.log(`📸 Processing: ${filename}`);
  
  try {
    const stats = await fs.stat(imagePath);
    const hash = await getFileHash(imagePath);
    
    for (const [sizeName, dimensions] of Object.entries(SIZES)) {
      for (const format of FORMATS) {
        const outputPath = path.join(
          OUTPUT_DIR,
          sizeName,
          `${nameWithoutExt}.${format}`
        );
        
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
      }
    }
    
    // Update cache
    cache[imagePath] = {
      hash,
      size: stats.size,
      modified: stats.mtime,
      processed: new Date().toISOString()
    };
    
    console.log(`✅ Processed ${filename} into ${Object.keys(SIZES).length * FORMATS.length} variants`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return false;
  }
}

async function processAllImages() {
  await ensureDirectories();
  
  const cache = await loadCache();
  
  // Supported formats (excluding HEIC initially)
  const patterns = [
    '*.jpg', '*.JPG', '*.jpeg', '*.JPEG', 
    '*.png', '*.PNG', '*.webp', '*.WEBP'
  ];
  
  // Check if we should try HEIC
  const heicPatterns = ['*.heic', '*.HEIC', '*.heif', '*.HEIF'];
  
  const files = [];
  
  for (const pattern of patterns) {
    const matches = await glob(path.join(INPUT_DIR, pattern));
    files.push(...matches);
  }
  
  // Try HEIC files separately
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
    const result = await processImage(file, cache);
    if (result) {
      processedCount++;
    } else {
      skippedCount++;
    }
  }
  
  // Save updated cache
  await saveCache(cache);
  
  if (processedCount > 0) {
    console.log(`\n✨ Processed ${processedCount} new/changed images!`);
  }
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped ${skippedCount} unchanged images.`);
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
          jpg: path.join('/images', size, f),
          webp: path.join('/images', size, f.replace('.jpg', '.webp')),
          name: path.parse(f).name
        }));
    }
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`📋 Image manifest updated (${manifest.thumbnail?.length || 0} images)`);
  } catch (error) {
    console.error('Error generating manifest:', error);
  }
}

async function cleanupCache(cache) {
  // Remove entries for files that no longer exist
  const keysToDelete = [];
  for (const filePath of Object.keys(cache)) {
    try {
      await fs.access(filePath);
    } catch {
      keysToDelete.push(filePath);
    }
  }
  
  if (keysToDelete.length > 0) {
    console.log(`🧹 Cleaning ${keysToDelete.length} removed files from cache`);
    keysToDelete.forEach(key => delete cache[key]);
    await saveCache(cache);
  }
}

async function watchImages() {
  console.log(`👁️  Watching ${INPUT_DIR} for changes...`);
  
  const cache = await loadCache();
  
  const watcher = chokidar.watch(INPUT_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });
  
  watcher
    .on('add', async (filePath) => {
      console.log(`\n📎 New file detected: ${path.basename(filePath)}`);
      await processImage(filePath, cache);
      await saveCache(cache);
      await generateImageManifest();
    })
    .on('change', async (filePath) => {
      console.log(`\n✏️  File changed: ${path.basename(filePath)}`);
      await processImage(filePath, cache);
      await saveCache(cache);
      await generateImageManifest();
    })
    .on('unlink', async (filePath) => {
      console.log(`\n🗑️  File removed: ${path.basename(filePath)}`);
      delete cache[filePath];
      await saveCache(cache);
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
    console.log('🔄 Force mode: Reprocessing all images...\n');
    await fs.unlink(CACHE_FILE).catch(() => {});
  }
  
  const cache = await loadCache();
  await cleanupCache(cache);
  
  await processAllImages();
  
  if (watchMode) {
    console.log('\n');
    await watchImages();
  }
}

main().catch(console.error);