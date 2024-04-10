import { useEffect, useContext, useState } from 'react';

import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker';
import { Button, Modal } from '@material-ui/core';
import { ProjectContext } from '@/components/context/ProjectContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function ScriptureContentSearchBar({
	openModal,
	setOpenModal,
	handleOpenModal,
	setSelected,
	setOrderSelection,
}) {
	const {
		states: { listResourcesForPdf },
		actions: { setListResourcesForPdf },
	} = useContext(ProjectContext);
	const {
		states: { language },
		actions: { setLanguage },
	} = useContext(ProjectContext);
	
	setLanguage('fr');
	console.log(language);

	const [searchText, setSearchText] = useState('');
	const [localListResourcesForPdf, setLocalListResourcesForPdf] = useState(
		Object.keys(listResourcesForPdf).reduce(
			(a, v) => ({ ...a, [v]: {} }),
			{},
		),
	);

	useEffect(() => {
		if (searchText.length > 2) {
			let contentTypes = Object.keys(listResourcesForPdf);
			let newListResources = contentTypes.reduce(
				(a, v) => ({ ...a, [v]: {} }),
				{},
			);
			let regexSearch = new RegExp(`.*${searchText}.*`, 'i');
			contentTypes.forEach((contentType) => {
				for (let [pathKey, val] of Object.entries(
					listResourcesForPdf[contentType],
				).sort()) {
					if (
						regexSearch.test(
							pathKey.replace('[', '').replace(']', ''),
						)
					) {
						newListResources[contentType][pathKey] = val;
					}
				}
			});
			setLocalListResourcesForPdf(newListResources);
		} else {
			setLocalListResourcesForPdf(listResourcesForPdf);
		}
	}, [searchText, setSearchText, openModal, setOpenModal]);

	const updateElemOrder = (items) => {
		const t = [];
		items.forEach((item) => {
			t.push(item.id);
		});
		setOrderSelection(t);
	};

	const handleInputSearch = (e) => {
		setSearchText(e.target.value);
	};

	return (
		<>
			<Modal
				open={openModal}
				onClose={() => handleOpenModal(false)}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'row',
				}}>
				<div
					style={{
						backgroundColor: 'white',
						width: '50%',
						height: '50%',
					}}>
					<div className={'picker-container'}>
						<div className={'searchContainer'}>
							<input
								className={'searchInput'}
								type='text'
								placeholder='Search'
								onInput={handleInputSearch}
							/>
						</div>
						{localListResourcesForPdf ? (
							<ScriptureContentPicker
								onSelect={(e) => {
									setSelected((prev) => [
										...prev,
										e.description,
									]);
									setOrderSelection((prev) => [
										...prev,
										e.description,
									]);
									handleOpenModal(false);
								}}
								source={localListResourcesForPdf}
							/>
						) : (
							<LoadingSpinner />
						)}
					</div>
				</div>
			</Modal>
		</>
	);
}
