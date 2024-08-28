import { useState } from 'react';
import { BooleanPicker } from './booleanPicker';
import { SelectPicker } from './SelectPicker';
import { InputPicker } from './InputPicker';
import { ScripturePicker } from './ScripturePicker';
import { ListPicker } from './ListPicker';
import { RessourcePicker } from './RessourcePicker';
import { IntPicker } from './IntPicker';
export function FieldPicker({
	fieldInfo,
	setJsonSpec,
	lang,
	open,
}) {
	let require = fieldInfo.nValues[0] > 0;
	console.log("fieldInfo ==",fieldInfo);

	if (typeof fieldInfo.typeLiteral === typeof true || fieldInfo.typeLiteral) {
		setJsonSpec((prev) => {
			const newState = JSON.parse(prev);
			newState[fieldInfo.id] = fieldInfo.typeLiteral;
			return JSON.stringify(newState);
		});

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<div>{fieldInfo.label[lang]} :</div>
				<div style={{ fontSize: 16 }}>{fieldInfo.typeLiteral}</div>
			</div>
		);
	}
	if (fieldInfo.typeEnum) {
		if (1 === fieldInfo.nValues[1]) {
			return (
				<SelectPicker
					setJsonSpec={setJsonSpec}
					fieldInfo={fieldInfo}
					require={require}
					lang={lang}
					open={open}
				/>
			);
		} else {
			return (
				<ListPicker
					setJsonSpec={setJsonSpec}
					fieldInfo={fieldInfo}
					require={require}
					lang={lang}
					open={open}
				/>
			);
		}
	} else if (fieldInfo.typeName && fieldInfo.typeName === 'boolean') {
		return (
			<BooleanPicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				require={require}
				lang={lang}
				open={open}
			/>
		);
	} else if (fieldInfo.typeName && fieldInfo.typeName === 'string') {
		return (
			<InputPicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				require={require}
				lang={lang}
				open={open}
			/>
		);
	} else if (fieldInfo.id === 'scripture') {
		return (
			<ScripturePicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				lang={lang}
				open={open}></ScripturePicker>
		);
	} else if (
		fieldInfo.typeName === 'translationText' ||
		fieldInfo.typeName === 'tNotes' ||
		fieldInfo.id === 'glossNotes' ||
		fieldInfo.id === 'lhs' ||
		fieldInfo.typeName === 'obs' ||
		fieldInfo.typeName === 'juxta' ||
		fieldInfo.typeName === 'md' ||
		fieldInfo.typeName === 'obsNotes' ||
		fieldInfo.typeName === 'html'
	) {
		if (!['scriptureSrc','obs'].includes(fieldInfo.id)) {
			return (
				<RessourcePicker
					setJsonSpec={setJsonSpec}
					fieldInfo={fieldInfo}
					ressourceKey={fieldInfo.typeName}
					ressourceName={fieldInfo.label.en}
					require={require}
					open={open}
				/>
			);
		}
	} else if (
		fieldInfo.typeName === 'integer' ||
		fieldInfo.typeName === 'number'
	) {
		return (
			<IntPicker
				setJsonSpec={setJsonSpec}
				fieldInfo={fieldInfo}
				lang={lang}
				open={open}
				require={require}
			/>
		);
	} else {
		// return (
		// 	<InputPicker
		// 		setJsonSpec={setJsonSpec}
		// 		fieldInfo={fieldInfo}
		// 		require={require}
		// 		lang={lang}
		// 		open={open}
		// 	/>
		// );
		return <div>{fieldInfo.id} : picker not found</div>;
	}
}
