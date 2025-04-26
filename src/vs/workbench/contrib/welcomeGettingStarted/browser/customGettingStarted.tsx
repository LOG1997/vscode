export function handleDemo() {
	const handleSkip=(name:string)=>{
		console.log('skip11:',name)
	}
    return (
        <div>
			<p className='text-3xl text-blue-500'>Welcome My Home</p>
            <img className="w-24 shadow-2xl" src='../../../workbench/contrib/welcomeGettingStarted/browser/media/city.jpg' alt="五" />
			<button onClick={()=>handleSkip('iu222')} className="bg-blue-300 btn btn-primary">Primary</button>
        </div>
    )
}
