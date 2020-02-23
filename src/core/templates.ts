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
