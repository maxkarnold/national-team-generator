import { OutfieldAttributes } from './outfieldAttributes';
import { GkAttributes } from './gkAttributes';

export interface Player {
    firstName: string;
    lastName: string;
    position: string;
    altPositions: string[];
    competentPositions: string[];
    unconvincingPositions: string[];
    rating: number;
    foot: string;
    firstInitial?: string;
    nationality: string;
    nationalityLogo: string;
    age: number;
    club: string; 
    clubLogo: string;
    playerFace: string;
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
    chemistryNum: number;
    // *** Above are properties we've already added ***
    // *** Below are properties we've yet to add ***
    firstNameUsage?: string;
    lastNameUsage?: string;
    middleName?: string;
    nickname?: string;
    
    altNationality?: string;
    relationships?: any[];
    // Relationships should be an array of players, it will show that the two are linked. Not sure if this should be an array or an object yet.
    hiddenAttributes?: any;
    // This is the same as attributes, except that it will be hidden to the user to allow for greater realism. This will include things like loyalty, ambition, temperament, ambition, adaptability, etc.
    mediaDescription?: string;
    playerTraits?: string[];
}