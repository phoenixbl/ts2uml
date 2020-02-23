import { PropertyDetails, MethodDetails, HeritageClause } from "./interfaces";
import { templates } from "./templates";

export function emitSingleClass(
  name: string,
  properties: PropertyDetails[],
  methods: MethodDetails[],
  summary: any
) {
  summary[name] = [];
  properties.forEach(p => extractTypesFromProperty(name, p, summary));
  methods.forEach(m => extractTypesFromMethod(name, m, summary));
  return templates.class(name, properties, methods);
}

export function emitSingleInterface(
  name: string,
  properties: PropertyDetails[],
  methods: MethodDetails[],
  summary: any
) {
  summary[name] = [];
  properties.forEach(p => extractTypesFromProperty(name, p, summary));
  methods.forEach(m => extractTypesFromMethod(name, m, summary));
  return templates.interface(name, properties, methods);
}

export function emitSingleEnum(
  name: string,
  properties: PropertyDetails[],
  methods: MethodDetails[],
  summary: any
) {
  summary[name] = [];
  properties.forEach(p => extractTypesFromProperty(name, p, summary));
  return templates.enum(name, properties, methods);
}

export function emitHeritageClauses(heritageClauses: HeritageClause[]) {
  return heritageClauses.map(heritageClause =>
    templates.implementsOrExtends(
      heritageClause.clause,
      heritageClause.className
    )
  );
}

export function emitSimpleAssociations(source: string, associated: string) {
  return templates.simpleAssociate(source, associated);
}

function extractTypesFromProperty(
  key: string,
  property: PropertyDetails,
  summary: any
) {
  if (property.propertyType) summary[key].push(property.propertyType);
}

function extractTypesFromMethod(
  key: string,
  method: MethodDetails,
  summary: any
) {
  if (method.returnType && method.returnType !== "void")
    summary[key].push(method.returnType);
  if (method.parameters) {
    summary[key].push(method.parameters);
  }
}
