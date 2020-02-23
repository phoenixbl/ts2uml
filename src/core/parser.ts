import * as TsMorph from "ts-morph";
import * as ts from "typescript";
import { PropertyDetails, MethodDetails, HeritageClause } from "./interfaces";

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
  // let className = classDeclaration.getSymbol()!.getName();

  const className = classDeclaration.getName() + "";

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

      // console.log(
      //   "isPublic:" + isPublic + ":" + sym?.getName() + "[" + type + "]"
      // );

      // if (isPublic && sym) {
      if (sym) {
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
      const methodType = method.getType();
      let type = "" + methodType?.getText();

      // const isPublic =
      //   method.hasModifier(ts.SyntaxKind.PublicKeyword) &&
      //   method.getFirstModifierByKind(ts.SyntaxKind.PublicKeyword);

      // console.log(
      //   "isPublic:" + isPublic + ":" + sym?.getName() + "[" + type + "]"
      // );
      let returnType = "";
      let params = "";

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
  const className = classDeclaration.getName() + ""; //classDeclaration.getSymbol()!.getName();
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

export function parseEnums(enumDeclaration: TsMorph.EnumDeclaration) {
  const enumName = enumDeclaration.getSymbol()!.getName();
  const enumMembers = enumDeclaration.getMembers();

  const properties = enumMembers
    .map(property => {
      let type = "" + property.getText();
      return {
        name: type,
        propertyType: ""
      };
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  return { className: enumName, properties }; //use className for enumName
}
