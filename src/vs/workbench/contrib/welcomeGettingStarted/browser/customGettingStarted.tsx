export function handleDemo() {
	const handleSkip=(name:string)=>{
		console.log('skip:',name)
	}
  const imgSrc='https://zhengxin-pub.cdn.bcebos.com/mark/9900822de9f293552034b08a1ef90aa5.jpg'
    return (
        <div>
            <img className="w-24 shadow-2xl" src={imgSrc} alt="五" />
			<button onClick={()=>handleSkip('iu222')} className="bg-blue-300 btn btn-primary">Primary</button>
        </div>
    )
}
