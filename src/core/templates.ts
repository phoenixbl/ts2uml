import { PropertyDetails, MethodDetails } from "./interfaces";

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
  plainClassOrInterface: (name: string) => `[${name}]`,
  // colorClass: (name: string) => `[${name}]`, //`[${name}{bg:skyblue}]`,
  // colorInterface: (name: string) => `[${name}{bg:yellows}]`, //{bg:pink}]`, //`[${name}{bg:palegreen}]`,
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
    // const pTemplate = (property: PropertyDetails) => `${property.name};`;
    // const mTemplate = (method: MethodDetails) => `${method.name}();`;
    // return (
    //   `${templates.colorInterface(name)}` +
    //   `[${name}|${props.map(pTemplate).join("")}|${methods
    //     .map(mTemplate)
    //     .join("")}]`
    // );
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
    `${property.name}${
      !property.propertyType ? "" : ": " + parseType(property.propertyType)
    };`;

  const mTemplate = (method: MethodDetails) =>
    `${method.name}${
      method.returnType === "void"
        ? "()"
        : "(" + parseType(method.c) + "): " + parseType(method.returnType)
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
      : // : ": " +
        "" +
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
}
