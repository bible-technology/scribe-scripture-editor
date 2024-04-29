import { useState, useEffect, useContext } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProjectContext } from '@/components/context/ProjectContext';
import { Button, Modal } from '@mui/material';
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker';

export function RessourcePicker({ setJsonSpec, fieldInfo, ressourceKey,open }) {
	const [selected, setSelected] = useState('');
	const [infoDisplay, setInfoDiplay] = useState('');
	useEffect(() => {
		setJsonSpec((prev) => {
			let j = JSON.parse(prev);

			j[fieldInfo.id] = selected;
			return JSON.stringify(j);
		});
	}, [selected]);

	const {
		states: { listResourcesForPdf },
		actions: { setListResourcesForPdf },
	} = useContext(ProjectContext);

	const [searchText, setSearchText] = useState('');
	const [openModal, setOpenModal] = useState(false);

	const handleInputSearch = (e) => {
		setSearchText(e.target.value);
	};
	const [localListResourcesForPdf, setLocalListResourcesForPdf] = useState(
		Object.keys(listResourcesForPdf).reduce(
			(a, v) => ({ ...a, [v]: {} }),
			{},
		),
	);

	const handleOpenModal = (isOpen) => {
		setOpenModal(isOpen);
		setSearchText('');
	};

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

	return (
		<div
			style={open?{
				display: 'flex',
				flexDirection: 'column',
				paddingLeft: 22,
				paddingRight: 22,
				justifyContent: 'center',
				paddingTop: 10,
				alignItems: 'center',
				justifyContent: 'space-between',
				
			}:{display:'none'}}>
			<div style={{ display: 'flex', flexDirection: 'row',alignItems: 'center',
				justifyContent: 'space-between',width:"100%" }}>
				<div>{ressourceKey} </div>
				<Button
					style={{
						borderRadius: 4,
						backgroundColor: '#F50',
						borderStyle: 'solid',
						borderColor: '#F50',
						color: 'white',
					}}
					onClick={() => handleOpenModal(true)}>
					{infoDisplay === ""? "Choose" : "Choose an other source"}
				</Button>
			</div>
			<div>{infoDisplay}</div>

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
									setSelected(e.src.path);
									setInfoDiplay(e.description);
									handleOpenModal(false);
								}}
								source={{ Ressources : localListResourcesForPdf[keyToRessource(ressourceKey)]?  
									localListResourcesForPdf[keyToRessource(ressourceKey)]:{}}}
							/>
						) : (
							<LoadingSpinner />
						)}
					</div>
				</div>
			</Modal>
		</div>
	);
}


function keyToRessource(elem){
	if("translationText"=== elem){
		return "book"
	}
	if(elem==="html"){
		return "html"
	}
	if(elem==="md"){
		return "md"
	}
	if(elem==="obs"){
		return "OBS"
	}
	if(elem==="obsNotes"){
		return "OBS-TN"
	}
	if(elem ==="juxta"){
		return "jxl"
	}

	if(elem==="tNotes"){
		return "tNotes"
	}
	return elem
}