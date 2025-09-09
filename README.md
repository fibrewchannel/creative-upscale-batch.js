# Create Upscale Batch

A batch processing script for [Draw Things](https://drawthings.ai/) that applies high-quality AI upscaling to multiple images automatically.

## Version
v0.01

## Author
Rick Shangle (rshangle@gmail.com)

## Based On
Draw Things Community Script `creative-upscale.js` by UNKNOWN

## Description

This script enhances the original creative-upscale functionality by adding batch processing capabilities. It allows you to select multiple images through a file picker dialog and process them all with the same sophisticated upscaling pipeline that combines traditional upscaling with AI diffusion techniques.

## Features

- **Batch Processing**: Select and process multiple images at once
- **File Picker Integration**: Easy file selection through Draw Things' native dialog
- **Mixed Resolution Support**: Handles images of different sizes automatically
- **Progress Tracking**: Shows processing progress with time estimates
- **Flexible Upscaling**: Choose between 200% (2x) or 400% (4x) upscaling
- **Custom Negative Prompts**: Override default negative prompts for batch processing
- **Fallback Mode**: Processes canvas image when no files are selected
- **Error Resilience**: Continues processing even if individual images fail

## Technical Details

### Upscaling Pipeline
1. **Initial Upscale**: 4x UltraSharp traditional upscaler
2. **AI Enhancement**: Tiled diffusion using Juggernaut Reborn model
3. **Detail Enhancement**: Multiple LoRAs for texture and detail improvement
4. **Optional 4x**: Second pass for 400% total upscaling

### Models Required
- `4x_ultrasharp_f16.ckpt`
- `controlnet_tile_1.x_v1.1_f16.ckpt`
- `juggernaut_reborn_q6p_q8p.ckpt`
- `add_more_details__detail_enhancer___tweaker__lora_f16.ckpt`
- `sdxl_render_v2.0_lora_f16.ckpt`
- `tcd_sd_v1.5_lora_f16.ckpt`

## Installation

1. Download `create-upscale-batch.js`
2. Place in your Draw Things Scripts folder:
   - **macOS**: `~/Library/Containers/com.liuliu.draw-things/Data/Documents/Scripts/`
   - **iOS/iPadOS**: Use Draw Things > Presets > Manage Scripts > Add New Script
3. Restart Draw Things
4. The script will appear in your Presets menu

## Usage

1. Open Draw Things
2. Go to Presets > Scripts > create-upscale-batch
3. Configure options:
   - Click "Select Images to Process" to choose your files
   - Choose upscaling factor (200% or 400%)
   - Optionally set custom negative prompt
   - Enable verbose logging if needed
4. Click "Process Images"
5. Results will be saved according to your Draw Things auto-save settings

### File Selection
Navigate to your source folder (e.g., `/Volumes/aia/Chute/upscale/to_upscale`) and select the images you want to process. The script supports common image formats: JPG, PNG, WebP, TIFF, BMP, HEIC.

## Configuration

### Auto-Save Setup
Configure Draw Things auto-save to your desired output folder before running the script. All processed images will be saved to this location with appropriate suffixes (`_upscaled_2x` or `_upscaled_4x`).

### Performance Considerations
- Processing time depends on image size and system capabilities
- Tiled processing helps manage memory for large images
- 400% upscaling requires significantly more processing time

## Requirements

- Draw Things app (iOS, iPadOS, or macOS)
- Sufficient storage space for upscaled images
- Required models downloaded (script will auto-download if needed)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or improvements.

## Changelog

### v0.01
- Initial release
- Batch processing functionality
- File picker integration
- Progress tracking
- Error handling improvements
- Based on original creative-upscale.js

## Support

For issues with this script, please open a GitHub issue. For Draw Things app support, visit the [Draw Things Discord](https://discord.gg/drawthings) or [official documentation](https://docs.drawthings.ai/).

## Disclaimer

This script is provided as-is. Always backup your original images before processing. Processing times can be substantial for large batches or high-resolution images.
