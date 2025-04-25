export function handleDemo() {
    const yourName = 'Jon'
    const isShow=false
    const imgStyle={
        width:'100px',
        height:'100px'
    }
	const handleSkip=()=>{
		console.log('skip')
	}
  const imgSrc='https://zhengxin-pub.cdn.bcebos.com/mark/9900822de9f293552034b08a1ef90aa5.jpg'
    return (
        <div>
            <img className="w-24 shadow-2xl" src={imgSrc} style={imgStyle} alt="五" />
			<button onClick={handleSkip} className="bg-blue-300 btn btn-primary">Primary</button>
        </div>
    )
}
