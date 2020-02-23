#! /usr/bin/env node

import chalk from "chalk";
import * as yargs from "yargs";
import { getDiagramUrl } from "../core";
import { downloadAndSave } from "../core/io";
import open from "open";

(async () => {
  try {
    if (yargs.argv.help) {
      console.log(chalk.yellowBright("ts2uml --glob ./src/**/*.ts"));
    }

    let pattern = yargs.argv.glob as string;
    if (!pattern) {
      pattern = "./src/**/*.ts";

      console.log(
        chalk.yellowBright("Missing --glob and execute with './src/**/*.ts'")
      );
    }

    // pattern = "/Users/phoenixjiang/Source/p_wit_tree_vue/**/*.ts";
    pattern = "/Users/phoenixjiang/Source/p_wit_menu_vue/**/*.ts";

    const url = await getDiagramUrl("./tsconfig.json", pattern);

    if (url) {
      let path = await downloadAndSave(url);
      let canOpen = yargs.argv.open as string;
      canOpen = "y";

      if (canOpen) {
        const open = require("open");
        open(path, { app: "google chrome" });
      }
    }
  } catch (e) {
    console.log(chalk.redBright(e.stack));
  }
})();
