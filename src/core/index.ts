import * as fs from "fs";
import chalk from "chalk";
import { flatten, join } from "lodash";
import { findFilesByGlob, download } from "./io";
// import { emitSingleEnum } from "./emitter";
import {
  getAst,
  parseClasses,
  parseEnums,
  parseInterfaces,
  parseHeritageClauses
} from "./parser";
import {
  emitSingleClass,
  emitSingleInterface,
  emitHeritageClauses,
  emitSingleEnum
} from "./emitter";

export async function getDsl(tsConfigPath: string, pattern: string) {
  const sourceFilesPaths = await findFilesByGlob(pattern);

  console.log(
    chalk.yellowBright(
      "Matched files:\n" + sourceFilesPaths.reduce((p, c) => `${p}${c}\n`, "")
    )
  );

  const ast = getAst(tsConfigPath, sourceFilesPaths);
  const files = ast.getSourceFiles();

  // parser
  const declarations = files.map(f => {
    const classes = f.getClasses();
    const interfaces = f.getInterfaces();
    const enums = f.getEnums();
    const path = f.getFilePath();
    return {
      fileName: path,
      classes: classes.map(parseClasses),
      heritageClauses: classes.map(parseHeritageClauses),
      interfaces: interfaces.map(parseInterfaces),
      enums: enums.map(parseEnums)
    };
  });

  // emitter
  const entities = declarations.map(d => {
    const classes = d.classes.map(c =>
      emitSingleClass(c.className, c.properties, c.methods)
    );
    const interfaces = d.interfaces.map(i =>
      emitSingleInterface(i.interfaceName, i.properties, i.methods)
    );
    const enums = d.enums.map(e =>
      emitSingleEnum(e.className, e.properties, [])
    );
    const heritageClauses = d.heritageClauses.map(emitHeritageClauses);
    return [...enums, ...classes, ...interfaces, ...heritageClauses];
  });

  return join(flatten(entities), ",");
}

export async function getUrl(tsConfigPath: string, pattern: string) {
  let dsl = await getDsl(tsConfigPath, pattern);
  console.log(dsl);
  return await download(dsl);
}
