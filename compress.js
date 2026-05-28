// PNG 批量转 JPG 压缩工具
var sharp = require('sharp');
var fs = require('fs');
var path = require('path');

var inputDir = process.argv[2] || 'F:/拍照/新建文件夹';
var outputDir = process.argv[3] || 'F:/拍照/已压缩';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

var files = fs.readdirSync(inputDir).filter(function(f) { return /\.(png|PNG)$/.test(f); });
console.log('找到 ' + files.length + ' 张PNG，开始压缩...');

files.forEach(function(f, i) {
    var src = path.join(inputDir, f);
    var dest = path.join(outputDir, f.replace(/\.png$/i, '.jpg'));
    sharp(src)
        .jpeg({ quality: 88, progressive: true })
        .toFile(dest, function(err, info) {
            if (err) console.log('FAIL: ' + f);
            else {
                var sr = fs.statSync(src).size;
                var dr = fs.statSync(dest).size;
                console.log((i+1) + '/' + files.length + ' ' + f + ' -> ' + (dr/1024/1024).toFixed(1) + 'MB (压缩率 ' + ((1-dr/sr)*100).toFixed(0) + '%)');
            }
        });
});

console.log('压缩输出目录: ' + outputDir);
