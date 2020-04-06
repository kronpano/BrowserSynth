/**
 * @author mrdoob / http://mrdoob.com/
 * @author jetienne / http://jetienne.com/
 */
/** @namespace */
var THREEx	= THREEx || {}

var detail_low = 8;
var detail_med = 16;
var detail_high = 28;

/**
 * provide info on THREE.WebGLRenderer
 * 
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
*/
THREEx.RendererStats	= function (){
console.log("renderstats");
	var container	= document.createElement( 'div' );
	container.style.cssText = 'width:80px;opacity:0.9;cursor:default';

	var msDiv	= document.createElement( 'div' );
	msDiv.style.cssText = 'padding:13px 2px 1px 2px;text-align:left;border-radius: 8px 8px 0 0;background-color:#777;';
	container.appendChild( msDiv );

	var buttonDetail = document.createElement( 'a' );
	buttonDetail.style.cssText = 'color:#000;background-color:#999;margin: 2px;padding:15px 10px 2px 14px;border-radius: 20px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;cursor:default';
	buttonDetail.appendChild( document.createTextNode( 'detail level' ) );
	buttonDetail.title ="choose detail level\n\t\tcareful\nthis changes the random seed if not specified\nusing 'set seed xyz' in the script";
	buttonDetail.className = 'buttonDetail';

	var checkbox_low = document.createElement( 'input' );
	checkbox_low.style.cssText = 'position:absolute; top: 3px;left: 10px;';
	checkbox_low.type = 'checkbox';
	checkbox_low.title='low';

	var checkbox_med = document.createElement( 'input' );
	checkbox_med.style.cssText = 'position:absolute; top: 3px;left: 30px;';
	checkbox_med.type = 'checkbox';
	checkbox_med.title='medium';

	var checkbox_high = document.createElement( 'input' );
	checkbox_high.style.cssText = 'position:absolute; top: 3px;left: 50px;';
	checkbox_high.type = 'checkbox';
	checkbox_high.title='high';
	
	checkbox_low.addEventListener( 'click', function ( event ) {
	  if(this.checked){
		checkbox_med.checked=false;
		checkbox_high.checked=false;
		localStorage.setItem('detail_level', detail_low);

	  }	
	}, false );
	checkbox_med.addEventListener( 'click', function ( event ) {
		if(this.checked){
		  checkbox_low.checked=false;
		  checkbox_high.checked=false;
		  localStorage.setItem('detail_level', detail_med);

		}	
	  }, false );
	  checkbox_high.addEventListener( 'click', function ( event ) {
		if(this.checked){
		  checkbox_med.checked=false;
		  checkbox_low.checked=false;
		  localStorage.setItem('detail_level', detail_high);
	
		}		
	  }, false );  

	buttonDetail.appendChild( checkbox_low );
	buttonDetail.appendChild( checkbox_med );
	buttonDetail.appendChild( checkbox_high );
	msDiv.appendChild( buttonDetail );

	var buttonAxis = document.createElement( 'a' );
	buttonAxis.style.cssText = 'color:#000;background-color:#999;margin: 0 0 0 5px;padding:2px 15px 2px 10px;border-radius: 20px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;cursor:default';
	buttonAxis.appendChild( document.createTextNode( 'axis ' ) );
	buttonAxis.className = 'buttonAxis';
	buttonAxis.title='toggle axis';

	var checkbox_axis = document.createElement( 'input' );
	checkbox_axis.style.cssText = 'position:relative; top: 4px;left: 12px;';
	checkbox_axis.type = 'checkbox';

	checkbox_axis.addEventListener( 'click', function ( event ) {
	  if(this.checked){
		axis_on_off = true;
		localStorage.setItem('showAxis', true);
	  }else{
		axis_on_off = false;
		localStorage.setItem('showAxis', false);
	  }		
	}, false );
	buttonAxis.appendChild( checkbox_axis );
	msDiv.appendChild( buttonAxis );

	var buttonGrid = document.createElement( 'a' );
	buttonGrid.style.cssText = 'color:#000;background-color:#999;margin: 0 0 0 5px;padding:2px 15px 2px 10px;border-radius: 20px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;cursor:default';
	buttonGrid.appendChild( document.createTextNode( 'grid ' ) );
	buttonGrid.className = 'buttonGrid';
	buttonGrid.title='toggle grid';

	var checkbox_grid = document.createElement( 'input' );
	checkbox_grid.style.cssText = 'position:relative; top: 4px;left: 12px;';
	checkbox_grid.type = 'checkbox';

	checkbox_grid.addEventListener( 'click', function ( event ) {
	  if(this.checked){
		renderer.gridHelper({on:true,size:40,step:40});
		grid_on_off = true;
		localStorage.setItem('showGrid', true);
	  }else{
		renderer.gridHelper({off:true});
		grid_on_off = false;
		localStorage.setItem('showGrid', false);
	  }		
	}, false );
	buttonGrid.appendChild( checkbox_grid );
	msDiv.appendChild( buttonGrid );



	var buttonRotate = document.createElement( 'a' );
	buttonRotate.style.cssText = 'color:#000;background-color:#999;margin: 0 0 0 5px;padding:2px 10px 2px 10px;border-radius: 20px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:20px;cursor:default';
	buttonRotate.appendChild( document.createTextNode( 'rotate' ) );
	buttonRotate.className = 'buttonRotate';
	buttonRotate.title='toggle rotation';

	var checkbox_rot = document.createElement( 'input' );
	checkbox_rot.style.cssText = 'position:relative; top: 4px;left:8px';
	checkbox_rot.type = 'checkbox';
	checkbox_rot.addEventListener( 'click', function ( event ) {
	  if(this.checked){
		rot_on_off = true;
		localStorage.setItem('doRotate', true);
	  }else{
		rot_on_off = false;
		localStorage.setItem('doRotate', false);
	  }		
	},false);
	buttonRotate.appendChild( checkbox_rot );
	msDiv.appendChild( buttonRotate );


	if (storageAvailable('localStorage')) {
		//console.log("A="+localStorage.getItem('showAxis')+"| G="+localStorage.getItem('showGrid')+"| R="+localStorage.getItem('doRotate'));
		if(!localStorage.getItem('showAxis')) {
			localStorage.setItem('showAxis', false);
		}else{
			var my_axis = localStorage.getItem('showAxis');
			if(my_axis ==='true'){
				checkbox_axis.checked = true;
			}else{
			}	
		}
		if(!localStorage.getItem('showGrid')) {
			localStorage.setItem('showGrid', false);
		 }else{
			var my_grid = localStorage.getItem('showGrid');
			if(my_grid==='true'){
				checkbox_grid.checked = true;
			}else{
			}
		}
		if(!localStorage.getItem('doRotate')) {
			localStorage.setItem('doRotate', false);
		}else{
			var my_rot = localStorage.getItem('doRotate');
			if(my_rot==='true'){
				checkbox_rot.checked = true;
			}else{
			}
		}  
		if(!localStorage.getItem('detail_level')) {
			localStorage.setItem('detail_level', 16);
			checkbox_med.checked = true;
		}else{
			var my_detail = JSON.parse(localStorage.getItem('detail_level'));
			if(my_detail == detail_low)
				checkbox_low.checked = true;
			if(my_detail == detail_med)
				checkbox_med.checked = true;
			if(my_detail == detail_high)
				checkbox_high.checked = true;
		}	

	  }
	  else {
		// Too bad, no localStorage for us
	  }



	var ImgSaveButtom	= document.createElement( 'Button' );
	ImgSaveButtom.style.cssText = 'color:#000;background-color:#e99;padding:2px 7px 2px 7px;border-radius: 22px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:10px;cursor:pointer';
	ImgSaveButtom.innerHTML= 'Save jpg img';
	ImgSaveButtom.addEventListener( 'click', function ( event ) {
		renderer.saveImg();
	});
	msDiv.appendChild( ImgSaveButtom);
	

	var ObjButton	= document.createElement( 'Button' );
	ObjButton.style.cssText = 'color:#000;background-color:#e99;padding:2px 17px 2px 7px;border-radius: 22px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:10px;cursor:pointer';
	ObjButton.innerHTML= 'Export obj';
	ObjButton.addEventListener( 'click', function ( event ) {
		renderer.exportToObj();
	});
	msDiv.appendChild( ObjButton);

	var gltfButton	= document.createElement( 'Button' );
	gltfButton.style.cssText = 'color:#000;background-color:#e99;padding:2px 17px 2px 7px;border-radius: 22px;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:10px;cursor:pointer';
	gltfButton.innerHTML= 'Export gltf';
	gltfButton.addEventListener( 'click', function ( event ) {
		renderer.exportToGltf();
	});
	msDiv.appendChild( gltfButton);

	var msText	= document.createElement( 'div' );
	msText.style.cssText = 'color:#000;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML= 'WebGLRenderer';
	msDiv.appendChild( msText );
	
	var msTexts	= [];
	var nLines	=3;
	for(var i = 0; i < nLines; i++){
		msTexts[i]	= document.createElement( 'div' );
		msTexts[i].style.cssText = 'color:#000;background-color:#999;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:12px';
		msDiv.appendChild( msTexts[i] );		
		msTexts[i].innerHTML= '-';
	}


	var lastTime	= Date.now();
	return {
		domElement: container,

		update: function(webGLRenderer){
			// sanity check
			console.assert(webGLRenderer instanceof THREE.WebGLRenderer)

			// refresh only 30time per second
			if( Date.now() - lastTime < 1000/30 )	return;
			lastTime	= Date.now()

			var i	= 0;

			msTexts[i++].textContent = "== Render =====";
			msTexts[i++].textContent = "Geometry: "+webGLRenderer.info.render.calls;
			msTexts[i++].textContent = "Triangle: "	+ webGLRenderer.info.render.triangles;
		}
	}

};
	// check if local storage is available
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}