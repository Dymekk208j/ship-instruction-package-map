export interface Part {
  pkg: number;
  num: string;
  name: string;
  img: string;
}

export interface StepMapping {
  [step: number]: number[];
}
