import React, {
	useRef,
	useState,
	useContext,
	Fragment,
	useEffect,
} from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ResourcesSidebar from '@/components/Resources/ResourcesSideBar';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import ResourceTabPane from '@/components/Resources/ResourceTabPane';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { ListResources } from '@/components/Resources/ListResources';
import { ProjectContext } from '@/components/context/ProjectContext';
import { SnackBar } from '@/components/SnackBar';
import localForage from 'localforage';
import InnerFramePopup from '@/layouts/editor/InnerFramePopup';
import packageInfo from '../../../../package.json';
import readLocalResources from '@/components/Resources/useReadLocalResources';
// import * as logger from '../../logger';
export default function FramePdfPopup({ openPdfPopup, setOpenPdfPopup }) {
	const cancelButtonRef = useRef(null);
	const [openSnackBar, setOpenSnackBar] = useState(false);
	const [snackText, setSnackText] = useState('');
	const [error, setError] = useState('');
	const [currentTab, setCurrentTab] = useState(0);
	const removeSection = () => {
		setOpenPdfPopup(false);
	};
	const {
		states: { listResourcesForPdf },
		actions: { setListResourcesForPdf },
	} = useContext(ProjectContext);

	/**
	 *
	 * @param {object[]} burritoArray a burrito resource array
	 * 		* projectDir
	 * 		* value
	 * 		* type
	 */
	const fromBurritoArrayToList = (burritoArray) => {
		// burritoArray.forEach((bur) => {
		// });
		// return {
		// 	description: `${fileName} from project ${projectS}`,
		// 	language: jsonParse.meta.defaultLocale,
		// 	src: {
		// 		type: 'fs',
		// 		path: `${folder}/${project}/${pathKey}`,
		// 	},
		// 	books: val.scope ? Object.keys(val.scope) : [],
		// };
	};

	// const pushEachIngredients = (
	// 	picker,
	// 	jsonParse,
	// 	resourceType,
	// 	projectName,
	// 	pathFolder,
	// ) => {
	// 	let fileName, tmpScope, tmpRangeScope;

	useEffect(() => {
		// we take all the exiting keys from the already existing 'listResourcesForPdf'
		let pickerJson = Object.keys(listResourcesForPdf).reduce(
			(a, v) => ({ ...a, [v]: {} }),
			{},
		);
		localForage
			.getItem('userProfile')
			.then(async (user) => {
				const path = require('path');
				const newpath = localStorage.getItem('userPath');
				const currentUser = user?.username;
				const folderProject = path.join(
					newpath,
					packageInfo.name,
					'users',
					`${currentUser}`,
					'projects',
				);
				const folderRessources = path.join(
					newpath,
					packageInfo.name,
					'users',
					`${currentUser}`,
					'resources',
				);
				creatSection(folderProject, pickerJson);
				creatSection(folderRessources, pickerJson);
				return currentUser;
			})
			.then((currentUser) => {
				setListResourcesForPdf(pickerJson);
				return currentUser;
			})
			// after reading project resources
			// we read true resources from common and from the user
			.then((currentUser) =>
				readLocalResources(currentUser, fromBurritoArrayToList),
			);
	}, [openPdfPopup]);

	return (
		<>
			<Transition
				show={openPdfPopup}
				as={Fragment}
				enter='transition duration-100 ease-out'
				enterFrom='transform scale-95 opacity-0'
				enterTo='transform scale-100 opacity-100'
				leave='transition duration-75 ease-out'
				leaveFrom='transform scale-100 opacity-100'
				leaveTo='transform scale-95 opacity-0'>
				<Dialog
					as='div'
					className='fixed inset-0 z-10 overflow-y-auto modal-container'
					initialFocus={cancelButtonRef}
					static
					open={openPdfPopup}
					onClose={removeSection}>
					<Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />
					<div className='flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto'>
						<div
							style={{ backgroundColor: '#292A2D' }}
							className='bg-black relative flex justify-between px-3 items-center rounded-t-lg '>
							{/* <h1 className="text-white font-bold text-sm">{t('TODO')}</h1> */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignContent: 'center',
									margin: 'auto',
									flexDirection: 'column',
								}}>
								<div
									style={{
										textAlign: 'center',
										width: '100%',
										fontSize: 24,
										padding: 12,
									}}
									className='text-white font-bold text-sm'>
									Export
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
									}}>
									<div
										onClick={() => setCurrentTab(0)}
										style={
											currentTab === 0
												? tabStyleSelected
												: tabStyleNotSelected
										}>
										PDF
									</div>
									{/* <div
										onClick={() => setCurrentTab(1)}
										style={
											currentTab === 1
												? tabStyleSelected
												: tabStyleNotSelected
										}>
										Korennummi
									</div>
									<div
										onClick={() => setCurrentTab(2)}
										style={
											currentTab === 2
												? tabStyleSelected
												: tabStyleNotSelected
										}>
										Word
									</div> */}
								</div>
							</div>
						</div>

						<div
							style={{ backgroundColor: '#292A2D' }}
							className='flex'>
							<div
								style={{
									backgroundColor: '#292A2D',
									borderColor: '#292A2D',
								}}
								className='h-[85vh] w-full  bg-gray-50 items-center p-3 justify-between'>
								<div
									style={{ backgroundColor: '#292A2D' }}
									className='bg-gray-50 items-center p-3 justify-between w-full h-full'>
									{currentTab === 0 ? (
										<InnerFramePopup />
									) : (
										<div>no Tab</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</Dialog>
			</Transition>
			<SnackBar
				openSnackBar={openSnackBar}
				setOpenSnackBar={setOpenSnackBar}
				snackText={snackText}
				setSnackText={setSnackText}
				error={error}
			/>
		</>
	);
}

const tabStyleNotSelected = {
	fontSize: 24,
	marginLeft: 74,
	marginRight: 74,
	color: 'white',
	borderRadius: 28,
	paddingLeft: 12,
	paddingRight: 12,
	borderStyle: 'solid',
	borderWidth: 3,
	paddingTop: 3,
	paddingBottom: 3,
};

const tabStyleSelected = {
	fontSize: 24,
	marginLeft: 74,
	marginRight: 74,
	borderRadius: 28,
	paddingLeft: 12,
	paddingRight: 12,
	backgroundColor: 'white',
	borderWidth: 3,
	borderStyle: 'solid',
	alignContent: 'center',
	paddingTop: 3,
	paddingBottom: 3,
	justifyContent: 'center',
	display: 'flex',
};

function creatSection(folder, pickerJson) {
	const path = require('path');
	const newpath = localStorage.getItem('userPath');
	const fs = window.require('fs');

	const projects = fs.readdirSync(folder);

	let currentMetadataPath = '';
	for (let project of projects) {
		currentMetadataPath = path.join(
			folder,
			'/',
			project,
			'/',
			'metadata.json',
		);
		if (fs.existsSync(currentMetadataPath)) {
			let jsontest = fs.readFileSync(currentMetadataPath, 'utf-8');
			let jsonParse = JSON.parse(jsontest);
			let projectS;
			let jsonParseIngre;

			if (jsonParse.identification?.name.en) {
				jsonParseIngre = jsonParse.ingredients;
				projectS = '[' + jsonParse.identification.name.en + ']';
			} else {
				jsonParseIngre = jsonParse.meta.ingredients;
				projectS = '[' + jsonParse.meta.full_name + ']';
			}

			let fileName, tmpScope, tmpRangeScope;

			for (let [pathKey, val] of Object.entries(jsonParseIngre)) {
				fileName = pathKey.split('/')[1];
				tmpRangeScope = '';
				tmpScope = val.scope
					? Object.entries(val.scope)
							.map((key) => {
								tmpRangeScope = key[0];
								if (key[1] && key[1][0])
									tmpRangeScope += ':' + key[1];
								return tmpRangeScope;
							})
							.join(', ')
					: '';

				if (
					fileName !== 'scribe-settings.json' &&
					fileName !== 'license.md' &&
					fileName !== 'versification.json' &&
					fileName !== 'LICENSE.md' &&
					fileName !== 'manifest.yaml' &&
					fileName !== 'media.yaml'
				) {
					if (
						jsonParse?.type?.flavorType?.flavor?.name ===
						'textTranslation'
					) {
						pickerJson.book[projectS + ' ' + tmpScope] = {
							description: `${fileName} from project ${projectS}`,
							language: jsonParse.meta.defaultLocale,
							src: {
								type: 'fs',
								path: `${folder}/${project}/${pathKey}`,
							},
							books: val.scope ? Object.keys(val.scope) : [],
						};
					} else if (
						jsonParse?.meta?.flavor === 'x-OBSTranslationNotes'
					) {
						fileName = jsonParseIngre[pathKey].path.split('/')[1];
						pickerJson['OBS-TN'][projectS + ' ' + tmpScope] = {
							description: `${fileName} from project ${projectS}`,
							language: jsonParse.meta.defaultLocale,
							src: {
								type: 'fs',
								path: `${folder}/${project}/${fileName}`,
							},
							books: val.scope ? Object.keys(val.scope) : [],
						};
					} else if (
						jsonParse?.type?.flavorType?.flavor?.name ===
						'textStories'
					) {
						fileName = 'content';
						pickerJson.OBS[
							`OBS ${jsonParse.resourceMeta.full_name}`
						] = {
							description: `OBS ${jsonParse.resourceMeta.full_name}`,
							language: jsonParse.meta.defaultLocale,
							src: {
								type: 'fs',
								path: `${folder}/${project}/${fileName}`,
							},
							books: [],
						};
						break;
					}
				}
			}
		}
	}
}
