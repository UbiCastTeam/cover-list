/**************************************************
* Cover list script                               *
* Author: Stephane Diemer                         *
* License: CC by SA v3                            *
* https://creativecommons.org/licenses/by-sa/3.0/ *
* Requires: jsu                                   *
**************************************************/
/* global jsu */

/*
 * CoverCanvasBox class
 */
function CoverCanvasBox (options) {
    this.FIELDS = ['padding', 'x', 'y', 'w', 'h', 'z'];
    this.id = 0;
    this.bw = 240; // base width
    this.bh = 135; // base height
    this.padding = 3;
    this.title = '';
    this.titleH = 45;
    this.x = 0;
    this.y = 0;
    this.w = 1;
    this.h = 1;
    this.z = 0;
    this.target = {
        x: 0, xStep: 0,
        y: 0, yStep: 0,
        w: 1, wStep: 0,
        h: 1, hStep: 0,
        z: 0, zStep: 0
    };
    this.color = '#666';
    this.boxBg = '#fff';
    this.thumb = '';
    this.url = '';
    this.callback = null;

    for (const field in options) {
        this[field] = options[field];
    }

    this.canvas = null;
}
CoverCanvasBox.prototype.loadImage = function () {
    if (!this.thumb) {
        this.onLoad(null, false);
        return;
    }
    const image = new Image();
    if (this.callback != null) {
        const obj = this;
        image.onload = function () {
            obj.onLoad(this, true);
        };
        image.onabort = function () {
            obj.onLoad(this, true);
        };
        image.onerror = function () {
            obj.onLoad(this, false);
        };
    }
    image.src = this.thumb;
};
CoverCanvasBox.prototype.onLoad = function (img, success) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.bw;
    this.canvas.height = this.bh;

    const innerw = this.bw - 2 * this.padding;
    const innerh = this.bh - 2 * this.padding;

    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.bw, this.bh);
    ctx.fillStyle = this.boxBg;
    ctx.fillRect(this.padding, this.padding, innerw, innerh);
    if (success) {
        // draw image (preserve ratio)
        const imgRatio = img.width / img.height;
        let imgW = img.width, imgH = img.height;
        if (imgW > innerw) {
            imgW = innerw;
            imgH = innerw / imgRatio;
        }
        if (imgH > innerh) {
            imgH = innerh;
            imgW = innerh * imgRatio;
        }
        ctx.drawImage(img, this.padding + Math.floor((innerw - imgW) / 2), this.padding + Math.floor((innerh - imgH) / 2), imgW, imgH);
    }
    if (this.title) {
        // draw black mask
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.padding, this.padding + innerh - this.titleH, innerw, this.titleH);
        // get title position
        const fontHeight = 16;
        ctx.font = 'italic ' + fontHeight + 'px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textX = this.padding + Math.floor(innerw / 2);
        let textY;
        const maxW = innerw - 10;
        let lineTop = '', lineBot = '', needBot = true;
        const size = ctx.measureText(this.title).width;
        if (size > maxW) {
            // text is too long, use 2 lines
            const splitted = this.title.split(' ');
            let words = splitted.length;
            for (let i = 0; i < words; i++) {
                const word = splitted[0];
                if (ctx.measureText(lineTop + ' ' + word).width > maxW) {
                    if (!lineTop) {
                        // the word is too long
                        for (let j = 0; j < word.length; j++) {
                            if (ctx.measureText(lineTop + word[j]).width > maxW - 20) {
                                lineTop += ' ...';
                                needBot = false;
                                break;
                            }
                            lineTop += word[j];
                        }
                    }
                    break;
                }
                lineTop += ' ' + word;
                splitted.shift();
            }
            if (needBot) {
                words = splitted.length;
                for (let i = 0; i < words; i++) {
                    const word = splitted[0];
                    if (ctx.measureText(lineBot + ' ' + word).width > maxW - 20) {
                        if (!lineBot) {
                            // the word is too long
                            for (let j = 0; j < word.length; j++) {
                                if (ctx.measureText(lineBot + word[j]).width > maxW - 20) {
                                    lineBot += ' ...';
                                    break;
                                }
                                lineBot += word[j];
                            }
                        } else {
                            lineBot += ' ...';
                        }
                        break;
                    }
                    lineBot += ' ' + word;
                    splitted.shift();
                }
            }
        } else {
            lineTop = this.title;
        }
        // write title
        if (lineTop && lineBot) {
            textY = this.padding + innerh - Math.floor((this.titleH + fontHeight) / 2);
            ctx.fillText(lineTop, textX, textY);
            textY += 4 + fontHeight;
            ctx.fillText(lineBot, textX, textY);
        } else {
            textY = this.padding + innerh - Math.floor(this.titleH / 2);
            ctx.fillText(lineTop, textX, textY);
        }
    }
    ctx.save();

    if (this.callback != null) {
        this.callback(this.id, false);
    }
};
CoverCanvasBox.prototype.setTarget = function (options) {
    const steps = options.steps ? options.steps : 50;
    for (let i = 0; i < this.FIELDS.length; i++) {
        const field = this.FIELDS[i];
        if (field in options) {
            this.target[field] = options[field];
            this.target[field + '_step'] = (this.target[field] - this[field]) / steps;
        } else {
            this.target[field] = this[field];
            this.target[field + '_step'] = 0;
        }
    }
};
CoverCanvasBox.prototype.increment = function () {
    for (let i = 0; i < this.FIELDS.length; i++) {
        const field = this.FIELDS[i];
        if (this[field] != this.target[field]) {
            this[field] += this.target[field + '_step'];
        }
    }
};
CoverCanvasBox.prototype.draw = function (ctx) {
    if (!this.canvas) {
        return;
    }
    const xr = this.x;
    const yr = -this.y - 2 * this.h;

    ctx.drawImage(this.canvas, this.x, this.y, this.w, this.h);
    ctx.save(); // save transformation states

    // draw reflection
    ctx.scale(1, -1);
    ctx.drawImage(this.canvas, xr, yr, this.w, this.h);
    // fade reflection
    const grad = ctx.createLinearGradient(0, yr, 0, yr + this.h);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(this.x, yr, this.w, this.h);

    ctx.restore(); // retore transformation states
};
CoverCanvasBox.prototype.contains = function (x, y) {
    return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
};


/*
 * CoverList class
 */
function CoverList (options) {
    // params
    this.widgetPlace = '#cover_list';
    this.yOffset = -10;
    this.padding = 3;
    this.boxWidth = 240 + 2 * this.padding;
    this.boxHeight = 135 + 2 * this.padding;
    this.minSize = 0.8;
    this.selected = -1;
    this.color = '#666';
    this.boxBg = '#fff';
    // vars
    this.widgetElement = null;
    this.widgetWidth = 0;
    this.widgetHeight = 0;
    this.rangeInput = null;
    this.elements = [];
    this.positions = [];
    this.animation = {
        duration: 200,
        interval: 25,
        currentTime: 0
    };

    jsu.setObjectAttributes(this, options, [
        'widgetPlace',
        'padding',
        'boxWidth',
        'boxHeight',
        'minSize',
        'selected',
        'color',
        'boxBg'
    ]);
    if (options && options.elements) {
        for (let i = 0; i < options.elements.length; i++) {
            this.addElement(options.elements[i]);
        }
    }

    if (this.color == '-') {
        this.color = 'transparent';
    }

    jsu.onDOMLoad(this.initCoverList.bind(this));
}

/* cover list widget */
CoverList.prototype.addElement = function (ele) {
    const element = {
        index: this.elements.length,
        title: 'No title',
        thumb: '',
        url: ''
    };
    for (const field in ele) {
        element[field] = ele[field];
    }
    this.elements.push(element);
};
CoverList.prototype.initCoverList = function () {
    if (this.selected < 0) {
        this.selected = Math.floor(this.elements.length / 2);
    } else if (this.selected >= this.elements.length) {
        this.selected = this.elements.length - 1;
    }

    // Build widget
    let alt = '';
    for (const element of this.elements) {
        alt += '<li><a href="' + jsu.escapeAttribute(element.url) + '">' + jsu.escapeHTML(element.title) + '</a></li>';
    }
    const html = '' +
        '<ul class="cover-alt sr-only">' + alt + '</ul>' +
        '<canvas aria-hidden="true"></canvas>' +
        '<div class="cover-loading" aria-hidden="true"><i class="loader"></i></div>' +
        '<div class="cover-bar" aria-hidden="true"' + (this.elements.length < 2 ? ' style="display: none;"' : '') + '>' +
            '<button type="button" class="cover-previous" aria-hidden="true" ' +
                'title="' + jsu.translate('Previous') + '">' +
                '<b>&lt;</b></button>' +
            '<div class="cover-slider">' +
                '<input type="range" role="slider" aria-hidden="true" ' +
                    'min="0" max="' + (this.elements.length - 1) + '" ' +
                    'value="' + this.selected + '" draggable="draggable"/>' +
            '</div>' +
            '<button type="button" class="cover-next" aria-hidden="true" ' +
                'title="' + jsu.translate('Next') + '">' +
                '<b>&gt;</b></button>' +
        '</div>';
    this.widgetElement = document.querySelector(this.widgetPlace);
    this.widgetElement.innerHTML = html;
    this.widgetElement.classList.add('cover-list');
    this.rangeInput = this.widgetElement.querySelector('.cover-slider input');

    // use only integer and divisible by two values for width and height
    // this is done to avoid having a blurry centered image
    this.widgetWidth = parseInt(this.widgetElement.clientWidth, 10);
    if (this.widgetWidth % 2 != 0) {
        this.widgetWidth--;
    }
    this.widgetHeight = parseInt(this.widgetElement.clientHeight, 10);
    if (this.widgetHeight % 2 != 0) {
        this.widgetHeight--;
    }
    this.calculatePositions();

    try {
        this.initCanvas();
    } catch (err) {
        console.error('Error when trying to initialize cover list.', err);
    }

    // init events
    const obj = this;
    this.widgetElement.querySelector('.cover-previous').addEventListener('click', this.goToPrevious.bind(this));
    this.widgetElement.querySelector('.cover-next').addEventListener('click', this.goToNext.bind(this));
    this.rangeInput.addEventListener('input', function () {
        obj.goToIndex(this.value);
    });
};
CoverList.prototype.calculatePositions = function () {
    if (this.elements.length == 0) {
        this.positions = [];
    } else if (this.elements.length == 1) {
        const top = (this.widgetHeight - this.boxHeight) / 2 + this.yOffset;
        const offset = (this.widgetWidth - this.boxWidth) / 2;

        this.positions.push({
            delta: 0,
            factor: 0,
            width: this.boxWidth,
            height: this.boxHeight,
            zindex: 1,
            top: top,
            offset: offset
        });
    } else {
        const positionsLength = this.elements.length;
        let multiplier = 1;
        if (positionsLength < 5) {
            multiplier = 0.75;
            if (positionsLength < 3) {
                multiplier = 0.5;
            }
        }
        for (let i = positionsLength; i >= 0; i--) {
            const delta = positionsLength - i;
            let factor = delta / positionsLength;
            factor = Math.sqrt(factor) * multiplier;

            const width = this.boxWidth * (1 - factor * this.minSize);
            const height = this.boxHeight * (1 - factor * this.minSize);
            const zindex = positionsLength - delta;
            const top = (this.widgetHeight - height) / 2 + this.yOffset;
            const offset = ((this.widgetWidth - width) / 2) + (factor * (this.widgetWidth - width) / 2);

            this.positions.push({
                delta: delta,
                factor: factor,
                width: width,
                height: height,
                zindex: zindex,
                top: top,
                offset: offset
            });
        }
    }
};
CoverList.prototype.hideLoading = function () {
    this.widgetElement.querySelector('.cover-loading').style.display = 'none';
};
CoverList.prototype.initCanvas = function () {
    const canvasEle = this.widgetElement.querySelector('canvas');
    canvasEle.setAttribute('width', this.widgetWidth);
    canvasEle.setAttribute('height', this.widgetHeight);

    this.width = canvasEle.width;
    this.height = canvasEle.height;
    this.ctx = canvasEle.getContext('2d');

    this.boxes = [];
    this.boxesDict = {};
    this.nbImagesLoaded = 0;
    this.imagesLoaded = false;

    // click events
    const obj = this;

    canvasEle.addEventListener('click', function (evt) {
        let dom = canvasEle, xOffset = 0, yOffset = 0;
        // get canvas offset
        while (dom != null && dom != undefined) {
            xOffset += dom.offsetLeft;
            yOffset += dom.offsetTop;
            dom = dom.offsetParent;
        }
        const x = evt.pageX - xOffset;
        const y = evt.pageY - yOffset;
        obj.onCanvasClick(x, y);
    });

    for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];

        const delta = i - this.selected;
        const attrs = this.positions[Math.abs(delta)];
        let left;
        if (delta < 0) {
            left = this.widgetWidth - attrs.width - attrs.offset;
        } else {
            left = attrs.offset;
        }

        this.addBox(new CoverCanvasBox({
            id: i,
            bw: this.boxWidth,
            bh: this.boxHeight,
            padding: this.padding,
            title: element.title,
            x: left,
            y: attrs.top,
            w: attrs.width,
            h: attrs.height,
            z: attrs.zindex,
            color: this.color,
            boxBg: this.boxBg,
            thumb: element.thumb,
            url: element.url,
            callback: this.onImageLoad.bind(this)
        }));
    }
};
CoverList.prototype.onImageLoad = function () {
    this.nbImagesLoaded++;
    if (this.nbImagesLoaded >= this.elements.length) {
        this.imagesLoaded = true;
        this.hideLoading();
        this.drawBoxes();
    }
};
CoverList.prototype.goToPrevious = function () {
    this.goToIndex(this.selected - 1);
};
CoverList.prototype.goToNext = function () {
    this.goToIndex(this.selected + 1);
};
CoverList.prototype.goToIndex = function (index) {
    if (index < 0 || index > this.elements.length - 1 || index == this.selected) {
        return;
    }
    this.selected = index;
    const steps = this.animation.duration / this.animation.interval;
    for (let i = 0; i < this.elements.length; i++) {
        const delta = i - this.selected;
        const attrs = this.positions[Math.abs(delta)];
        let left;
        if (delta < 0) {
            left = this.widgetWidth - attrs.width - attrs.offset;
        } else {
            left = attrs.offset;
        }

        this.boxesDict['box_' + i].setTarget({
            steps: steps,
            x: left,
            y: attrs.top,
            w: attrs.width,
            h: attrs.height,
            z: attrs.zindex,
            color: this.color
        });
    }

    this.animateMovement();

    this.rangeInput.value = this.selected;
};
CoverList.prototype.addBox = function (box) {
    this.boxes.push(box);
    this.boxesDict['box_' + box.id] = box;
    box.loadImage();
};
CoverList.prototype.drawBoxes = function () {
    // get background first
    this.boxes = this.boxes.sort(function (a, b) {
        return a.z - b.z;
    });
    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    // draw boxes
    for (let i = 0; i < this.boxes.length; i++) {
        this.boxes[i].draw(this.ctx);
    }
};
CoverList.prototype.onCanvasClick = function (x, y) {
    // get foreground first
    const boxes = this.boxes.sort(function (a, b) {
        return b.z - a.z;
    });
    // get selected
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].contains(x, y)) {
            this.selectBox(boxes[i]);
            break;
        }
    }
};
CoverList.prototype.selectBox = function (box) {
    if (box.id == this.selected) {
        // go to box url
        window.location = box.url;
    } else {
        // move boxes
        this.goToIndex(box.id);
    }
};
CoverList.prototype.animateMovement = function () {
    this.animation.currentTime = 0;
    this.animation.timeout = null;
    this.animateMovementLoop();
};
CoverList.prototype.animateMovementLoop = function () {
    if (this.animation.timeout != null) {
        clearTimeout(this.animation.timeout);
        this.animation.timeout = null;
    }
    if (this.animation.currentTime >= this.animation.duration) {
        return;
    }
    // draw next step
    for (let i = 0; i < this.boxes.length; i++) {
        this.boxes[i].increment();
    }
    if (this.imagesLoaded) {
        this.drawBoxes();
    }
    // programm next draw
    this.animation.currentTime += this.animation.interval;
    const obj = this;
    this.animation.timeout = setTimeout(function () {
        obj.animateMovementLoop();
    }, this.animation.interval);
};
