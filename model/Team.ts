import {Submission} from "./Submission";

export interface Team {
    id: number;
    teamName: string;
    submissions: Submission[];
}