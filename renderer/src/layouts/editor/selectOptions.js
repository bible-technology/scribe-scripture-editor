import i18n from "src/translations/i18n";

export function selectOption(title,type,option,handleChange) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				paddingLeft: 22,
				paddingRight: 22,
				justifyContent: 'center',
				paddingTop: 10,
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<div
				style={{
					color: 'white',
					display: 'flex',
					paddingRight: 32,
					justifyContent: 'center',
				}}>
				{title}
			</div>
			<select
				className='selectPDFprintRender'
				id='payment'
				name='payment'
				onChange={(e) => {handleChange(type,e.target.value)}}>
				{Object.keys(option).map((o) => (
					<option
						id={o}
						value={o}
						style={{
							backgroundColor: '#363739',
						}}>
						{option[o].label[i18n.language] ?  option[o].label[i18n.language] : option[o].label["en"]}
					</option>
				))}
			</select>
		</div>
	);
}
