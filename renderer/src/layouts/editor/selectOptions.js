import i18n from 'src/translations/i18n';

export function selectOption(title, type, option, handleChange) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				paddingLeft: 22,
				paddingRight: 22,
				justifyContent: 'center',
				marginBottom: 12,
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<div
				style={{
					fontFamily: 'Lato',
					fontWeight: 400,
					color: 'black',
					display: 'flex',
					paddingRight: 32,
					fontSize: 22,
					justifyContent: 'center',
				}}>
				{title}
			</div>
			<select
			className='selectScribeTheme'
				style={{ borderRadius: 5 }}
				id='payment'
				name='payment'
				onChange={(e) => {
					handleChange(type, e.target.value);
				}}>
				<option value='' disabled selected hidden>
					Please Choose...
				</option>

				{Object.keys(option).map((o) => (
					<option
						id={o}
						value={o}
						style={{
							backgroundColor: '#FFFFFF',
						}}>
						{option[o].label[i18n.language]
							? option[o].label[i18n.language]
							: option[o].label['en']}
					</option>
				))}
			</select>
		</div>
	);
}
