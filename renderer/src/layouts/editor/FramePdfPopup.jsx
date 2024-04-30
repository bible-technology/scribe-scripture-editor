import React, {
	useRef,
	useState,
	useContext,
	Fragment,
	useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ProjectContext } from '@/components/context/ProjectContext';
import { SnackBar } from '@/components/SnackBar';
import localForage from 'localforage';
import InnerFramePopup from '@/layouts/editor/InnerFramePopup';
import packageInfo from '../../../../package.json';
import readLocalResources from '@/components/Resources/useReadLocalResources';
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
				style={{ marginTop: 10 }}
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
					<Dialog.Overlay className='fixed inset-0 bg-black opacity-0' />
					<div
						style={{
							flexDirection: 'column',
							display: 'flex',
							marginTop: 10,
							width: '80%',
							alignContent: 'center',
							alignItems: 'center',
							marginTop: 10,
							justifyContent: 'center', // Add this line to center horizontally
							margin: 'auto',
							position: 'relative',
						}}>
						<div
							style={{
								display: 'flex',
								borderRadius: 12,
								justifyContent: 'center',
								alignContent: 'center',
								margin: 'auto',
								flexDirection: 'column',
								width: '100%',
								backgroundColor: '#292A2D',
							}}>
							<div
								style={{
									textAlign: 'center',
									width: '100%',
									fontSize: 24,
									padding: 12,
									color: 'white',
								}}
								className='text-white font-bold text-sm'>
								Export
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									backgroundColor: '#EEEEEE',
									paddingLeft: '30%',
									paddingRight: '30%',
									alignItems: 'center',
									paddingTop: 10,
									paddingBottom: 10,
								}}>
								<div
									onClick={() => setCurrentTab(0)}
									size='tiny'
									style={
										currentTab === 0
											? tabStyleSelected
											: tabStyleNotSelected
									}>
									<text
										style={
											currentTab === 0
												? fontStyle
												: {
														...fontStyle,
														color: 'black',
												  }
										}>
										PDF
									</text>
								</div>
								<div
									onClick={() => setCurrentTab(1)}
									style={
										currentTab === 1
											? tabStyleSelected
											: tabStyleNotSelected
									}>
									<text
										style={
											currentTab === 1
												? fontStyle
												: {
														...fontStyle,
														color: 'black',
												  }
										}>
										Korennumi
									</text>
								</div>
								<div
									onClick={() => setCurrentTab(2)}
									style={
										currentTab === 2
											? tabStyleSelected
											: tabStyleNotSelected
									}>
									<text
										style={
											currentTab === 2
												? fontStyle
												: {
														...fontStyle,
														color: 'black',
												  }
										}>
										Word
									</text>
								</div>
							</div>
						</div>

						<div
							style={{
								backgroundColor: '#FFFFFF',
								width: '100%',
							}}>
							<div className='h-[85vh] w-full  bg-gray-50 items-center  justify-between'>
								<div
									style={{ backgroundColor: '#EEEEEE' }}
									className='bg-gray-50 items-center  justify-between w-full h-full'>
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
	display: 'flex',
	width: 'fit-content',
	justifyContent: 'center',
	alignItems: 'center',
	borderRadius: 4,
	borderStyle: 'solid',
	fontColor: 'white',
	borderWidth: 2,
	borderColor: '#F50',
	backgroundColor: '#E3E3E3',
	padding: 5,
};

const tabStyleSelected = {
	display: 'flex',
	width: 'fit-content',
	justifyContent: 'center',
	alignItems: 'center',
	borderRadius: 4,
	borderStyle: 'solid',
	fontColor: 'white',
	borderWidth: 2,
	borderColor: '#F50',
	backgroundColor: '#F50',
	padding: 5,
};
const fontStyle = {
	color: '#FFF',
	textAlign: 'center',
	fontFamily: 'Lato',
	fontSize: 20,
	fontStyle: 'normal',
	fontWeight: 700,
	lineHeight: 'normal',
	textTransform: 'uppercase',
};

function creatSection(folder, pickerJson) {
	console.log(folder);
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
		console.log(project);
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
			if (
				jsonParse?.type?.flavorType?.flavor?.name === 'textTranslation'
			) {
				if (jsonParse.resourceMeta) {
					pickerJson.book[jsonParse.resourceMeta?.full_name] = {
						description: `${jsonParse.resourceMeta?.full_name}`,
						language: `${jsonParse.resourceMeta?.language}`,
						src: {
							type: 'fs',
							path: `${folder}/${project}`,
						},
						books: [],
					};
				} else if (jsonParse.identification) {
					pickerJson.book[
						jsonParse.identification.name[
							jsonParse.languages[0].tag
						]
					] = {
						description: `${
							jsonParse.identification.name[
								jsonParse.languages[0].tag
							]
						}`,
						language: `${jsonParse.languages[0].tag}`,
						src: {
							type: 'fs',
							path: `${folder}/${project}`,
						},
						books: [],
					};
				}
			} else if (
				jsonParse?.type?.flavorType?.flavor?.name === 'textStories'
			) {
				fileName = 'content';
				pickerJson.OBS[`OBS ${jsonParse.resourceMeta?.full_name}`] = {
					description: `OBS ${jsonParse.resourceMeta?.full_name}`,
					language: jsonParse.meta.defaultLocale,
					src: {
						type: 'fs',
						path: `${folder}/${project}/${fileName}`,
					},
					books: [],
				};
			}

			// for (let [pathKey, val] of Object.entries(jsonParseIngre)) {
			// 	fileName = pathKey.split('/')[1];
			// 	tmpRangeScope = '';
			// 	tmpScope = val.scope
			// 		? Object.entries(val.scope)
			// 				.map((key) => {
			// 					tmpRangeScope = key[0];
			// 					if (key[1] && key[1][0])
			// 						tmpRangeScope += ':' + key[1];
			// 					return tmpRangeScope;
			// 				})
			// 				.join(', ')
			// 		: '';

			// 	if (
			// 		fileName !== 'scribe-settings.json' &&
			// 		fileName !== 'license.md' &&
			// 		fileName !== 'versification.json' &&
			// 		fileName !== 'LICENSE.md' &&
			// 		fileName !== 'manifest.yaml' &&
			// 		fileName !== 'media.yaml'
			// 	) {
			// 		if (
			// 			jsonParse?.type?.flavorType?.flavor?.name ===
			// 			'textTranslation'
			// 		) {
			// 			pickerJson.book[projectS + ' ' + tmpScope] = {
			// 				description: `${fileName} from project ${projectS}`,
			// 				language: jsonParse.meta.defaultLocale,
			// 				src: {
			// 					type: 'fs',
			// 					path: `${folder}/${project}/${pathKey}`,
			// 				},
			// 				books: val.scope ? Object.keys(val.scope) : [],
			// 			};
			// 		} else if (
			// 			jsonParse?.meta?.flavor === 'x-OBSTranslationNotes'
			// 		) {
			// 			fileName = jsonParseIngre[pathKey].path.split('/')[1];
			// 			pickerJson['OBS-TN'][projectS + ' ' + tmpScope] = {
			// 				description: `${fileName} from project ${projectS}`,
			// 				language: jsonParse.meta.defaultLocale,
			// 				src: {
			// 					type: 'fs',
			// 					path: `${folder}/${project}/${fileName}`,
			// 				},
			// 				books: val.scope ? Object.keys(val.scope) : [],
			// 			};
			// 		} else if (
			// 			jsonParse?.type?.flavorType?.flavor?.name ===
			// 			'textStories'
			// 		) {
			// 			fileName = 'content';
			// 			pickerJson.OBS[
			// 				`OBS ${jsonParse.resourceMeta.full_name}`
			// 			] = {
			// 				description: `OBS ${jsonParse.resourceMeta.full_name}`,
			// 				language: jsonParse.meta.defaultLocale,
			// 				src: {
			// 					type: 'fs',
			// 					path: `${folder}/${project}/${fileName}`,
			// 				},
			// 				books: [],
			// 			};
			// 			break;
			// 		}
			// 	}
			// }
		}
	}
}
