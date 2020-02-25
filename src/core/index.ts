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
import { flatten, join } from "lodash";
import { findFilesByGlob, generateDiagram } from "./io";
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
  emitSingleEnum,
  emitSimpleAssociations
} from "./emitter";

export async function getDiagramUrl(tsConfigPath: string, pattern: string) {
  let dsl = await generateDsl(tsConfigPath, pattern);

  console.log(chalk.gray("DSL:\n" + dsl));

  return await generateDiagram(dsl);
  // return "";
}

async function generateDsl(tsConfigPath: string, pattern: string) {
  const sourceFilesPaths = await findFilesByGlob(pattern);

  console.log(
    chalk.greenBright(
      "Matched files:\n" + sourceFilesPaths.reduce((p, c) => `${p}${c}\n`, "")
    )
  );

  const ast = getAst(tsConfigPath, sourceFilesPaths);
  const files = ast.getSourceFiles();
  const typeMappings: { [key: string]: [] } = {};

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
      emitSingleClass(c.className, c.properties, c.methods, typeMappings)
    );
    const interfaces = d.interfaces.map(i =>
      emitSingleInterface(
        i.interfaceName,
        i.properties,
        i.methods,
        typeMappings
      )
    );
    const enums = d.enums.map(e =>
      emitSingleEnum(e.className, e.properties, [], typeMappings)
    );

    const heritageClauses = d.heritageClauses.map(emitHeritageClauses);

    return [...enums, ...classes, ...interfaces, ...heritageClauses];
  });

  const associations = buildSimpleAssociation(typeMappings);

  return join(flatten(entities), ",") + associations;
}

function buildSimpleAssociation(typeMappings: { [key: string]: [] }): string {
  let association: string = "";

  for (const key in typeMappings) {
    typeMappings[key].forEach(el => {
      Object.keys(typeMappings).forEach(k => {
        const m = new RegExp("(^|\\W)" + k + "(\\W|$)");
        const s = el + "";

        if (s.match(m)) {
          const tmp = emitSimpleAssociations(key, k);
          if (association.indexOf(tmp) < 0) association += tmp;
        }
      });
    });
  }

  return association;
}
