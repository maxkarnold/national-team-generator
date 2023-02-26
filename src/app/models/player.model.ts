import { OutfieldAttributes, GkAttributes } from './player-attributes.model';

export interface Person {
  firstNames: string[];
  lastNames: string[];
  firstInitial: string;
  singleLastName: string;
  firstNameUsage: string;
  lastNameUsage: string;
  nationality: string;
  age: number;
  origin?: string;
  playerFace?: string;
  rating?: number;
  nickname?: string;
}

export interface Player extends Person {
  mainPositions: string[];
  altPositions: string[];
  competentPositions: string[];
  unconvincingPositions: string[];
  foot: string;
  nationalityLogo: string;
  club: string;
  clubLogo: string;
  playerFace?: string;
  preferredRole: string;
  preferredDuty: string;
  // Attributes will be all the numeric attributes for a player.
  // This will be generated based on the overall rating, position, foot, and other factors.
  // This will most likely be an object with many numeric values.
  attributes: OutfieldAttributes | GkAttributes;
  outfieldAttributes?: OutfieldAttributes;
  gkAttributes?: GkAttributes;
  displayHeight?: string;
  height: number;
  weight: number;
  weakFoot: number;
  displayWeakFoot?: string;

  // Properties only for the drag/drop pitch UI
  displayName?: string;
  pitchPosition?: string;
  pitchPositionIndex?: number;
  pitchRating?: number;
  chemistryNum?: number;
  // *** Above are properties we've already added ***
  // *** Below are properties we've yet to add ***

  middleName?: string;
  nickname?: string;

  altNationality?: string;
  relationships?: unknown[];
  // Relationships should be an array of players, it will show that the two are linked. Not sure if this should be an array or an object yet.
  hiddenAttributes?: unknown;
  // This is the same as attributes, except that it will be hidden to the user to allow for greater realism. This will include things like loyalty, ambition, temperament, ambition, adaptability, etc.
  mediaDescription?: string;
  playerTraits?: string[];
}
