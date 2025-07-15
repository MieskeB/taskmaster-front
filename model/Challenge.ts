import {Submission} from "./Submission";

export interface Challenge {
    id: number;
    title: string;
    description: string;
    startDate: Date;
    submissions: Submission[];
}