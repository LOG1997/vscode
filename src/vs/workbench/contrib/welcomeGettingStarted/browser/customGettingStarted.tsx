export function handleDemo() {
	const handleSkip=(name:string)=>{
		console.log('skip:',name)
	}
    return (
        <div>
            <img className="w-24 shadow-2xl" src='../../../workbench/contrib/welcomeGettingStarted/browser/media/city.jpg' alt="五" />
			<button onClick={()=>handleSkip('iu222')} className="bg-blue-300 btn btn-primary">Primary</button>
        </div>
    )
}
