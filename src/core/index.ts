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
