var fs = require('fs');
var src = process.argv[2] || 'F:/参考图/塞巴斯蒂安';
var dst = process.argv[3] || 'F:/拍照/已压缩/黑执事_塞巴斯蒂安';
fs.mkdirSync(dst, { recursive: true });
var files = fs.readdirSync(src).sort();
files.forEach(function(f, i) {
    fs.copyFileSync(src + '/' + f, dst + '/' + (i + 1) + '.jpg');
    console.log((i + 1) + ': ' + f + ' -> ' + (i + 1) + '.jpg');
});
console.log('Done: ' + files.length + ' files');
