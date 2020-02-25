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
