#!/usr/bin/env node

/**
 * Fetch YouTube video metadata using the YouTube Data API v3
 * Caches results to avoid unnecessary API calls
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Configuration
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'youtube-metadata.json');
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Make HTTPS request to YouTube API
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`YouTube API returned status ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Load cache if it exists and is still valid
 */
async function loadCache() {
  try {
    const stats = await fs.stat(CACHE_FILE);
    const age = Date.now() - stats.mtime.getTime();
    
    if (age < CACHE_DURATION) {
      const cache = await fs.readFile(CACHE_FILE, 'utf8');
      return JSON.parse(cache);
    }
  } catch (error) {
    // Cache doesn't exist or is invalid
  }
  return {};
}

/**
 * Save cache to file
 */
async function saveCache(cache) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Convert ISO 8601 duration to human-readable format
 */
function parseDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
}

/**
 * Fetch metadata for a single video
 */
async function fetchVideoMetadata(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?` +
    `id=${videoId}&` +
    `key=${apiKey}&` +
    `part=snippet,contentDetails,status`;
  
  try {
    const response = await httpsGet(url);
    
    if (!response.items || response.items.length === 0) {
      throw new Error(`Video not found: ${videoId}`);
    }
    
    const video = response.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    
    // Check if video is available
    if (video.status.privacyStatus === 'private') {
      console.warn(`⚠️  Video ${videoId} is private`);
    }
    
    return {
      id: videoId,
      title: snippet.title,
      description: snippet.description.split('\n')[0] || snippet.title, // First line of description
      uploadDate: snippet.publishedAt, // Already includes timezone
      duration: parseDuration(contentDetails.duration) || contentDetails.duration,
      thumbnail: snippet.thumbnails.maxres?.url || 
                 snippet.thumbnails.high?.url || 
                 snippet.thumbnails.medium?.url,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      channelTitle: snippet.channelTitle
    };
  } catch (error) {
    console.error(`❌ Error fetching metadata for ${videoId}:`, error.message);
    throw error;
  }
}

/**
 * Main function to fetch metadata for all videos
 */
async function fetchAllVideoMetadata(videos, apiKey) {
  const cache = await loadCache();
  const results = [];
  let apiCalls = 0;
  
  for (const video of videos) {
    // Support multiple input formats
    const videoId = typeof video === 'string' ? video : (video.youtubeId || video.id);
    const overrides = typeof video === 'object' ? video : {};
    
    // Check cache first
    if (cache[videoId] && !video.forceRefresh) {
      console.log(`📦 Using cached metadata for ${videoId}`);
      let metadata = { ...cache[videoId] };
      
      // Apply any overrides from videos.json
      if (overrides.title) {
        metadata.title = overrides.title;
        console.log(`   ✏️  Using custom title: "${overrides.title}"`);
      }
      if (overrides.description) {
        metadata.description = overrides.description;
        console.log(`   ✏️  Using custom description: "${overrides.description}"`);
      }
      
      results.push(metadata);
    } else {
      console.log(`🔄 Fetching metadata for ${videoId} from YouTube API...`);
      try {
        const metadata = await fetchVideoMetadata(videoId, apiKey);
        
        // Apply any overrides from videos.json
        if (overrides.title) {
          metadata.title = overrides.title;
          console.log(`   ✏️  Using custom title: "${overrides.title}"`);
        }
        if (overrides.description) {
          metadata.description = overrides.description;
          console.log(`   ✏️  Using custom description: "${overrides.description}"`);
        }
        
        // Cache the original YouTube data (without overrides)
        cache[videoId] = await fetchVideoMetadata(videoId, apiKey);
        results.push(metadata);
        apiCalls++;
        
        // Rate limiting: wait 100ms between API calls
        if (apiCalls > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        // If fetch fails but we have cache, use it
        if (cache[videoId]) {
          console.log(`⚠️  Using stale cache for ${videoId} due to API error`);
          let metadata = { ...cache[videoId] };
          
          // Apply overrides even when using stale cache
          if (overrides.title) metadata.title = overrides.title;
          if (overrides.description) metadata.description = overrides.description;
          
          results.push(metadata);
        } else {
          throw error;
        }
      }
    }
  }
  
  // Save updated cache
  await saveCache(cache);
  
  console.log(`✅ Fetched metadata for ${results.length} videos (${apiCalls} API calls)`);
  return results;
}

/**
 * Load API key from environment
 */
function getApiKey() {
  // Try to load from .env file
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const envContent = require('fs').readFileSync(envPath, 'utf8');
    const match = envContent.match(/YOUTUBE_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch (error) {
    // .env file doesn't exist or can't be read
  }
  
  // Fall back to environment variable
  return process.env.YOUTUBE_API_KEY;
}

// Export for use in build.js
module.exports = {
  fetchAllVideoMetadata,
  getApiKey
};

// If run directly, test with videos.json
if (require.main === module) {
  (async () => {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        console.error('❌ YOUTUBE_API_KEY not found in .env or environment variables');
        process.exit(1);
      }
      
      // Load current videos.json
      const videosPath = path.join(__dirname, '..', 'template', 'data', 'videos.json');
      const videosData = JSON.parse(await fs.readFile(videosPath, 'utf8'));
      
      // Pass the videos array directly (now supports objects with overrides)
      const videos = videosData.videos;
      
      // Fetch metadata
      const metadata = await fetchAllVideoMetadata(videos, apiKey);
      
      // Output results
      console.log('\n📹 Video Metadata:');
      metadata.forEach(video => {
        console.log(`\n  ${video.title}`);
        console.log(`    ID: ${video.id}`);
        console.log(`    Duration: ${video.duration}`);
        console.log(`    Upload Date: ${video.uploadDate}`);
        console.log(`    URL: ${video.url}`);
      });
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}