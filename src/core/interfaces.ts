export interface MethodDetails {
  name: string;
  returnType: string;
  parameters: string;
  accessType: AccessType;
  decorated: string;
}

export interface PropertyDetails {
  name: string;
  propertyType: string;
  accessType: AccessType;
  decorated: string;
}

export interface HeritageClause {
  clause: string;
  className: string;
}

export enum AccessType {
  STATIC,
  PUBLIC,
  PROTECTED,
  PRIVATE
}
