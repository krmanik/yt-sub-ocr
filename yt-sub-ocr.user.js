// ==UserScript==
// @name        YT-Sub-OCR
// @namespace   Youtube Hardcoded Subtitle OCR
// @match       https://www.youtube.com/watch*
// @match       https://m.youtube.com/watch*
// @version     1.0.0
// @author      https://github.com/krmanik
// @description Youtube Hardcoded Subtitle OCR
// @require     https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.js
// @require     https://krmanik.github.io/yt-sub-ocr/paddleocr.js
// @license     GPL-3.0
// ==/UserScript==

(async function () {
    window.addEventListener('load', function () {
        let cropper;

        const video = document.querySelector('video');
        const canvas = document.createElement("canvas");
        canvas.id = "yt-ocr-canvas";
        canvas.style.display = "none";
        canvas.style.position = "relative";
        const context = canvas.getContext('2d');

        const ocrResult = document.createElement('div');
        ocrResult.id = "yt-ocr-result";
        ocrResult.style.color = "var(--text-primary-color)";
        ocrResult.style.fontSize = "20px";
        ocrResult.style.lineHeight = "1.5";
        ocrResult.style.padding = "6px";
        ocrResult.style.textAlign = "center";
        ocrResult.style.position = "relative";

        const imgContainer = document.createElement('div');
        const img = new Image();
        img.id = "yt-html-image";
        img.style.display = "none";
        img.className = "yt-ocr-img";
        img.style.position = "relative";
        img.style.width = video.style.width;
        img.style.height = video.style.height;
        imgContainer.appendChild(img);

        const cropButton = createButton("Crop");
        const ocrButton = createButton("OCR");
        const playButton = createButton("Pause");
        const rewindNextButton = createButton(">>");
        const rewindPrevButton = createButton("<<");

        addCropperStyle();

        function addElement(query, css = false) {
            let addBeforeElem;
            if (css) {
                addBeforeElem = document.querySelector(query);
                let interval = setInterval(() => {
                    addBeforeElem = document.querySelector(query);
                    if (addBeforeElem) {
                        clearInterval(interval);

                        addBeforeElem.insertAdjacentElement("beforebegin", cropButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", ocrButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", playButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", rewindPrevButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", rewindNextButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", imgContainer);
                        addBeforeElem.insertAdjacentElement("beforebegin", ocrResult);
                    }
                }, 500);

                setTimeout(() => {
                    clearInterval(interval);
                }, 50000);

            } else {
                addBeforeElem = document.getElementById(query);
                let interval = setInterval(() => {
                    addBeforeElem = document.getElementById(query);
                    if (addBeforeElem) {
                        clearInterval(interval);

                        addBeforeElem.insertAdjacentElement("beforebegin", cropButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", ocrButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", playButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", rewindPrevButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", rewindNextButton);
                        addBeforeElem.insertAdjacentElement("beforebegin", imgContainer);
                        addBeforeElem.insertAdjacentElement("beforebegin", ocrResult);
                    }
                }, 500);

                setTimeout(() => {
                    clearInterval(interval);
                }, 50000);
            }
        }

        if (window.origin.startsWith('https://www')) {
            let query = "below";
            addElement(query);
        } else {
            let query = ".watch-below-the-player";
            addElement(query, true);
        }

        ocrButton.onclick = async function () {
            canvas.style.display = "none";
            img.style.display = "none";

            try {
                if (cropper) {
                    cropper.destroy();
                }

                const screenshot = ytScreenShot();
                const cropArea = JSON.parse(localStorage.getItem('cropArea'));
                canvas.width = cropArea.width;
                canvas.height = cropArea.height;
                context.drawImage(screenshot, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
                const dataUrl = canvas.toDataURL('image/png');

                fetch(dataUrl)
                    .then(res => res.blob())
                    .then((blob) => {
                        ocr.recognize((blob), {}).then(res => {
                            const resultArea = document.getElementById('yt-ocr-result');
                            resultArea.innerText = res.text.join('\n');
                            console.log(res);
                        });
                    });

                document.querySelectorAll('.html5-main-video').forEach(vid => vid.pause());
                playButton.innerText = 'Play';
            } catch (error) {
                console.error(error);
            }
        }

        cropButton.onclick = async function () {
            canvas.style.display = "block";
            img.style.display = "block";

            try {
                let dataUrl = ytScreenShot().toDataURL('image/png');
                img.src = dataUrl;

                if (cropper) {
                    cropper.destroy();
                }

                cropper = new Cropper(img, {
                    viewMode: 3,
                    autoCropArea: 0.3,
                    crop(event) {
                        let cropArea = { x: event.detail.x, y: event.detail.y, width: event.detail.width, height: event.detail.height };
                        localStorage.setItem('cropArea', JSON.stringify(cropArea));
                    },
                });
                window.cropper = cropper;

                const vWidth = parseInt(video.style.width);
                const vHeight = parseInt(video.style.height);

                setTimeout(() => {
                    cropper.setCropBoxData({
                        width: vWidth * 0.80,
                        height: vHeight * 0.25,
                        left: 0.10 * vWidth,
                        top: vHeight - 0.25 * vHeight,
                    });
                }, 500);

                document.querySelectorAll('.html5-main-video').forEach(vid => vid.pause());
                playButton.innerText = 'Play';
            } catch (error) {
                console.error(error);
            }
        }

        playButton.onclick = function () {
            console.log('Play Button Clicked', playButton.innerText);

            if (playButton.innerText === 'Play') {
                document.querySelectorAll('.html5-main-video').forEach(vid => vid.play());
                playButton.innerText = 'Pause';
            } else {
                document.querySelectorAll('.html5-main-video').forEach(vid => {
                    vid.pause();
                    playButton.innerText = 'Play';
                });
            }
        }

        rewindNextButton.onclick = function () {
            document.querySelectorAll('.html5-main-video').forEach(vid => vid.currentTime += 5);
        }

        rewindPrevButton.onclick = function () {
            document.querySelectorAll('.html5-main-video').forEach(vid => vid.currentTime -= 5);
        }
    });
})();

function addCropperStyle() {
    /*!
    * Cropper.js v1.6.2
    * https://fengyuanchen.github.io/cropperjs
    *
    * Copyright 2015-present Chen Fengyuan
    * Released under the MIT license
    *
    * Date: 2024-04-21T07:43:02.731Z
    */
    const style = `.cropper-container{-webkit-touch-callout:none;direction:ltr;font-size:0;line-height:0;position:relative;-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.cropper-container img{backface-visibility:hidden;display:block;height:100%;image-orientation:0deg;max-height:none!important;max-width:none!important;min-height:0!important;min-width:0!important;width:100%}.cropper-canvas,.cropper-crop-box,.cropper-drag-box,.cropper-modal,.cropper-wrap-box{bottom:0;left:0;position:absolute;right:0;top:0}.cropper-canvas,.cropper-wrap-box{overflow:hidden}.cropper-drag-box{background-color:#fff;opacity:0}.cropper-modal{background-color:#000;opacity:.5}.cropper-view-box{display:block;height:100%;outline:1px solid #39f;outline-color:rgba(51,153,255,.75);overflow:hidden;width:100%}.cropper-dashed{border:0 dashed #eee;display:block;opacity:.5;position:absolute}.cropper-dashed.dashed-h{border-bottom-width:1px;border-top-width:1px;height:33.33333%;left:0;top:33.33333%;width:100%}.cropper-dashed.dashed-v{border-left-width:1px;border-right-width:1px;height:100%;left:33.33333%;top:0;width:33.33333%}.cropper-center{display:block;height:0;left:50%;opacity:.75;position:absolute;top:50%;width:0}.cropper-center:after,.cropper-center:before{background-color:#eee;content:" ";display:block;position:absolute}.cropper-center:before{height:1px;left:-3px;top:0;width:7px}.cropper-center:after{height:7px;left:0;top:-3px;width:1px}.cropper-face,.cropper-line,.cropper-point{display:block;height:100%;opacity:.1;position:absolute;width:100%}.cropper-face{background-color:#fff;left:0;top:0}.cropper-line{background-color:#39f}.cropper-line.line-e{cursor:ew-resize;right:-3px;top:0;width:5px}.cropper-line.line-n{cursor:ns-resize;height:5px;left:0;top:-3px}.cropper-line.line-w{cursor:ew-resize;left:-3px;top:0;width:5px}.cropper-line.line-s{bottom:-3px;cursor:ns-resize;height:5px;left:0}.cropper-point{background-color:#39f;height:5px;opacity:.75;width:5px}.cropper-point.point-e{cursor:ew-resize;margin-top:-3px;right:-3px;top:50%}.cropper-point.point-n{cursor:ns-resize;left:50%;margin-left:-3px;top:-3px}.cropper-point.point-w{cursor:ew-resize;left:-3px;margin-top:-3px;top:50%}.cropper-point.point-s{bottom:-3px;cursor:s-resize;left:50%;margin-left:-3px}.cropper-point.point-ne{cursor:nesw-resize;right:-3px;top:-3px}.cropper-point.point-nw{cursor:nwse-resize;left:-3px;top:-3px}.cropper-point.point-sw{bottom:-3px;cursor:nesw-resize;left:-3px}.cropper-point.point-se{bottom:-3px;cursor:nwse-resize;height:20px;opacity:1;right:-3px;width:20px}@media (min-width:768px){.cropper-point.point-se{height:15px;width:15px}}@media (min-width:992px){.cropper-point.point-se{height:10px;width:10px}}@media (min-width:1200px){.cropper-point.point-se{height:5px;opacity:.75;width:5px}}.cropper-point.point-se:before{background-color:#39f;bottom:-50%;content:" ";display:block;height:200%;opacity:0;position:absolute;right:-50%;width:200%}.cropper-invisible{opacity:0}.cropper-bg{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC")}.cropper-hide{display:block;height:0;position:absolute;width:0}.cropper-hidden{display:none!important}.cropper-move{cursor:move}.cropper-crop{cursor:crosshair}.cropper-disabled .cropper-drag-box,.cropper-disabled .cropper-face,.cropper-disabled .cropper-line,.cropper-disabled .cropper-point{cursor:not-allowed} .yt-ocr-img {display: block; max-width: 100%; }`;
    const cropperStyle = document.createElement('style');
    cropperStyle.innerText = style;
    document.body.append(cropperStyle);
}

function ytScreenShot() {
    var canvas = document.createElement('canvas');
    var video = document.querySelector('video');
    var ctx = canvas.getContext('2d');
    canvas.width = parseInt(video.offsetWidth);
    canvas.height = parseInt(video.offsetHeight);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function createButton(text) {
    const button = document.createElement('button');
    button.id = `yt-ocr-${text.toLowerCase()}-button`;
    button.innerText = text;
    button.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    button.style.padding = '4px';
    button.style.fontSize = '14px';
    button.style.margin = '2px';
    button.style.backgroundColor = 'var(--yt-spec-brand-background-primary)';
    button.style.color = 'var(--yt-spec-text-primary)';
    button.style.position = 'relative';
    return button;
}
