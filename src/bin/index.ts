#! /usr/bin/env node

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
