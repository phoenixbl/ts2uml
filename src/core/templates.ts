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

import { PropertyDetails, MethodDetails, AccessType } from "./interfaces";

enum SupportedTypes {
  CLASS,
  INTERFACE,
  ENUM
}

export const templates = {
  composition: "+->",
  implementsOrExtends: (abstraction: string, implementation: string) => {
    return (
      `${templates.plainClassOrInterface(abstraction)}` +
      `^-${templates.plainClassOrInterface(implementation)}`
    );
  },
  simpleAssociate: (source: string, associated: string) => {
    return `,[${source}]->[${associated}]`;
  },
  plainClassOrInterface: (name: string) => `[${name}]`,
  color4Type: (name: string, type: SupportedTypes) => {
    switch (type) {
      case SupportedTypes.CLASS:
        return `[${name}]`;
      case SupportedTypes.INTERFACE:
        return `[${name}{bg:wheat}]`; //thistle}]`;
      case SupportedTypes.ENUM:
        return `[${name}{bg:skyblue}]`;
      default:
        return `[${name}]`;
    }
  },
  class: (name: string, props: PropertyDetails[], methods: MethodDetails[]) => {
    return parsePropsAndMethods(name, SupportedTypes.CLASS, props, methods);
  },
  enum: (name: string, props: PropertyDetails[], methods: MethodDetails[]) => {
    return parsePropsAndMethods(name, SupportedTypes.ENUM, props, methods);
  },
  interface: (
    name: string,
    props: PropertyDetails[],
    methods: MethodDetails[]
  ) => {
    return parsePropsAndMethods(name, SupportedTypes.INTERFACE, props, methods);
  }
};

function parsePropsAndMethods(
  name: string,
  type: SupportedTypes,
  props: PropertyDetails[],
  methods: MethodDetails[]
) {
  const pTemplate = (property: PropertyDetails) =>
    `${
      type === SupportedTypes.CLASS
        ? property.decorated
          ? parseDecorated(property.decorated)
          : parseAccessType(property.accessType)
        : ""
    }${property.name}${
      !property.propertyType ? "" : ": " + parseType(property.propertyType)
    };`;

  const mTemplate = (method: MethodDetails) =>
    `${
      type == SupportedTypes.INTERFACE
        ? ""
        : parseAccessType(method.accessType) + parseDecorated(method.decorated)
    }${method.name}${
      method.returnType === "void"
        ? "()"
        : "(" +
          parseType(method.parameters) +
          "): " +
          parseType(method.returnType)
    };`;

  let parsedProperties = props.map(pTemplate).join("");
  let parsedMethods = methods.map(mTemplate).join("");

  return (
    `${templates.color4Type(name, type)}` +
    `[${name}${parsedProperties ? "|" + parsedProperties : ""}${
      parsedMethods ? "|" + parsedMethods : ""
    }]`
  );

  function parseType(type: string) {
    return !type
      ? ""
      : "" +
          type
            .replace(/\|/g, "｜")
            .replace(/\[/g, "［") //［］
            .replace(/\]/g, "］")
            .replace(/{/g, "｛") //｛｝
            .replace(/}/g, "｝") //【】
            .replace(/</g, "＜")
            .replace(/>/g, "＞")
            .replace(/;/g, "；")
            .replace(/,/g, "，")
            .replace(/import.+\/.+\./g, "") // import("vscode").TreeItem
            .replace(/import\(\"/g, "")
            .replace(/\"\)/g, "");
  }

  function parseAccessType(type: AccessType) {
    switch (type) {
      case AccessType.STATIC:
        return "~";
      case AccessType.PUBLIC:
        return "+";
      case AccessType.PROTECTED:
        return "*";

      default:
        return "-";
    }
  }

  function parseDecorated(decorated: string) {
    return decorated ? `@${decorated} ` : "";
  }
}
