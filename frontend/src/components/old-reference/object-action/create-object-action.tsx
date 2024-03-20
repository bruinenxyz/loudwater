import { useObjectDefinition } from "@/data/use-object-definition";
import { ObjectDefinition, ObjectProperty } from "@/definitions";
import { InputGroup, TextArea, Label, FormGroup } from "@blueprintjs/core";
import React from "react";
import * as _ from "lodash";
import { useObject } from "@/data/use-object";

interface CreateObjectActionProps {
  objectDefinitionId: string;
  id: string;
}

const CreateObjectAction: React.FC<CreateObjectActionProps> = (props) => {
  // Add your component logic here
  const { data: objectDefinition } = useObjectDefinition(
    props.objectDefinitionId,
  );

  const { data: currentObject } = useObject(props.id);

  const [stagedObject, setStagedObject] = React.useState(currentObject);
  const handleValueChange = (property: ObjectProperty, value: any) => {
    setStagedObject({
      ...stagedObject,
      [property.api_name]: value,
    });
  };

  const getInputForProperty = (property: ObjectProperty) => {
    switch (property.type) {
      case "string":
        return (
          <FormGroup
            helperText={property.description}
            label={property.name}
            labelFor="text-input"
          >
            <InputGroup
              value={stagedObject[property.api_name]}
              onChange={(e) => handleValueChange(property, e.target.value)}
            />
          </FormGroup>
        );
      case "date":
        return <input type="date" />;
      case "datetime":
        return <input type="datetime" />;
      case "number":
        return <input type="number" />;
      case "boolean":
        return <input type="checkbox" />;
      default:
        return null;
    }
  };

  const getProperties = () => {
    _.map(objectDefinition?.properties, (property) => {});
  };
  return (
    // Add your JSX code here
    <div>{/* Add your component content here */}</div>
  );
};

export default CreateObjectAction;
