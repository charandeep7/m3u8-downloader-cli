const { spawn } = require("child_process");
const { random } = require('glowing-engine');
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function downloadVideo(url, outputName, outputPath) {
  const ffmpegCommand = `ffmpeg -i "${url}" -bsf:a aac_adtstoasc -vcodec copy -c copy -crf 50 "${outputPath}/${outputName}.mp4"`;

  const childProcess = spawn(ffmpegCommand, {
    shell: true,
    detached: true, 
    stdio: "ignore" 
  });

  childProcess.unref(); 
}

function promptUser() {
  rl.question("Enter the m3u8 URL: ", (url) => {
    rl.question("Enter the output file name (press Enter for default): ", (outputName) => {
        const defaultName = (new Date()).toString().concat('download').split(' ').slice(2,4).join('').concat(random.randomNumberInRange(1,9999999999999).toString());
        outputName = outputName || defaultName;
      rl.question("Enter the output folder path (press Enter for current directory): ", (outputPath) => {
        const defaultOutputPath = process.cwd(); 
        outputPath = outputPath || defaultOutputPath; 
        if (!fs.existsSync(outputPath)) {
          console.error(`Error: Output folder '${outputPath}' does not exist.`);
          rl.close();
          return;
        }
        downloadVideo(url, outputName, outputPath);
        rl.close();
      });
    });
  });
}

promptUser();
