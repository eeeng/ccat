const fs = require('fs');
const path = require('path');

const work_dir = 'c:\\Users\\hjroh\\OneDrive\\Desktop\\고탈겜_통합';
const game_code = fs.readFileSync('c:\\Users\\hjroh\\OneDrive\\Desktop\\고탈겜_1\\sketch.js', 'utf8');
const story_code = fs.readFileSync('c:\\Users\\hjroh\\OneDrive\\Desktop\\고탈겜_2\\sketch.js', 'utf8');

function removeFunction(code, funcName) {
    const startIdx = code.indexOf(`function ${funcName}(`);
    if (startIdx === -1) return code;

    let braceIdx = code.indexOf('{', startIdx);
    let braceCount = 1;
    let endIdx = braceIdx + 1;
    
    while (braceCount > 0 && endIdx < code.length) {
        if (code[endIdx] === '{') braceCount++;
        else if (code[endIdx] === '}') braceCount--;
        endIdx++;
    }
    
    return code.slice(0, startIdx) + code.slice(endIdx);
}

let game_code_clean = game_code;
['preload', 'setup', 'draw', 'keyPressed'].forEach(fn => {
    game_code_clean = removeFunction(game_code_clean, fn);
});

// Replace width and height with 600 and 800, ensuring they are not properties
game_code_clean = game_code_clean.replace(/(?<!\.)\bwidth\b/g, '600');
game_code_clean = game_code_clean.replace(/(?<!\.)\bheight\b/g, '800');

let story_code_clean = story_code;
['preload', 'setup', 'draw', 'mousePressed', 'keyPressed', 'windowResized'].forEach(fn => {
    story_code_clean = removeFunction(story_code_clean, fn);
});

fs.writeFileSync(path.join(work_dir, 'game.js'), game_code_clean, 'utf8');
fs.writeFileSync(path.join(work_dir, 'story.js'), story_code_clean, 'utf8');

console.log("Split and replace completed via Node.");
