import * as fs from "fs";
import chalk from "chalk";
import { flatten, join } from "lodash";
import { findFilesByGlob, download } from "./io";
// import { emitSingleEnum } from "./emitter";
import { templates } from "./templates";
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
  let summary: { [key: string]: [] } = {};

  // let right = [];

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

  // for (let i = 0; i < declarations.length; i++) {
  //   const d = declarations[i];
  //   d.interfaces.forEach(i => {
  //     left.push([i.interfaceName]:[]);
  //   });
  // }

  // emitter
  const entities = declarations.map(d => {
    const classes = d.classes.map(c =>
      emitSingleClass(c.className, c.properties, c.methods, summary)
    );
    const interfaces = d.interfaces.map(i =>
      emitSingleInterface(i.interfaceName, i.properties, i.methods, summary)
    );
    const enums = d.enums.map(e =>
      emitSingleEnum(e.className, e.properties, [], summary)
    );
    const heritageClauses = d.heritageClauses.map(emitHeritageClauses);

    //build simple SimpleAssociation
    // const associations = buildSimpleAssociation(summary);

    return [...enums, ...classes, ...interfaces, ...heritageClauses];
  });

  const associations = buildSimpleAssociation(summary);

  return join(flatten(entities), ",") + associations;
}

function buildSimpleAssociation(summary: { [key: string]: [] }): string {
  let association: string = "";

  for (const key in summary) {
    summary[key].forEach(el => {
      Object.keys(summary).forEach(k => {
        let m = new RegExp("(^|\\W)" + k + "(\\W|$)");
        let s = el as string;
        if (s.match(m)) {
          let tmp = templates.simpleAssociate(key, k);
          if (association.indexOf(tmp) < 0) association += tmp;
        }
      });
    });
  }

  return association;
}

export async function getUrl(tsConfigPath: string, pattern: string) {
  let dsl = await getDsl(tsConfigPath, pattern);
  console.log(dsl);
  return await download(dsl);
}
