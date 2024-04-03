import { useState } from "react";
import { BooleanPicker } from "./booleanPicker";
import { SelectPicker } from "./SelectPicker";
import { InputPicker } from "./InputPicker";
import { ScripturePicker } from "./ScripturePicker";
import { ListPicker } from "./ListPicker";
export function FieldPicker({ fieldInfo, setJsonSpec, lang }) {
  let require = fieldInfo.nValues[0] > 0;
  if (fieldInfo.typeEnum) {
    if (1 === fieldInfo.nValues[1]) {
      return (
        <SelectPicker
          setJsonSpec={setJsonSpec}
          fieldInfo={fieldInfo}
          require={require}
          lang={lang}
        />
      );
    } else {
      return (
        <ListPicker
          setJsonSpec={setJsonSpec}
          fieldInfo={fieldInfo}
          require={require}
          lang={lang}
        />
      );
    }
  } else if (fieldInfo.typeName && fieldInfo.typeName === "boolean") {
    return (
      <BooleanPicker
        setJsonSpec={setJsonSpec}
        fieldInfo={fieldInfo}
        require={require}
        lang={lang}
      />
    );
  } else if (fieldInfo.typeName && fieldInfo.typeName === "string") {
    return (
      <InputPicker
        setJsonSpec={setJsonSpec}
        fieldInfo={fieldInfo}
        require={require}
        lang={lang}
      />
    );
  } else if (fieldInfo.id === "scripture") {
    return (
      <ScripturePicker
        setJsonSpec={setJsonSpec}
        fieldInfo={fieldInfo}
        lang={lang}
      ></ScripturePicker>
    );
  } else {
    return <div>{fieldInfo.id} : picker not found</div>;
  }
}
