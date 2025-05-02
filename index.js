const ffmpeg = require('fluent-ffmpeg');
const { random } = require('glowing-engine');
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function downloadVideo(url, outputName, outputPath) {
  const outputFile = `${outputPath}/${outputName}.mp4`;
  const startTime = new Date();  // Record start time

  console.log(`\nStarting download...`);
  console.log(`Output File: ${outputFile}`);
  console.log(`Starting at: ${startTime.toLocaleString()}`);
  console.log(`\nPlease wait while the video is being downloaded...\n`);

  let lastReceived = 0;
  let lastTime = Date.now();

  ffmpeg(url)
    .outputOptions([
      '-bsf:a aac_adtstoasc', // Fixes audio codec issues with HLS streams
      '-vcodec copy',         // Copy video codec
      '-c copy',              // Copy audio codec
      '-crf 50'               // Compression factor
    ])
    .output(outputFile)
    .on('start', (commandLine) => {
      console.log(`\nFFmpeg command started: ${commandLine}\n`);
    })
    .on('progress', (progress) => {
      // Extract relevant progress data
      const percent = (progress.percent || 0).toFixed(2);
      const currentKbps = progress.currentKbps || 0;
      const timemark = progress.timemark || '00:00:00';

      // Convert Kbps to MB/s (1 MB = 8 Mbps, so divide by 1024 to convert from Kbps to MB/s)
      const downloadSpeed = (currentKbps / 1024 / 8).toFixed(2); // MB/s

      // Display progress information
      process.stdout.write(`\rDownload Progress: ${percent}%  Speed: ${downloadSpeed} MB/s  Timemark: ${timemark}`);
    })
    .on('end', () => {
      const endTime = new Date();
      console.log(`\n\nDownload complete!`);
      console.log(`Output File: ${outputFile}`);
      console.log(`Started at: ${startTime.toLocaleString()}`);
      console.log(`Completed at: ${endTime.toLocaleString()}`);
      console.log(`Total Time Taken: ${((endTime - startTime) / 1000).toFixed(1)} seconds`);
    })
    .on('error', (err) => {
      console.error(`\nAn error occurred: ${err.message}`);
    })
    .run();
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
