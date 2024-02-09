import fs from "fs";
import util from "util";
import path from "path";
import inquirer from "inquirer";
import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient({ libVersion: "v1" });

async function convert(fileName) {
  const filePath = path.parse(fileName);
  const xmlFileContent = fs.readFileSync(fileName);

  const content = xmlFileContent.toString("utf-8").replace(/\n|\r/g, "");

  // const request = {
  //   input: { ssml: content },
  //   voice: {
  //     languageCode: "es-US",
  //     name: "es-US-Wavenet-B",
  //   },
  //   audioConfig: {
  //     audioEncoding: "LINEAR16",
  //     pitch: -2.4,
  //   },
  // };

  const request = {
    input: { ssml: content },
    voice: {
      languageCode: "en-US",
      name: "en-US-Neural2-J",
    },
    audioConfig: {
      audioEncoding: "LINEAR16",
      pitch: -2.4,
    },
  };

  console.log("Converting: 📝 ➡️ 🗣 ...");

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  const audofilePath = `${filePath.dir}/${filePath.name}.mp3`;
  await writeFile(audofilePath, response.audioContent, "binary");
  console.log(`✅ Audio content written to file: ${audofilePath}`);
}

if (process.argv.length > 2) {
  convert(process.argv[2]).catch((error) => console.log(error));
} else {
  inquirer
    .prompt([
      {
        type: "input",
        name: "FILE_NAME",
        message: "XML (ssml) file that you want to convert to speech",
      },
    ])
    .then((answers) => {
      return convert(answers.FILE_NAME);
    })
    .catch((error) => console.log(error));
}
