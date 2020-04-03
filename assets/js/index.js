let fileinput = document.getElementById('file-input');
let canvas = document.getElementById('image-source');
let ctx = canvas.getContext('2d');

canvas.height = 200;
canvas.width = 200;

fileinput.onchange = function(e) {

    let img = new Image(canvas.width, canvas.height);
    let files = e.target.files; 
    let file = files[0];
    
    if (file !== undefined)
    {
        if (file.type.match('image.*'))
        {    
            let reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = function(e)
            {
                if(e.target.readyState == FileReader.DONE)
                {
                    img.src = e.target.result;
                    img.onload = () => 
                    {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        let init = false;
                        if (!init)
                        {
                            init = true;
                            $('#image-source').css('border', 'none');
                        }
                        
                        $('#image-source').addClass('animated flip');
                        
                        loopPixels(canvas.width, canvas.height);
                    }
                }
            }
        }
        else alert("The provided file couldn't be uploaded as an image.");
    }
};

function loopPixels(sizeX, sizeY) {

    let pixels = [];
    
    for (let i = 0; i < sizeY; i++)
    {
        for (let j = 0; j < sizeX; j++)
        {
            let pixel = getPixelColor(j, i);
            pixels.push(pixel);
        }
    }
    colorCount(pixels);
}

function getPixelColor(x, y) {
    
    let pixel = ctx.getImageData(x, y, 1, 1);
    let data = pixel.data;

    let r = data[0], g = data[1], b = data[2];
    
    return RGBToHex(r, g, b);
}

function colorCount(arr){

    let pixelData = {};

    while (arr.length != 0)
    {    
        let bufferColor = arr[0];
        let bufferSize = 0;

        for (let i = 0; i < arr.length; i++) {
            if (bufferColor == arr[i])
            {
                bufferSize++;
                arr.splice(i, 1);
                i--;
            }
        }
        let h = hexToHSV(bufferColor)[0];
        let s = hexToHSV(bufferColor)[1];
        let v = hexToHSV(bufferColor)[2];

        pixelData[bufferColor] = { 'pixels': bufferSize, 'h': h, 's': s, 'v': v };
    }
    colorSort(pixelData);
}

function colorSort(object){

    let sortedPixelData = [];
    
    for (let color in object) sortedPixelData.push({[color] : object[color]});

    sortedPixelData.sort((a, b) => a[Object.keys(a)].v < b[Object.keys(b)].v ? 1 : -1);
    
    searchColor(0, sortedPixelData);
}

function searchColor(range, arr){

    for (let i = 0; i < arr.length; i++)
    {
        let item = arr[i];
        let key = Object.keys(item);

        let s = item[key].s;
        let v = item[key].v;

        if (v - s <= range)
            return setCSS(key[0]);
    }
    range += 5;
    searchColor(range, arr);
}

function setCSS(hex){

    let r = hexToRGB(hex)[0];
    let g = hexToRGB(hex)[1];
    let b = hexToRGB(hex)[2];

    $('body').css('background-color', hex);

    $('#result-color').css('background-color', hex);
    $('#result-color').css('box-shadow', `rgba(${r}, ${g}, ${b}, 0.35) 5px 5px 10px`);

    $('#image-source').css('box-shadow', `rgba(${r}, ${g}, ${b}, 0.35) 0px 15px 30px`);
    
    $('#input-color-hex').val(hex.toUpperCase());
    $('#input-color-rgb').val(`RGB(${r}, ${g}, ${b})`);
    $('#input-color-rgba').val(`RGBA(${r}, ${g}, ${b}, 1)`);

    setTimeout(function(){
        $('#image-source').removeClass('animated flip');
    }, 3000);
}

function RGBToHex(r, g, b) {
    
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
  
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;
  
    return "#" + r + g + b;
}

function hexToHSV(hex) {
    
    let r = 0, g = 0, b = 0;
  
    if (hex.length == 4) {
      r = "0x" + hex[1] + hex[1];
      g = "0x" + hex[2] + hex[2];
      b = "0x" + hex[3] + hex[3];
  
    } else if (hex.length == 7) {
      r = "0x" + hex[1] + hex[2];
      g = "0x" + hex[3] + hex[4];
      b = "0x" + hex[5] + hex[6];
    }

    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
   
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
   
    if (diff == 0) {
        h = s = 0;
    }
    else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) h = bb - gg;
        else if (gabs === v) h = (1 / 3) + rr - bb;
        else if (babs === v) h = (2 / 3) + gg - rr;

        if (h < 0) h += 1;
        else if (h > 1) h -= 1;
    }

    return [
        Math.floor(h * 360),
        Math.floor(s * 100),
        Math.floor(v * 100)
    ];
}

function hexToRGB(hex) {
    
    let r = 0, g = 0, b = 0;
  
    if (hex.length == 4) {
      r = "0x" + hex[1] + hex[1];
      g = "0x" + hex[2] + hex[2];
      b = "0x" + hex[3] + hex[3];
  
    } else if (hex.length == 7) {
      r = "0x" + hex[1] + hex[2];
      g = "0x" + hex[3] + hex[4];
      b = "0x" + hex[5] + hex[6];
    }

    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);

    return [r, g, b];
}