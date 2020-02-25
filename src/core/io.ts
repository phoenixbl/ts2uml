// MIT License

// Copyright (c) 2016-2018 Remo H. Jansen

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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

export async function downloadAndSave(url: string) {
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

        const filePath = "./uml.svg";
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
