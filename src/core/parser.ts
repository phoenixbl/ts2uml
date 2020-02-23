import * as TsMorph from "ts-morph";
import * as ts from "typescript";
// import { flatten, join } from "lodash";
import { PropertyDetails, MethodDetails, HeritageClause } from "./interfaces";
// import { stringify } from "querystring";

export function getAst(tsConfigPath: string, sourceFilesPaths?: string[]) {
  const ast = new TsMorph.Project({
    tsConfigFilePath: tsConfigPath,
    addFilesFromTsConfig: !Array.isArray(sourceFilesPaths)
  });

  if (sourceFilesPaths) {
    ast.addSourceFilesAtPaths(sourceFilesPaths);
  }
  return ast;
}

export function parseClasses(classDeclaration: TsMorph.ClassDeclaration) {
  const className = classDeclaration.getSymbol()!.getName();
  const propertyDeclarations = classDeclaration.getProperties();
  const methodDeclarations = classDeclaration.getMethods();

  const properties = propertyDeclarations
    .map(property => {
      const sym = property.getSymbol();
      const propertyType = property.getType();
      let type = "" + propertyType?.getText();

      const isPublic =
        property.hasModifier(ts.SyntaxKind.PublicKeyword) &&
        property.getFirstModifierByKind(ts.SyntaxKind.PublicKeyword);

      console.log(
        "isPublic:" + isPublic + ":" + sym?.getName() + "[" + type + "]"
      );

      if (isPublic && sym) {
        return {
          name: sym.getName(),
          propertyType: type
        };
      }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  const methods = methodDeclarations
    .map(method => {
      const sym = method.getSymbol();
      // const t = method
      //   .getReturnType()
      //   .getText(
      //     method.getReturnTypeNode(),
      //     ts.TypeFormatFlags.UseTypeOfFunction
      //   );

      // const c = method
      //   .getSignature()
      //   .getTypeParameters()
      //   .map(p =>
      //     p
      //       .getDefault()
      //       ?.getApparentType()
      //       .getText()
      //   )
      //   .join(",");
      const methodType = method.getType();
      let type = "" + methodType?.getText();

      const isPublic =
        method.hasModifier(ts.SyntaxKind.PublicKeyword) &&
        method.getFirstModifierByKind(ts.SyntaxKind.PublicKeyword);

      console.log(
        "isPublic:" + isPublic + ":" + sym?.getName() + "[" + type + "]"
      );
      let returnType = "";
      let params = "";

      //       isPublic:false:getTreeItem[(element: { key: string; }) => import("vscode").TreeItem | Thenable<import("vscode").TreeItem>]
      // isPublic:false:getTreeItemInternal[(key: string) => import("vscode").TreeItem]

      if (type && type.length > 3) {
        // type = type.substring(1);

        let index = type.indexOf("=>"); //=＞ void
        if (index < 0) {
          returnType = "void";
          if (type.startsWith("typeof ")) {
            params = "";
          } else {
            params = type;
          }
        } else {
          returnType = type.substring(index + 2).trim();
          params = type.substring(1, index - 2); //receiveMessageHandlers: { [cmd: string]: Function; }) => void
        }
      }

      if (sym) {
        return {
          name: sym.getName(),
          returnType: returnType,
          parameters: params
        };
      }
    })
    .filter(p => p !== undefined) as MethodDetails[];

  return { className, properties, methods };
}

export function parseInterfaces(
  interfaceDeclaration: TsMorph.InterfaceDeclaration
) {
  const interfaceName = interfaceDeclaration.getSymbol()!.getName();
  const propertyDeclarations = interfaceDeclaration.getProperties();
  const methodDeclarations = interfaceDeclaration.getMethods();

  const properties = propertyDeclarations
    .map(property => {
      const sym = property.getSymbol();
      const propertyType = property.getType();

      if (sym) {
        return {
          name: sym.getName(),
          propertyType: propertyType?.getText()
        };
      }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  const methods = methodDeclarations
    .map(method => {
      const sym = method.getSymbol();
      const t = method.getReturnType().getText();
      const parameters = method
        .getSignature()
        .getTypeParameters()
        .map(p =>
          p
            .getDefault()
            ?.getApparentType()
            .getText()
        )
        .join(",");
      if (sym) {
        return {
          name: sym.getName(),
          returnType: t,
          parameters: parameters,
          paramS: method.getParameters().map(p => {
            return;
          })
        };
      }
    })
    .filter(p => p !== undefined) as MethodDetails[];

  return { interfaceName, properties, methods };
}

export function parseHeritageClauses(
  classDeclaration: TsMorph.ClassDeclaration
) {
  const className = classDeclaration.getSymbol()!.getName();
  const extended = classDeclaration.getExtends();
  const implemented = classDeclaration.getImplements();
  let heritageClauses: HeritageClause[] = [];

  if (extended) {
    const identifier = extended.getChildrenOfKind(ts.SyntaxKind.Identifier)[0];
    if (identifier) {
      const sym = identifier.getSymbol();
      if (sym) {
        heritageClauses.push({
          clause: sym.getName(),
          className
        });
      }
    }
  }

  if (implemented) {
    implemented.forEach(i => {
      const identifier = i.getChildrenOfKind(ts.SyntaxKind.Identifier)[0];
      if (identifier) {
        const sym = identifier.getSymbol();
        if (sym) {
          heritageClauses.push({
            clause: sym.getName(),
            className
          });
        }
      }
    });
  }

  return heritageClauses;
}

// export function parseConnectClauses(
//   interfaceDeclaration: TsMorph.InterfaceDeclaration
// ) {
//   const className = interfaceDeclaration.getSymbol()!.getName();
//   const extended = interfaceDeclaration.getExtends();
//   interfaceDeclaration.getHeritageClauses;
//   // const implemented = interfaceDeclaration.getImplements();
//   let heritageClauses: HeritageClause[] = [];

//   if (extended) {
//     const identifier = extended.getChildrenOfKind(ts.SyntaxKind.Identifier)[0];
//     // extended.g
//     if (identifier) {
//       const sym = identifier.getSymbol();
//       if (sym) {
//         heritageClauses.push({
//           clause: sym.getName(),
//           className
//         });
//       }
//     }
//   }

//   if (implemented) {
//     implemented.forEach(i => {
//       const identifier = i.getChildrenOfKind(ts.SyntaxKind.Identifier)[0];
//       if (identifier) {
//         const sym = identifier.getSymbol();
//         if (sym) {
//           heritageClauses.push({
//             clause: sym.getName(),
//             className
//           });
//         }
//       }
//     });
//   }

//   return heritageClauses;
// }

export function parseEnums(enumDeclaration: TsMorph.EnumDeclaration) {
  const enumName = enumDeclaration.getSymbol()!.getName();
  const enumMembers = enumDeclaration.getMembers(); //.getProperties();
  // const methodDeclarations = enumDeclaration.getMethods();

  const properties = enumMembers
    .map(property => {
      // const sym = property.getSymbol();
      // const propertyType = property.getType();
      // let type = "" + propertyType?.getText();
      let type = "" + property.getText();

      // const isPublic =
      //   property.hasModifier(ts.SyntaxKind.PublicKeyword) &&
      //   property.getFirstModifierByKind(ts.SyntaxKind.PublicKeyword);

      // console.log(
      //   "isPublic:" + isPublic + ":" + sym?.getName() + "[" + type + "]"
      // );

      // if (isPublic && sym) {
      return {
        name: type, //sym.getName()
        propertyType: ""
      };
      // }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  return { className: enumName, properties };
}
