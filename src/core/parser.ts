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

import * as TsMorph from "ts-morph";
import * as ts from "typescript";
import {
  PropertyDetails,
  MethodDetails,
  HeritageClause,
  AccessType
} from "./interfaces";

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

      if (sym) {
        return {
          name: sym.getName(),
          propertyType: type,
          accessType: parseAccessType(property),
          decorated: parseDecorated(property)
        };
      }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  const methods = methodDeclarations
    .map(method => parseMethod(method))
    .filter(p => p !== undefined) as MethodDetails[];

  // console.log(properties);
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
          propertyType: propertyType?.getText(),
          accessType: parseAccessType(property),
          decorated: ""
        };
      }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  const methods = methodDeclarations
    .map(method => parseMethod(method))
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

function parseMethod(
  method: TsMorph.MethodDeclaration | TsMorph.MethodSignature
) {
  const sym = method.getSymbol();
  const methodType = method.getType();
  let type = "" + methodType?.getText();
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
      parameters: params,
      accessType: parseAccessType(method),
      decorated: parseDecorated(method)
    };
  }
}

function parseAccessType(
  type:
    | TsMorph.PropertyDeclaration
    | TsMorph.PropertySignature
    | TsMorph.MethodDeclaration
    | TsMorph.MethodSignature
): AccessType {
  if (type instanceof TsMorph.MethodSignature) return AccessType.PRIVATE;

  const isStatic =
    type.hasModifier(ts.SyntaxKind.StaticKeyword) &&
    type.getFirstModifierByKind(ts.SyntaxKind.StaticKeyword);

  if (isStatic) return AccessType.STATIC;

  const isPublic =
    type.hasModifier(ts.SyntaxKind.PublicKeyword) &&
    type.getFirstModifierByKind(ts.SyntaxKind.PublicKeyword);

  if (isPublic) return AccessType.PUBLIC;

  const isProtected =
    type.hasModifier(ts.SyntaxKind.ProtectedKeyword) &&
    type.getFirstModifierByKind(ts.SyntaxKind.ProtectedKeyword);
  if (isProtected) return AccessType.PROTECTED;

  return AccessType.PRIVATE;
}

function parseDecorated(
  property:
    | TsMorph.PropertyDeclaration
    | TsMorph.MethodDeclaration
    | TsMorph.MethodSignature
): string {
  if (property instanceof TsMorph.MethodSignature) return "";
  const decorates = property.getDecorators();
  return decorates.length === 0 ? "" : decorates[0].getName();
}
