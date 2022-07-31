const e = require('express');
const fs = require('fs');

// open the file
// get class names from html and put in a array 
var HTMLclassNames = {};
var CSSblock = '';
var final_css = '';

// put ebery html files name here
loadClassAndTags('resources/views/home.html');
loadClassAndTags('resources/views/login.html');
loadClassAndTags('resources/views/register.html');

//setting some default classes / tags / css properties[dont delete]
setDefaultCSSBlocks();

// get number of classes
var numberOfClasses = 0;
for (var key in HTMLclassNames) {
    numberOfClasses++;
}
console.log('number of classes: ' + numberOfClasses);

// read all css file
CSSblock=loadCSS('resources/public/vendor/css/core.css');

css_blocks = CSSblock.split('\n:\n');

//match classes in css blocks
var css_classes = {};
for (var i = 0; i < css_blocks.length; i++) {
    var block = css_blocks[i];
    if(block.replace(/\n| /g,"")[0]==':'){
        final_css += block.replace(/\n/g, "") + '\n';
    }
    else if (block.indexOf('@') > -1)
    {
        processMediaQuery(block);
    }
    else processCSSblock(block);
}

// write to file
final_css = final_css.replace(/  /g,"");
fs.writeFileSync('resources/public/vendor/css/coreMin.css', final_css);

function loadClassAndTags(path) {
    lines = fs.readFileSync(path, 'utf8').split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // get tag name with only a-z
        var tagName = line.match(/<[a-z]+/g);
        if (tagName != null) {
            for (var j = 0; j < tagName.length; j++) {
                HTMLclassNames[tagName[j].split('<')[1]] = true;
            }
        }
        if (line.indexOf('class="') > -1) {
            var classNames = line.split('class="')[1].split('"')[0].split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] != '') {
                    HTMLclassNames[classNames[j]] = true;
                }
            }
        }
    }
}

function loadCSS(path , lines) {
    let block = '';
    if(lines == null) lines = fs.readFileSync(path, 'utf8');
    var brace = 0;
    for (var i = 0; i < lines.length; i++) {
        while (lines[i] != '\n' || brace) {
            if (lines[i] == '{') brace++;
            if (lines[i] == '}') brace--;
            block += lines[i++];
        }
        block += '\n\n:\n\n';
        while (lines[i] == '\n') i++;
        i--;
    }
    return block;
}


function processCSSblock(bolck)
{
    var all = block.split("{")[0].split(",");
    for (var ji = 0; ji < all.length; ji++) {
        let flag = true;
        var classes = all[ji].replace(/:not([^)]+)/g, "").replace(/\)|\(|\n/gi, "").split(/[.,> ]/);
        for (var j = 0; j < classes.length; j++) {
            if (classes[j] != '') {
                ak = classes[j].split(":")[0];
                if (HTMLclassNames[ak] != true) {
                    flag = false;
                    break;
                }
            }
        }
        if (flag) {
            final_css += block.replace(/\n/g, "") + '\n';
            return true;
        }
    }
    return false;
}

function processMediaQuery(block)
{
    var bb = block;
    var firstLine = block.match(/@[^{]+{/g);
    if(firstLine == null)
    {
        final_css += block.replace(/\n/g, "") + '\n';
        return;
    }
    else{
        block = block.split("{");
        block[0] = "";
        block = loadCSS("", block.join("{").replace(/{/, "").replace(/}\n$/, "")).split("\n\n:\n\n")
        let finalBlock = "";
        for(var i = 0; i < block.length; i++)
        {
            // processCSSSubBlock(block[i]);
            if (block[i] != "\n" && processCSSSubBlock(block[i])) finalBlock += block[i];
            // else console.log(block[i], ":::::", processCSSSubBlock(block[i]));
        }
        if(finalBlock!=""){
            let css = firstLine[0] + finalBlock;
            final_css += css+"}";
        }
    }
}

function setDefaultCSSBlocks()
{
    HTMLclassNames["active"] = true;
    HTMLclassNames["before"] = true;
    HTMLclassNames["after"] = true;
    HTMLclassNames["first-child"] = true;
    HTMLclassNames["last-child"] = true;
    HTMLclassNames["focus"] = true;
    HTMLclassNames["hover"] = true;
    HTMLclassNames["visited"] = true;
    HTMLclassNames["first-letter"] = true;
    HTMLclassNames["first-line"] = true;
    HTMLclassNames["not"] = true;
    HTMLclassNames[":"] = true;
    HTMLclassNames[":root"] = true;
    HTMLclassNames["root"] = true;
    HTMLclassNames["open"] = true;
    HTMLclassNames["show"] = true;
    HTMLclassNames["demo"] = true;
    HTMLclassNames["*"] = true;
    HTMLclassNames["layout-transitioning"] = true;
    HTMLclassNames["overflow-auto"] = true;
    // HTMLclassNames["ayout-menu-expanded"] = true;
    // HTMLclassNames["layout-overlay"] = true;
}


function processCSSSubBlock(block)
{
    if(block.search(/.menu/g) > -1) return true;
    var all = block.split("{")[0].split(",");
    for (var ji = 0; ji < all.length; ji++) {
        let flag = true;
        var classes = all[ji].replace(/:not([^)]+)/g, "").replace(/\)|\(|\n/gi, "").split(/[.,> ]/);
        for (var j = 0; j < classes.length; j++) {
            if (classes[j] != '') {
                ak = classes[j].split(":")[0];
                if (ak.match(/%/g) != null) return true;
                if (HTMLclassNames[ak] != true) {
                    flag = false;
                    break;
                }
            }
        }
        if (flag) {
            return true;
        }
    }
    return false;
}