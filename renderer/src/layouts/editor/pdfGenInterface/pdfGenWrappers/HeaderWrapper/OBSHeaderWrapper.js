import { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { TextField } from '@mui/material';
import ImageIcon from '../../../../../../public/icons/basil/Solid/Files/Image.svg';
import React from 'react';
import { LoopSwitch ,TextOnlyTooltip} from '../fieldPicker/customMuiComponent';

export function OBSWrapperSortableList({
	keyWrapper,
	advanceMode,
	changePrintData,
	setLoopMode
}) {
	const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(
		props,
		ref,
	) {
		const { onChange, ...other } = props;

		return (
			<NumericFormat
				{...other}
				getInputRef={ref}
				onChange={(values) => {
					onChange({
						target: {
							name: props.name,
							value: values.value,
						},
					});
				}}
			/>
		);
	});

	const [startObs, setStartObs] = useState('');
	const [endObs, setEndObs] = useState('');


	const handleBlurStart = (event) => {
		const newValue = event.target.value.trim(); // Trim any whitespace
		setStartObs(newValue);
	};
	const handleBlurEnd = (event) => {
		const newValue = event.target.value.trim(); // Trim any whitespace
		setEndObs(newValue);
	};

	useEffect(() => {
		changePrintData((prev) => {
			const copyData = { ...prev };
			if (startObs !== '' && endObs !== '') {
				if (parseInt(startObs) <= parseInt(endObs)) {
					copyData[keyWrapper][
						'storyRange'
					] = `${startObs}-${endObs}`;
				}
			}
			return copyData;
		});
	}, [startObs, endObs]);

	return (
		<div>
			{advanceMode ? (
				<div
					style={{
						justifyContent: 'space-between',
						display: 'flex',
					}}>
					<TextField
						label={'obs start'}
						value={startObs}
						onBlur={handleBlurStart}
						id='formatted-numberformat-input'
						InputProps={{
							inputComponent: NumericFormatCustom,
						}}
						variant='standard'
					/>
					<TextField
						label={'obs end'}
						value={endObs}
						onBlur={handleBlurEnd}
						id='formatted-numberformat-input'
						InputProps={{
							inputComponent: NumericFormatCustom,
						}}
						variant='standard'
					/>
				</div>
			) : (
				<></>
			)}
			<div style={{ display: 'flex', justifyContent: 'end' }}>
				{advanceMode ? (
					<div>
						<TextOnlyTooltip
							placement='top-end'
							title={
								<div>
									<div
										style={{
											fontSize: 14,
											fontStyle: 'normal',
											fontWeight: 600,
										}}>
										For each Obs selected above
									</div>
									<div
										style={{
											fontSize: 14,
											fontStyle: 'normal',
											fontWeight: 400,
										}}>
										Ressources in the loop will be added to
										the export, form
									</div>
								</div>
							}
							arrow>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									color: 'black',
								}}>
								Loop mode
							</div>
							<LoopSwitch
								onChange={() => setLoopMode((prev) => !prev)}
							/>
						</TextOnlyTooltip>
					</div>
				) : (
					<></>
				)}

				<div
					style={{
						margin: 'auto',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center', // Added alignment to center vertically
						fontSize: 24,
						color: 'black',
					}}>
					<div style={{ width: 35, height: 35, marginRight: 8 }}>
						<ImageIcon />
					</div>
					Obs
				</div>
			</div>
		</div>
	);
}
