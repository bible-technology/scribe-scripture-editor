import * as React from 'react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FieldPicker } from './FieldPicker';
import { InputPicker } from './InputPicker';
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { RessourcePicker } from './RessourcePicker';
import { SelectPicker } from './SelectPicker';
import { Button } from '@mui/material';

export function ListPicker({
    fieldInfo,
    require,
    setJsonSpec,
    lang,
    open,
}) {
    const [items, setItems] = useState([]);

    // useEffect(() => {
    //     // Initialize the state with the minimum number of items allowed
    //     const initialItems = Array.from({ length: fieldInfo.nValues[0] }, () => {
    //         return fieldInfo.typeSpec.reduce((acc, spec) => {
    //             acc[spec.id] = spec.typeEnum ? '' : ''; // Default values
    //             return acc;
    //         }, {});
    //     });
    //     setItems(initialItems);
    // }, []);

    // useEffect(() => {
    //   console.log("useEffect of ListPicker : scriptureJson");
    //   setJsonSpec((prev) => {
    //     const newState = typeof prev == "object" ? prev : JSON.parse(prev);
    //     newState[fieldInfo.id] = items;
    //     return JSON.stringify(newState);
    //   });
    // }, [items]);

    const handleItemChange = (index, fieldId, value) => {
      console.log("handleItemChange call!");
      const newItems = [...items];
      newItems[index][fieldId] = value;
      // setScriptureJson(newItems[index]);
      // setJsonSpec((prev) => {
      //   const newState = typeof prev == "object" ? prev : JSON.parse(prev);
      //   newState[fieldInfo.id] = items;
      //   return JSON.stringify(newState);
      // });
      // setItems(newItems);
    };

    const addItem = () => {
      if (items.length < fieldInfo.nValues[1]) {
        const newItem = fieldInfo.typeSpec.reduce((acc, spec) => {
            acc[spec.id] = spec.typeEnum ? '' : '';
            return acc;
          }, {});
        // newItem
        setItems([...items, newItem]);
      }
    };

    const removeItem = (index) => {
      if (items.length > fieldInfo.nValues[0]) {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
      }
    };

    return (
        <div style={open ? { display: 'block' } : { display: 'none' }}>
            <div style={{ marginBottom: '16px' }}>{fieldInfo.label[lang]}</div>
            {items.map((item, index) => (
                <div key={uuidv4()} style={{ marginBottom: '16px', padding: '8px', border: '1px solid #ccc' }}>
                    {fieldInfo.typeSpec.map((spec) => {
                      console.log(spec);
                      spec.label[lang] = spec.label[lang].replace("#", index+1);
                      if (spec.id === 'src') {
                        return (
                          <RessourcePicker
                            setJsonSpec={setJsonSpec}
                            fieldInfo={spec}
                            ressourceKey={spec.typeName}
                            ressourceName={spec.label.en}
                            require={require}
                            open={open}
                          />
                        );
                      } else if (spec.typeName && spec.typeName === 'string') {
                        // const [jsonInput, setJsonInput] = useState({});
                        return (
                          <InputPicker
                            setJsonSpec={setJsonInput}
                            fieldInfo={spec}
                            require={require}
                            lang={lang}
                            open={open}
                          />
                        );
                        // return (
                        //   <div style={open ? {} : { display: 'none' }}>
                        //     <Box
                        //       component="form"
                        //       sx={{
                        //         "& .MuiTextField-root": { m: 1, width: "100%" },
                        //       }}
                        //       noValidate
                        //       autoComplete="off"
                        //     >
                        //       <TextField
                        //         error={require && input === ""}
                        //         id="filled-search"
                        //         label={fieldInfo.label[lang]}
                        //         type="search"
                        //         variant="filled"
                        //         value={input}
                        //         onChange={(newVal) => handleItemChange(index, spec.id, newVal)}
                        //         helperText={require && input === "" ? "*Required" : ""}
                        //       />
                        //     </Box>
                        //   </div>
                        // );
                      } else if (spec.typeEnum) {
                        return (
                          <SelectPicker
                            setJsonSpec={setJsonSpec}
                            fieldInfo={spec}
                            require={require}
                            lang={lang}
                            open={open}
                          />
                        );
                      }
                      // return (
                      //   <FieldPicker
                      //     fieldInfo={spec}
                      //     setJsonSpec={setJsonSpec}
                      //     lang={lang}
                      //     open={true}
                      //   />
                      // );
                      // return (<div key={spec.id} style={{ marginBottom: '8px' }}>
                      //     <FieldPicker
                      //       fieldInfo={spec}
                      //       lang={lang}
                      //       setJsonSpec={setJsonSpec}
                      //       open={open}
                      //     />
                      //   </div>);
                    })}
                    {/* {fieldInfo.typeSpec.map((spec) => (
                      <div key={spec.id} style={{ marginBottom: '8px' }}>
                        <FieldPicker
                          fieldInfo={spec}
                          setJsonSpec={(newSpec) => handleItemChange(index, spec.id, newSpec[spec.id])}
                          lang={lang}
                        />
                      </div>
                    ))} */}
                    {items.length > fieldInfo.nValues[0] && (
                        <Button
                          style={{
                            borderRadius: 4,
                            backgroundColor: '#F50',
                            borderStyle: 'solid',
                            borderColor: '#F50',
                            color: 'white',
                          }}
                          onClick={() => removeItem(index)}>
                          {"Remove"}
                        </Button>
                    )}
                </div>
            ))}
            {items.length < fieldInfo.nValues[1] && (
                <Button
                  style={{
                    borderRadius: 4,
                    backgroundColor: '#F50',
                    borderStyle: 'solid',
                    borderColor: '#F50',
                    color: 'white',
                  }}
                  onClick={addItem}>
                  {"Add Item"}
                </Button>
            )}
            {require && items.length === 0 && (
                <div style={{ color: 'red', fontSize: '12px', padding: '5px' }}>
                    This field is required
                </div>
            )}
        </div>
    );
}
