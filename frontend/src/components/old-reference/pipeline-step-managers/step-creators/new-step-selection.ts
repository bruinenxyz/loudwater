import { StepIdentifier } from "@/definitions/pipeline";

type NewStepSelection = {
  stepType: StepIdentifier;
  index: number;
};

export default NewStepSelection;
