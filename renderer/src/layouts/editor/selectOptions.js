export function selectOption(title, options) {
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
				name='payment'>
				{options.map((o) => (
					<option
						style={{
							backgroundColor: '#363739',
						}}>
						{o}
					</option>
				))}
			</select>
		</div>
	);
}
