import * as React from "react";

import MenuItem from "@mui/material/MenuItem";
import { Checkbox } from "@mui/material";
import { useEffect } from "react";
export function ListPicker({ fieldInfo, require, setJsonSpec, lang }) {
  const [list, setList] = React.useState([]);

  useEffect(() => {
    setJsonSpec((prev) => {
      const newState = JSON.parse(prev);
      newState[fieldInfo.id] = list;
      return JSON.stringify(newState);
    });
  }, [list.length]);

  return (
    <div>
      {fieldInfo.typeEnum.map((option) => (
        <div style={{ display: "flex" }}>
          <Checkbox
            key={option.id}
            value={option.id}
            onChange={() =>
              setList((prev) => {
                let t = [...prev];
                if (t.indexOf(option.id) > -1) {
                  t.splice(t.indexOf(option.id), 1);
                } else {
                  t.push(option.id);
                }
                return t;
              })
            }
          >
            {option.label[lang]}
          </Checkbox>
          <div style={{ display: "flex", alignSelf: "center" }}>
            {option.label[lang]}{" "}
          </div>
        </div>
      ))}
    </div>
  );
}
