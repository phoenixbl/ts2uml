#! /usr/bin/env node

import chalk from "chalk";
import * as yargs from "yargs";
import { getUrl, getDsl } from "../core";
import { download, downloadAndSave } from "../core/io";

(async () => {
  try {
    if (yargs.argv.help) {
      console.log(chalk.yellowBright("ts2uml --glob ./src/**/*.ts"));
    }

    let pattern = yargs.argv.glob as string;
    pattern = "./src/**/*.ts";
    pattern =
      "/Users/phoenixjiang/Source/vs-ext-sample-new/vscode-extension-samples/tree-view-sample/src/**/*.ts";

    if (!pattern) {
      console.log(chalk.redBright("Missing --glob"));
    } else {
      const url = await getUrl("./tsconfig.json", pattern);
      await downloadAndSave(url);
      const opn = require("open");
      opn(url);

      // const dsl = await getDsl("./tsconfig.json", pattern);
      // console.log(dsl);
    }
  } catch (e) {
    console.log(e);
    console.log(e.stack);
    // console.log(chalk.redBright(e));
  }
})();
