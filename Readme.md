## YouTube Hardcoded Subtitle OCR Userscript

### Overview

This userscript is designed to help you extract hardcoded subtitles from YouTube videos using Optical Character Recognition (OCR). The script provides an option to crop a specific area of the video for OCR processing.

### Features

- **Crop Area Selection:** Select a specific area of the video to focus the OCR process.
- **Automatic Pausing:** The video automatically pauses during the OCR process to ensure accurate text recognition.

### Requirements

Userscript Manager for browser, visit [greasyfork](https://greasyfork.org/) for installation instructions.

### Installation

1. Open browser and enable extension
2. Download and install [YouTube Sub OCR](https://github.com/krmanik/yt-sub-ocr) UserScript

   - Download from GitHub
     [yt-sub-ocr.user.js](https://krmanik.github.io/yt-sub-ocr/yt-sub-ocr.user.js)

### Demo

<img src="demo.gif">

### Usage

- Open a YouTube video.
- Click on the `Crop` button below video canvas to select the area for OCR.
- Click the `OCR` button to begin the OCR process.
- The video will pause, and the selected area will be processed for text extraction.
- The recognized text will be displayed below the video canvas.

### Technical Details

1. The OCR is done by [paddlejs-ocr](https://github.com/arkntools/paddlejs-ocr)
2. The crop area is done by [cropperjs](https://github.com/fengyuanchen/cropperjs)
