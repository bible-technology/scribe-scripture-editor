import { useState, useEffect } from "react";
import { FieldPicker } from "./FieldPicker";
import { Button } from "@mui/material";
export function ScripturePicker({ require, fieldInfo, setJsonSpec,lang }) {
  const [scriptureJson, setScriptureJson] = useState("{}");
  const [numberOfScripture, setNumberOfScripture] = useState(1);
  useEffect(() => {
    setJsonSpec((prev) => {
      const newState = JSON.parse(prev);
      console.log(JSON.parse(scriptureJson))
      newState[fieldInfo.id] = JSON.parse(scriptureJson)
      console.log(newState)
      return JSON.stringify(newState);
      
    });
  }, [scriptureJson]);

  useEffect(() => {
    setScriptureJson((prev) => {
      const newState = JSON.parse(prev);
      fieldInfo.typeSpec.map((t) => {
        delete newState[t.id.replace("#", numberOfScripture + 1)];
      });
      return JSON.stringify(newState);
    });
  }, [numberOfScripture]);

  return (
    <div style={{ margin: '10%', borderLeftStyle: "solid", borderLeftWidth: 1 }}>
      <div
        style={{ display: "flex", margin: 20, justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            setNumberOfScripture((prev) => {
            
              if (prev > fieldInfo.nValues[0]) {
                return prev - 1;
              } else {
                return prev;
              }
            });
          }}
          variant="outlined"
        >
          -
        </Button>
        <Button
          onClick={() => {
            setNumberOfScripture((prev) => {
              if (prev < fieldInfo.nValues[1]) {
                return prev + 1;
              } else {
                return prev;
              }
            });
          }}
          variant="outlined"
        >
          +
        </Button>
      </div>

      {Array(numberOfScripture)
        .fill(0)
        .map((x, i) => (
          <div
            style={{
              margin: 20,
              borderBottomStyle: "solid",
              borderBottomWidth: 1,
            }}
          >
            {fieldInfo.typeSpec.map((f) => {
              return (
                  <FieldPicker
                    fieldInfo={changeIndexOfScripture(f, i + 1)}
                    setJsonSpec={setScriptureJson}
                    lang={lang}
                 />
              );
            })}
          </div>
        ))}
    </div>
  );
}

function changeIndexOfScripture(fieldInfo, index) {
  const { id, label, ...rest } = fieldInfo; // Destructure id and other properties
  const splitTab = id.split("#");
  const newId = splitTab[0] + index + splitTab[1];
  const updatedLabel = {};
  for (const lang in label) {
    updatedLabel[lang] = label[lang].replace(/#/g, index); // Using a regular expression with the 'g' flag to replace all occurrences
  }
  return { id: newId, label: updatedLabel, ...rest }; // Return a new object with modified id, label, and other properties
}
