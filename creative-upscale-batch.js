//@api-1.0

// creative-upscale-batch.js
// by rshangle@gmail.com
// v0.01
// based on Draw Things Community Script creative-upscale.js
// by UNKNOWN
//
// Enhanced Creative Upscaler - Batch Processing Version
// Processes multiple images from a folder or file selection

const userSelection = requestFromUser("Batch Creative Upscaler", "Process Images", function() {
  return [
    this.section("▶ Batch Source", "Navigate to /Volumes/aia/Chute/upscale/to_upscale and select images to process. Supports mixed resolutions. Uses canvas image when no files selected.", [
      this.imageField("Select Images to Process", true)
    ]),
    this.section("▶ Upscale Factor", "Choose the upscaling level for all selected images", [
      this.segmented(0, ["200% (2x)", "400% (4x)"])
    ]),
    this.section("▶ Custom Negative Prompt", "Override the default negative prompt for all images (optional)", [
      this.textField("", "Leave empty to use default: 'low quality, blurry, artifacts...'")
    ]),
    this.section("▶ Processing Options", "Additional settings", [
      this.switch(false, "Verbose logging")
    ])
  ];
});

const configuration = pipeline.configuration;
const imgFiles = userSelection[0][0];
const upscaleFactor = userSelection[1][0];
const customNegativePrompt = userSelection[2][0] || "";
const verboseLogging = userSelection[3][0];

// Set default negative prompt if not provided
const negativePrompt = customNegativePrompt || "low quality, blurry, artifacts, watermark, jpeg artifacts, signature, watermark, username, blurry, artist name, trademark, title, multiple view, Reference sheet, curvy, plump, fat, distorted face, pregnant";

console.log("Starting batch upscale process...");

// Debug filesystem API
console.log("Debugging filesystem API...");
console.log("Filesystem object:", filesystem);
console.log("Filesystem.pictures object:", filesystem.pictures);

// Get Pictures folder path with debugging
let picturesPath;
try {
  picturesPath = filesystem.pictures.path;
  console.log("Pictures folder path:", picturesPath);
  console.log("Type of picturesPath:", typeof picturesPath);
} catch (error) {
  console.log("Error getting pictures path:", error.message);
}

// Check if files were selected or use canvas image
if (!imgFiles || imgFiles.length === 0) {
  console.log("No files selected - processing image on canvas");
  // Process the current canvas image (original behavior)
  processCanvasImage();
} else {
  console.log(`Found ${imgFiles.length} selected files to process`);
  if (verboseLogging) {
    console.log("Selected files:", imgFiles.length, "images");
  }

  // Download required models once
  console.log("Downloading required models...");
  pipeline.downloadBuiltins(["4x_ultrasharp_f16.ckpt"]);
  pipeline.downloadBuiltins([
    "controlnet_tile_1.x_v1.1_f16.ckpt",
    "juggernaut_reborn_q6p_q8p.ckpt",
    "add_more_details__detail_enhancer___tweaker__lora_f16.ckpt",
    "sdxl_render_v2.0_lora_f16.ckpt",
    "tcd_sd_v1.5_lora_f16.ckpt"
  ]);

  // Process each file
  let processedCount = 0;
  let errorCount = 0;
  const start = Date.now();

  for (let i = 0; i < imgFiles.length; i++) {
    const base64Data = imgFiles[i];
    
    // Extract image metadata like in the gonut2 example
    const imageMetadata = new ImageMetadata(base64Data);
    configuration.width = imageMetadata.width;
    configuration.height = imageMetadata.height;
    
    console.log(`Processing ${i + 1}/${imgFiles.length}: Image ${imageMetadata.width}x${imageMetadata.height}`);
    
    try {
      // Load the image onto canvas from base64
      canvas.updateCanvasSize(configuration);
      canvas.loadImageSrc(base64Data);
      
      // Process the image (same upscaling logic as original)
      processImageUpscale();
      
      processedCount++;
      
    } catch (error) {
      console.log(`  Error processing image ${i + 1}: ${error.message}`);
      errorCount++;
    }
    
    // Progress estimation like in gonut2
    const eTime = i > 0 ? estimateTime(start, i, imgFiles.length) : ``;
    if (eTime) {
      console.log(`  Progress: ${i + 1}/${imgFiles.length}${eTime}`);
    }
  }

  console.log(`\nBatch processing complete!`);
  console.log(`Successfully processed: ${processedCount} files`);
  if (errorCount > 0) {
    console.log(`Errors encountered: ${errorCount} files`);
  }

  // Summary of processing
  if (processedCount > 0) {
    const end = Date.now();
    const duration = end - start;
    const minutes = Math.floor(duration / 60000);
    let seconds = Math.floor((duration % 60000) / 1000);
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    console.log("\nProcessing Summary:");
    console.log(`- Total time: ${minutes}:${seconds}`);
    console.log(`- Upscale factor: ${upscaleFactor === 0 ? '200% (2x)' : '400% (4x)'}`);
    console.log(`- Negative prompt: ${negativePrompt}`);
    console.log("- Results saved via Draw Things auto-save");
  }
}

// Function to process the canvas image (original behavior)
function processCanvasImage() {
  console.log("Processing image on canvas...");
  
  // Download required models
  console.log("Downloading required models...");
  pipeline.downloadBuiltins(["4x_ultrasharp_f16.ckpt"]);
  pipeline.downloadBuiltins([
    "controlnet_tile_1.x_v1.1_f16.ckpt",
    "juggernaut_reborn_q6p_q8p.ckpt",
    "add_more_details__detail_enhancer___tweaker__lora_f16.ckpt",
    "sdxl_render_v2.0_lora_f16.ckpt",
    "tcd_sd_v1.5_lora_f16.ckpt"
  ]);
  
  processImageUpscale();
  
  console.log("Canvas image processing complete!");
}

// Core upscaling function (extracted from original script)
function processImageUpscale() {
  // Store original canvas state
  const imageRect = canvas.boundingBox;
  const baseZoom = canvas.canvasZoom;
  
  // First upscale pass (200%)
  console.log("  Running initial 4x UltraSharp upscale...");
  
  // Reset configuration for first pass
  configuration.strength = 0;
  configuration.upscaler = "4x UltraSharp";
  pipeline.run({configuration: configuration});
  
  const tileSrc = canvas.saveImageSrc(true);
  
  // Configure for second pass
  configuration.width = configuration.width * 2;
  configuration.height = configuration.height * 2;
  canvas.updateCanvasSize(configuration);
  canvas.canvasZoom = baseZoom * 2;
  canvas.moveCanvas(imageRect.x, imageRect.y);
  
  // Set up diffusion parameters
  configuration.steps = 8;
  configuration.tiledDecoding = true;
  configuration.decodingTileWidth = 1024;
  configuration.decodingTileHeight = 1024;
  configuration.decodingTileOverlap = 128;
  configuration.tiledDiffusion = true;
  configuration.diffusionTileWidth = 1024;
  configuration.diffusionTileHeight = 1024;
  configuration.diffusionTileOverlap = 128;
  configuration.sampler = SamplerType.TCD;
  configuration.stochasticSamplingGamma = 0.3;
  configuration.upscaler = null;
  configuration.preserveOriginalAfterInpaint = true;
  configuration.faceRestoration = null;
  configuration.batchSize = 1;
  configuration.batchCount = 1;
  configuration.hiresFix = false;
  configuration.clipSkip = 1;
  configuration.shift = 1;
  configuration.refinerModel = null;
  configuration.sharpness = 0;
  configuration.zeroNegativePrompt = false;
  
  configuration.model = "juggernaut_reborn_q6p_q8p.ckpt";
  configuration.strength = 0.4;
  configuration.loras = [
    {"file": "add_more_details__detail_enhancer___tweaker__lora_f16.ckpt", "weight": 0.6},
    {"file": "sdxl_render_v2.0_lora_f16.ckpt", "weight": 1},
    {"file": "tcd_sd_v1.5_lora_f16.ckpt", "weight": 1}
  ];
  
  const tile = pipeline.findControlByName("Tile (SD v1.x, ControlNet 1.1)");
  tile.weight = 0.5;
  configuration.controls = [tile];
  
  // Run 200% upscale
  console.log("  Running 200% diffusion pass...");
  pipeline.run({
    configuration: configuration,
    prompt: "masterpiece, best quality, highres",
    negativePrompt: negativePrompt
  });
  
  // Run 400% upscale if selected
  if (upscaleFactor > 0) {
    console.log("  Running 400% upscale...");
    
    configuration.width = configuration.width * 2;
    configuration.height = configuration.height * 2;
    canvas.updateCanvasSize(configuration);
    canvas.canvasZoom = baseZoom * 4;
    canvas.moveCanvas(imageRect.x, imageRect.y);
    
    canvas.loadCustomLayerFromSrc(tileSrc);
    
    pipeline.run({
      configuration: configuration,
      prompt: "masterpiece, best quality, highres",
      negativePrompt: negativePrompt
    });
  }
  
  console.log(`  Upscaling to ${upscaleFactor === 0 ? '200%' : '400%'} complete`);
}

// Utility function for time estimation (from gonut2)
function estimateTime(totalStartTime, completedBatches, totalBatches) {
  const totalElapsedTime = Date.now() - totalStartTime;
  const averageTimePerBatch = totalElapsedTime / completedBatches;
  const remainingBatches = totalBatches - completedBatches;
  const estimatedRemainingTime = Math.floor(averageTimePerBatch * remainingBatches);
  const remainingMinutes = Math.floor(estimatedRemainingTime / 60000);
  let remainingSeconds = Math.floor((estimatedRemainingTime % 60000) / 1000);
  remainingSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  return `   ⏱ Remaining time ‣ ${remainingMinutes}:${remainingSeconds}`;
}
