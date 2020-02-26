import glob from "glob";
import * as request from "request";
import * as fs from "fs";
import chalk from "chalk";

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

export async function generateDiagram(dsl: string) {
  return new Promise<string>((resolve, reject) => {
    const url = "https://yuml.me/diagram/boring;dir:LR/class/"; //nofunky;dir:LR

    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //这种也可以fix CERT_HAS_EXPIRED，但是全局选项，方法不可取

    const options = {
      form: {
        dsl_text: dsl
      },
      agentOptions: {
        rejectUnauthorized: false //the option can fix CERT_HAS_EXPIRED issue
      }
    };

    request.post(url, options, (err, res, body) => {
      if (err) {
        reject(err);
        return "";
      }

      if (body) {
        console.log(
          chalk.yellowBright(`generate diagram on: https://yuml.me/${body}`)
        );

        const svgFileName = body.replace(".png", ".svg");
        const diagramUrl = `${url}${svgFileName}`;
        resolve(diagramUrl);
      } else {
        console.error("Cannot generate uml diagram!");
        throw new Error("Cannot generate uml diagram!");
      }
    });
  });
}

export async function downloadAndSave(url: string, output: string = "") {
  return new Promise<string>((resolve, reject) => {
    console.log("start download and save diagram...");

    request.get(
      {
        url: url,
        agentOptions: {
          rejectUnauthorized: false
        }
      },
      (err, response, body) => {
        if (err) {
          console.error(err);
        }
        output = output === "" ? "./uml.svg" : output;
        output = output.endsWith(".svg") ? output : output + "/uml.svg";

        const filePath = output;
        const file: NodeJS.WritableStream = fs.createWriteStream(filePath);

        file.on("error", err => console.error(err));

        let content = response.body;
        response.on("close", () => {
          console.log("done.");
          resolve(filePath);
        });

        file.write(content);

        file.on("end", () => {
          console.log("close");
        });
      }
    );
  });
}
