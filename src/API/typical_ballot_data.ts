export class LanguageText {
    languageID: string;
    text: string;
}

export enum BallotMarkerType {
    Wizard = 0,
    List = 1,
    Grid = 2
}

export class Ballot {
    id: string;
    electionName: LanguageText[];
    title: LanguageText[];
    subTitle: LanguageText[];
    text1: LanguageText[];
    text2: LanguageText[];
    markingInstructions: LanguageText[];
    printableInstructions: LanguageText[];
    partyId: string;
    partyName: LanguageText[];
    precinctName: string;
    ballotMarkerLayoutType: BallotMarkerType;

    //wizard types
    ballotItems: BallotItem[];

    //List and grid types
    ballotPages: BallotPage[];

}
export class BallotPage {
    gridRows: GridRow[];
    ballotItems: BallotItem[];
}
export class GridRow {
    id: string;
    order: number;
    label: LanguageText[];
}


export class BallotItem {
    id: string;
    order: number;
    type: BallotItemType;
    title: LanguageText[];
    subTitle: LanguageText[];
    instructions: LanguageText[];
    referendum: LanguageText[];
    text1: LanguageText[];
    text2: LanguageText[];
    partyId: string;
    partyName: LanguageText[];
    writeInText: LanguageText[];
    voteForMax: number;
    writeIns: number;

    ballotOptions: BallotOption[];

    selectionsRemaining: number;

    // behavior
    undervoteWarningEnabled: boolean;
    overvoteWarningEnabled: boolean;
}

export enum BallotItemType {
    Office = 1,
    Question = 2,
    Office_RankedChoice = 10
}

export class BallotOption {

    id: string;
    order: number;
    type: BallotOptionType;
    title: LanguageText[];
    subTitle: LanguageText[];
    text1: LanguageText[];
    text2: LanguageText[];
    partyId: string;
    partyName: LanguageText[];
    selected: boolean = false;
    writeInSelection: string;
    rank: number;
}
export enum BallotOptionType {
    Typical = 1,
    WriteIn = 2,
    Typical_RightSideMark = 10,
    WriteIn_RightSideMark = 11,
    RankedChoice = 20,
    GroupHeader = 50,
    NoCandidate = 99,
    Empty = 100
}