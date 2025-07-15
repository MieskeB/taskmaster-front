import {Team} from "./Team";
import {Challenge} from "./Challenge";

export interface Submission {
    id: number;
    fileName: string;
    uploadedAt: Date;
    challenge: Challenge;
    team: Team;
}