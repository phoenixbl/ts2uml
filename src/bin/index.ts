#! /usr/bin/env node

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

import chalk from "chalk";
import * as yargs from "yargs";
import { getDiagramUrl } from "../core";
import { downloadAndSave } from "../core/io";

(async () => {
  try {
    console.log(chalk.yellowBright("default: ts2uml --glob ./src/**/*.ts"));
    console.log(chalk.yellowBright("--glob: path pattern"));
    console.log(chalk.yellowBright("--open: open with chrome"));

    let pattern = yargs.argv.glob as string;
    // console.log(pattern);

    if (!pattern) {
      pattern = "./src/**/*.ts";
    }

    console.log(chalk.yellowBright(`generate for ${pattern}`));

    const url = await getDiagramUrl("./tsconfig.json", pattern);

    if (url) {
      let path = await downloadAndSave(url);
      let canOpen = yargs.argv.open as string;

      if (canOpen) {
        const open = require("open");
        open(path, { app: "google chrome" }); //for mac
        // open(path.startsWith(".") ? process.cwd() + path.substring(1) : path, {
        //   app: "chrome"
        // }); //for win
      }
    }
  } catch (e) {
    console.log(chalk.redBright(e.stack));
  }
})();
