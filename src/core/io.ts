import * as glob from "glob";
import * as request from "request";
import * as fs from "fs";

export async function findFilesByGlob(pattern: string) {
  return new Promise<string[]>((res, rej) => {
    glob(pattern, (err, files) => {
      if (err) {
        rej(err);
      } else {
        res(files);
      }
    });
  });
}

export async function download(dsl: string) {
  return new Promise<string>((resolve, reject) => {
    const url = "https://yuml.me/diagram/boring/class/";
    const options = {
      form: {
        dsl_text: dsl
      }
    };
    request.post(url, options, (err, res, body) => {
      if (err) {
        reject(err);
      }
      const svgFileName = body.replace(".png", ".svg");
      const diagramUrl = `${url}${svgFileName}`;
      resolve(diagramUrl);
    });
  });
}

export async function downloadAndSave(url: string) {
  return new Promise<string>((resolve, reject) => {
    request.get(url, undefined, (err, response, body) => {
      if (err) {
        console.error(err);
      }

      const filePath = "./abc.svg";
      const file: NodeJS.WritableStream = fs.createWriteStream(filePath);

      file.on("error", err => console.error(err));

      let content = response.body;
      response.on("close", () => {
        console.log("close diagram");
      });
      file.write(content);

      file.on("end", () => {
        console.log("close");
      });
    });
  });
}
