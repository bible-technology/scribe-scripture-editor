import React, { useRef, useState, useContext, Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ResourcesSidebar from '@/components/Resources/ResourcesSideBar';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import ResourceTabPane from '@/components/Resources/ResourceTabPane';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { ListResources } from '@/components/Resources/ListResources';
import { SnackBar } from '@/components/SnackBar';
import InnerFramePopup from '@/layouts/editor/InnerFramePopup';
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
									<div
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
									</div>
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
