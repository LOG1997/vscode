/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from "react";
export function createTs() {
	const handleGo = () => {
		console.log("Go")
		setInterval(() => {
			console.log("Time")
		}, 1000)
	}
	return (
		<div onClick={handleGo} className='flex flex-col gap-2 bg-blue-800'>
			<div className='h-[100px]'>
				<p className='text-white'>121312</p>
				<a href="asdas" className="btn text-pink-200">aspdoasoods</a>
			</div>
			DONE
		</div>
	)
}
