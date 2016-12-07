rollout ModelExporter "三维模型导出工具"
(
	-- 结构定义
	struct jsonMesh(sUuid, sType, sName, bCastShadow = false, bReceiveShadow = false, bVisible = true, sGeometryUuid, sMaterialUuid, aChildren = #(), aMatrix = #(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1))
	struct jsonGeometryParameter(sName,nValue)
	struct jsonGeometry(sUuid, sType, sName, aParameters = #(), aVertices = #(), aNormals = #(), aColors = #(), aUvs = #(), aFaces = #())
	struct jsonMaterial(sUuid, sType, sName, nColor, nRoughness, nMetalness, nEmissive, nSpecular, nShininess, sMapUuid, sAlphaMapUuid, sLightMapUuid, sBumpMapUuid, nBumpScale, sNormalMapUuid, nNormalScale,
		sDisplacementMapUuid, nDisplacementScale, nDisplacementBias, sRoughnessMapUuid, sMetalnessMapUuid, sEmissiveMapUuid, sSpecularMapUuid, sEnvMapUuid, nEnvMapIntensity, nReflectivity, nRefractionRatio,
		nSize, bSizeAttenuation, nBlending = 1, nShading = 2, nSide = 0, nVertexColors = 0, nOpacity = 1, bTransparent = false, nDepthFunc = 3, bDepthTest = true, bDepthWrite = true, nAlphaTest = 0, bPremultipliedAlpha = false, 
		bWireframe = false, nWireframeLinewidth = 1, sWireframeLinecap = "round", sWireframeLinejoin = "round", bSkinning=false, bMorphTargets=false, bMorphNormals=false, aMaterials = #())
	struct jsonTexture(sUuid, sType, sName, nMapping = 300, nAnisotropy = 1, nMagFilter = 1006, nMinFilter = 1008, nWrapS = 1001, nWrapT = 1001, nOffsetX = 0, nOffsetY = 0, nRepeatX = 1, nRepeatY = 1, bFlipY = true, sImageUuid)
	struct jsonImage(sUuid, sUrl,sFilePathName)

	-- 变量定义
	local chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
	base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	headerFormat = "{\n\"metadata\":{\n\"version\": 4.4,\n\"type\": \"Object\",\n\"generator\": \"3DS Max ObjectExporter\",\n\"sourceFile\": \"%\"\n},\n",
	footerFormat = "}\n",
	headerArrayFormat = "\"%\": [\n",
	footerArrayFormat = "]%\n",
	headerItemFormat = "{\n",
	footerItemFormat = "}%\n",
	headerObjFormat = "\"%\": {\n",
	footerObjFormat = "}\n",
	oMeshs = #(),
	oGeometries = #(),
	oMaterials = #(),
	oTextures = #(),
	oImages = #(),
	zname,
	ostream

	-- 用户界面
	label lbl "导出所选择的模型到JSON文件：" pos:[30,20]
	checkbox exportColor "导出顶点颜色" checked:false enabled:true pos:[30,50]
	checkbox exportUv "导出UV" checked:true enabled:true pos:[30,75]
	checkbox exportNormal "导出法线" checked:true enabled:true pos:[30,100]
	checkbox smoothNormal "使用顶点法线" checked:false enabled:true pos:[30,125]

	checkbox flipYZ "翻转YZ" checked:true enabled:true pos:[30,160]
	checkbox flipUV "翻转UV" checked:false enabled:true pos:[30,185]
	checkbox flipFace "翻转所有面" checked:false enabled:true pos:[30,210]
	checkbox autoflipFace "尝试修复翻转面" checked:false enabled:true pos:[30,235]
	button btn_export "导出" pos:[80,280] width:80

	-- 函数定义

	function generateUUID =
	(
		local uuid = "", rnd = 0
		for i = 0 to 36 do
		(
			if i == 8 or i == 13 or i == 18 or i == 23 then
				uuid = uuid + "-"
			else if i == 14 then
				uuid = uuid + "4"
			else
			(
				if rnd <= 0x02 then
					rnd = 0x2000000 + ((random 0x0 0x1000000) as integer)
				r = bit.and rnd 0xf
				rnd = bit.shift rnd -4
				if i == 19 then
					uuid = uuid + chars[(bit.or (bit.and r 0x3) 0x8) + 1]
				else
					uuid = uuid + chars[r + 1]
			)
		)
		return uuid
	)

	function encodeBase64 s =
	(
		--TODO

	)

	function decodeBase64 s =
	(

		--TODO
	)

	function extractGeometry objMesh objMaterial needsFlip =
	(
		geo = jsonGeometry sUuid:(generateUUID()) sType:"Geometry"
		
		nv = getNumVerts objMesh
		nc = GetNumCPVVerts objMesh
		nu = getNumTVerts objMesh
		nf = getNumFaces objMesh
		
		-- Dump vertices
		for i = 1 to nv do
		(
			vtc = GetVert objMesh i
			if flipYZ.checked then
			(
				append geo.aVertices vtc.x
				append geo.aVertices vtc.z
				append geo.aVertices -vtc.y
			)
			else
			(
				append geo.aVertices vtc.x
				append geo.aVertices vtc.y
				append geo.aVertices vtc.z
			)
		)
		
		-- Dump colors
		if exportColor.checked then
		(
			for i = 1 to nc do
			(
				col = GetVertColor objMesh i
				r = col.r as Integer
				g = col.g as Integer
				b = col.b as Integer
				hexNum = ( bit.shift r 16 ) + ( bit.shift g 8 ) + b
				decColor = formattedPrint hexNum format:"#d"
				append geo.aColors decColor
			)
		)
		
		-- Dump uvs
		if exportUv.checked then
		(
			for i = 1 to nu do
			(
				uv = GetTVert objMesh i
				append geo.aUvs uv.x
				if flipUV.checked then
					append geo.aUvs (1 - uv.y)
				else
					append geo.aUvs uv.y
			)
		)

		-- Dump normals
		if exportNormal.checked then
		(
			if smoothNormal.checked then
			(
				for i = 1 to nv do
				(
					nml = GetNormal objMesh i
					if flipFace.checked or needsFlip then
					(
						nml.x *= -1
						nml.y *= -1
						nml.z *= -1
					)
					nml = normalize nml as point3
					if flipYZ.checked then
					(
						append geo.aNormals nml.x
						append geo.aNormals nml.z
						append geo.aNormals -nml.y
					)
					else
					(
						append geo.aNormals nml.x
						append geo.aNormals nml.y
						append geo.aNormals nml.z
					)
				)
			)
			else
			(
				for i = 1 to nf do
				(
					nml = GetFaceNormal objMesh i
					if flipFace.checked or needsFlip then
					(
						nml.x *= -1
						nml.y *= -1
						nml.z *= -1
					)
					nml = normalize nml as point3
					if flipYZ.checked then
					(
						append geo.aNormals nml.x
						append geo.aNormals nml.z
						append geo.aNormals -nml.y
					)
					else
					(
						append geo.aNormals nml.x
						append geo.aNormals nml.y
						append geo.aNormals nml.z
					)
				)
			)
		)
		
		-- Dump faces
		for i = 1 to nf do
		(
			fcs = GetFace objMesh i
			
		)
		--TODO
		
		append oGeometries geo
		return geo.sUuid
	)

	function extractImage filePathName =
	(
		if filePathName == undefined or filePathName == "" do return undefined
		-- if (getfiles filePathName).count == 0 then return undefined         -- 判断文件不存在
		if oImages.count > 0 do
		(
			for img in oImages do
			(
				if img.sFilePathName == filePathName do
				(
					return img.sUuid
				)
			)
		)

		img = jsonImage sUuid:(generateUUID()) sUrl:(filenameFromPath filePathName) sFilePathName:filePathName
		append oImages img
		return img.sUuid
	)

	function extractTexture imageFileName textureName: textureMapping: anisotropy: magFilter: minFilter: wrapS: wrapT: offsetX: offsetY: repeatX: repeatY: flipY: =
	(
		imageUuid = extractImage imageFileName
		if imageUuid == undefined do return undefined
		if oTextures.count > 0 do
		(
			for txtr in oTextures do
			(
				if txtr.sImageUuid == imageUuid do
				(
					if (txtr.sName == textureName or (txtr.sName == undefined and textureName == unsupplied)) and
					   (txtr.nMapping == textureMapping or(txtr.nMapping == 300 and textureMapping == unsupplied)) and
					   (txtr.nAnisotropy == anisotropy or(txtr.nAnisotropy == 1 and anisotropy == unsupplied)) and
					   (txtr.nMagFilter == magFilter or(txtr.nMagFilter == 1006 and magFilter == unsupplied)) and
					   (txtr.nMinFilter == minFilter or(txtr.nMinFilter == 1008 and minFilter == unsupplied)) and
					   (txtr.nWrapS == wrapS or(txtr.nWrapS == 1001 and wrapS == unsupplied)) and
					   (txtr.nWrapT == wrapT or(txtr.nWrapT == 1001 and wrapT == unsupplied)) and
					   (txtr.nOffsetX == offsetX or(txtr.nOffsetX == 0 and offsetX == unsupplied)) and
					   (txtr.nOffsetY == offsetY or(txtr.nOffsetY == 0 and offsetY == unsupplied)) and
					   (txtr.nRepeatX == repeatX or(txtr.nRepeatX == 1 and repeatX == unsupplied)) and
					   (txtr.nRepeatY == repeatY or(txtr.nRepeatY == 1 and repeatY == unsupplied)) and
					   (txtr.bFlipY == flipY or(txtr.bFlipY == True and flipY == unsupplied)) and
					   (txtr.sType == "Texture") do
						return txtr.sUuid
				)
			)
		)

		txtr = jsonTexture sUuid:(generateUUID()) sType:"Texture" sImageUuid:imageUuid
		if textureName != unsupplied and textureName != undefined do txtr.sName = textureName
		if textureMapping != unsupplied and textureMapping != undefined  do txtr.nMapping = textureMapping
		if anisotropy != unsupplied and anisotropy != undefined  do txtr.nAnisotropy = anisotropy
		if magFilter != unsupplied and magFilter != undefined  do txtr.nMagFilter = magFilter
		if minFilter != unsupplied and minFilter != undefined  do txtr.nMinFilter = minFilter
		if wrapS != unsupplied and wrapS != undefined  do txtr.nWrapS = wrapS
		if wrapT != unsupplied and wrapT != undefined  do txtr.nWrapT = wrapT
		if offsetX != unsupplied and offsetX != undefined  do txtr.nOffsetX = offsetX
		if offsetY != unsupplied and offsetY != undefined  do txtr.nOffsetY = offsetY
		if repeatX != unsupplied and repeatX != undefined  do txtr.nRepeatX = repeatX
		if repeatY != unsupplied and repeatY != undefined  do txtr.nRepeatY = repeatY
		if flipY != unsupplied and flipY != undefined  and ClassOf flipY == BooleanClass do txtr.bFlipY = flipY

		append oTextures txtr
		return txtr.sUuid
	)

	function extractCubeTexture images textureName: textureMapping: anisotropy: magFilter: minFilter: wrapS: wrapT: offsetX: offsetY: repeatX: repeatY: flipY: =
	(
		if images == undefined  or ClassOf images != Array or images.count == 0 do return undefined

		ss = StringStream ""
		for i = 1 to images.count do
		(
			tmpuuid = extractImage images[i]
			if tmpuuid == undefined do return undefined
			Format "\"%\"" tmpuuid to:ss
			if i < images.count do
				Format "," to:ss
		)
		imageUuid = ss as string

		if oTextures.count > 0 do
		(
			for txtr in oTextures do
			(
				if txtr.sImageUuid == imageUuid do
				(
					if (txtr.sName == textureName or (txtr.sName == undefined and textureName == unsupplied)) and
					   (txtr.nMapping == textureMapping or(txtr.nMapping == 300 and textureMapping == unsupplied)) and
					   (txtr.nAnisotropy == anisotropy or(txtr.nAnisotropy == 1 and anisotropy == unsupplied)) and
					   (txtr.nMagFilter == magFilter or(txtr.nMagFilter == 1006 and magFilter == unsupplied)) and
					   (txtr.nMinFilter == minFilter or(txtr.nMinFilter == 1008 and minFilter == unsupplied)) and
					   (txtr.nWrapS == wrapS or(txtr.nWrapS == 1001 and wrapS == unsupplied)) and
					   (txtr.nWrapT == wrapT or(txtr.nWrapT == 1001 and wrapT == unsupplied)) and
					   (txtr.nOffsetX == offsetX or(txtr.nOffsetX == 0 and offsetX == unsupplied)) and
					   (txtr.nOffsetY == offsetY or(txtr.nOffsetY == 0 and offsetY == unsupplied)) and
					   (txtr.nRepeatX == repeatX or(txtr.nRepeatX == 1 and repeatX == unsupplied)) and
					   (txtr.nRepeatY == repeatY or(txtr.nRepeatY == 1 and repeatY == unsupplied)) and
					   (txtr.bFlipY == flipY or(txtr.bFlipY == True and flipY == unsupplied)) and
					   (txtr.sType == "CubeTexture") do
						return txtr.sUuid
				)
			)
		)

		txtr = jsonTexture sUuid:(generateUUID()) sType:"CubeTexture" sImageUuid:imageUuid
		if textureName != unsupplied and textureName != undefined do txtr.sName = textureName
		if textureMapping != unsupplied and textureMapping != undefined  do txtr.nMapping = textureMapping
		if anisotropy != unsupplied and anisotropy != undefined  do txtr.nAnisotropy = anisotropy
		if magFilter != unsupplied and magFilter != undefined  do txtr.nMagFilter = magFilter
		if minFilter != unsupplied and minFilter != undefined  do txtr.nMinFilter = minFilter
		if wrapS != unsupplied and wrapS != undefined  do txtr.nWrapS = wrapS
		if wrapT != unsupplied and wrapT != undefined  do txtr.nWrapT = wrapT
		if offsetX != unsupplied and offsetX != undefined  do txtr.nOffsetX = offsetX
		if offsetY != unsupplied and offsetY != undefined  do txtr.nOffsetY = offsetY
		if repeatX != unsupplied and repeatX != undefined  do txtr.nRepeatX = repeatX
		if repeatY != unsupplied and repeatY != undefined  do txtr.nRepeatY = repeatY
		if flipY != unsupplied and flipY != undefined  and ClassOf flipY == BooleanClass then txtr.bFlipY = flipY else txtr.bFlipY = False

		append oTextures txtr
		return txtr.sUuid
	)

	function extractMaterial objMaterial =
	(
		
		if oMaterials.count > 0 do
		(
			for mtrl in oMaterials do
			(
				if mtrl.sName == objMaterial.Name do
				(
					return mtrl.sUuid
				)
			)
		)
		mtrl = jsonMaterial sUuid:(generateUUID()) sType:"Material"
		--TODO
			
		append oMaterials mtrl
		return mtrl.sUuid 
	)

	function NeedsFaceFlip objNode =
	(
		needsFlip = false
		local tmp = Snapshot objNode
		face_normal = normalize ( getfacenormal tmp 1 )
		face = getface tmp 1
		va = getvert tmp face[1]
		vb = getvert tmp face[2]
		vc = getvert tmp face[3]
		computed_normal = normalize ( cross (vc - vb)  (va - vb) )
		if distance computed_normal face_normal > 0.1 then needsFlip = true
		delete tmp
		return needsFlip
	)
	
	function extractMesh objNode =
	(
		if SuperClassOf objNode == GeometryClass then
		(
			needsFlip = false

			objMesh = SnapshotAsMesh objNode
			objMaterial = objNode.material
			
			if autoflipFace.checked then
			(
				needsFlip = NeedsFaceFlip objNode
			)

			if ClassOf objMesh == TriMesh then 
			(
				msh = jsonMesh sUuid:(generateUUID()) sType:"Mesh" sName:objNode.name
				
				msh.sMaterialUuid = extractMaterial objMaterial
				msh.sGeometryUuid = extractGeometry objMesh objMaterial needsFlip
				append oMeshs msh
			)
		)
		--TODO
	)

	function extractScene =
	(
		if selection.count == 0 then
			return false
		else if selection.count == 1 then
		(
			obj = selection[1]

			--geouuid = extractGeometry obj
			extractMesh obj

			--imguuid = extractImage "C:\Users\win7\Pictures\abc.jpg"
			--txtruuid = extractTexture "C:\\Users\\win7\\Pictures\\abc.jpg"

			return true
		)
		else
		(
			--imguuid = extractImage "C:\Users\win7\Pictures\1361776278_6764.jpg"
			txtruuid = extractTexture "C:\\Users\\win7\\Pictures\\1361776278_6764.jpg" flipY:False
			--append oTextures txtr


			--img = jsonImage sUuid:(generateUUID()) sUrl:"bbb.jpg"
			--img.sUuid = generateUUID()
			--img.sUrl = "bbb.jpg"
			--append oImages img
			--imguuid = extractImage "C:\1234.jpg"
			txtruuid = extractTexture "C:\\1234.jpg" textureName:"aaaa"
			--txtr = jsonTexture sUuid:(generateUUID()) sType:"texture" sImageUuid:imguuid
			--append oTextures txtr

			--imguuid = extractImage "C:\Users\win7\Pictures\1361776278_6764.jpg"
			txtruuid = extractTexture "C:\\Users\\win7\\Pictures\\1361776278_6764.jpg"

			--txtr = jsonTexture sUuid:(generateUUID()) sType:"texture" sImageUuid:imguuid

			--append oTextures txtr

			--imguuid1 = extractImage "C:\Users\win7\Pictures\1.jpg"
			--imguuid2 = extractImage "C:\Users\win7\Pictures\2.jpg"
			--imguuid3 = extractImage "C:\Users\win7\Pictures\3.jpg"
			--imguuid4 = extractImage "C:\Users\win7\Pictures\4.jpg"
			--imguuid5 = extractImage "C:\Users\win7\Pictures\5.jpg"
			--imguuid6 = extractImage "C:\Users\win7\Pictures\6.jpg"
			imgs = #("C:\\Users\\win7\\Pictures\\1.jpg","C:\\Users\\win7\\Pictures\\2.jpg","C:\\Users\\win7\\Pictures\\3.jpg","C:\\Users\\win7\\Pictures\\4.jpg","C:\\Users\\win7\\Pictures\\5.jpg","C:\\Users\\win7\\Pictures\\6.jpg")
			txtruuid = extractCubeTexture imgs

			mtluuid = extractMaterial selection[1]
			return true
		)
	)

	function exportGeometries =
	(
	    if oGeometries.count > 0 do
		(
			Format headerArrayFormat "geometries" to:ostream
			for i = 1 to oGeometries.count do
			(
				Format headerItemFormat to:ostream
				geo = oGeometries[i]
				Format "\"uuid\": \"%\",\n" geo.sUuid to:ostream
				Format "\"type\": \"%\",\n" geo.sType to:ostream
				if geo.sName != undefined do
					Format "\"name\": \"%\",\n" geo.sName to:ostream
				
				for ptr in geo.aParameters do
				(
					if ClassOf ptr == "jsonGeometryParameter" do
						Format "\"%\": %,\n" ptr.sName ptr.nValue to:ostream
				)
				
				Format headerObjFormat "data" to:ostream

				Format "\"vertices\": [" to:ostream
				for j = 1 to geo.aVertices.count do
				(
					Format "%" geo.aVertices[j] to:ostream
					if j < geo.aVertices.count do
						Format "," to:ostream
				)
				Format footerArrayFormat "," to:ostream

				Format "\"normals\": [" to:ostream
				for j = 1 to geo.aNormals.count do
				(
					Format "%" geo.aNormals[j] to:ostream
					if j < geo.aNormals.count do
						Format "," to:ostream
				)
				Format footerArrayFormat "," to:ostream

				if geo.aColors.count > 0 do
				(
					Format "\"colors\": [" to:ostream
					for j = 1 to geo.aColors.count do
					(
						Format "%" geo.aColors[j] to:ostream
						if j < geo.aColors.count do
							Format "," to:ostream
					)
					Format footerArrayFormat "," to:ostream
				)

				if geo.aUvs.count > 0 do
				(
					Format "\"uvs\": [[" to:ostream
					for j = 1 to geo.aUvs.count do
					(
						Format "%" geo.aUvs[j] to:ostream
						if j < geo.aUvs.count do
							Format "," to:ostream
					)
					Format "]],\n" to:ostream
				)

				Format "\"faces\": [" to:ostream
				for j = 1 to geo.aFaces.count do
				(
					Format "%" geo.aFaces[j] to:ostream
					if j < geo.aFaces.count do
						Format "," to:ostream
				)
				Format footerArrayFormat "" to:ostream

				Format footerItemFormat "" to:ostream
				if i < oGeometries.count then
					Format footerItemFormat "," to:ostream
				else
					Format footerItemFormat "" to:ostream
			)
			Format footerArrayFormat "," to:ostream
		)
	)

	function exportImages =
	(
		if oImages.count > 0 do
		(
			Format headerArrayFormat "images" to:ostream
			for i = 1 to oImages.count do
			(
				Format headerItemFormat to:ostream
				img = oImages[i]
				Format "\"uuid\": \"%\",\n\"url\": \"%\"\n" img.sUuid img.sUrl to:ostream
				if i < oImages.count then
					Format footerItemFormat "," to:ostream
				else
					Format footerItemFormat "" to:ostream
			)
			Format footerArrayFormat "," to:ostream
		)
	)

	function exportTextures =
	(
		if oTextures.count > 0 do
		(
			Format headerArrayFormat "textures" to:ostream
			for i = 1 to oTextures.count do
			(
				Format headerItemFormat to:ostream
				txtr = oTextures[i]
				Format "\"uuid\": \"%\",\n" txtr.sUuid to:ostream
				if txtr.sName != undefined do
					Format "\"name\": \"%\",\n" txtr.sName to:ostream
				Format "\"mapping\": %,\n" txtr.nMapping to:ostream
				Format "\"anisotropy\": %,\n" txtr.nAnisotropy to:ostream
				Format "\"magFilter\": %,\n" txtr.nMagFilter to:ostream
				Format "\"minFilter\": %,\n" txtr.nMinFilter to:ostream
				Format "\"offset\": [%,%],\n" txtr.nOffsetX txtr.nOffsetY to:ostream
				Format "\"repeat\": [%,%],\n" txtr.nRepeatX txtr.nRepeatY to:ostream
				Format "\"wrap\": [%,%],\n" txtr.nWrapS txtr.nWrapT to:ostream
				Format "\"flipY\": %,\n" txtr.bFlipY to:ostream
				if txtr.sType == "CubeTexture" then
					Format "\"images\": [%]\n" txtr.sImageUuid to:ostream
				else
					Format "\"image\": \"%\"\n" txtr.sImageUuid to:ostream

				if i < oTextures.count then
					Format footerItemFormat "," to:ostream
				else
					Format footerItemFormat "" to:ostream
			)
			Format footerArrayFormat "," to:ostream
		)
	)

	function exportMaterials =
	(
		if oMaterials.count > 0 do
		(
			Format headerArrayFormat "materials" to:ostream
			for i = 1 to oMaterials.count do
			(
				Format headerItemFormat to:ostream
				mtrl = oMaterials[i]
				Format "\"uuid\": \"%\",\n" mtrl.sUuid to:ostream
				Format "\"type\": \"%\",\n" mtrl.sType to:ostream
				if mtrl.sName != undefined do
					Format "\"name\": \"%\",\n" mtrl.sName to:ostream
				if mtrl.nColor != undefined do
					Format "\"color\": %,\n" mtrl.nColor to:ostream
				if mtrl.nRoughness != undefined do
					Format "\"roughness\": %,\n" mtrl.nRoughness to:ostream
				if mtrl.nMetalness != undefined do
					Format "\"metalness\": %,\n" mtrl.nMetalness to:ostream
				if mtrl.nEmissive != undefined do
					Format "\"emissive\": %,\n" mtrl.nEmissive to:ostream
				if mtrl.nSpecular != undefined do
					Format "\"specular\": %,\n" mtrl.nSpecular to:ostream
				if mtrl.nShininess != undefined do
					Format "\"shininess\": %,\n" mtrl.nShininess to:ostream
				if mtrl.sMapUuid != undefined do
					Format "\"map\": \"%\",\n" mtrl.sMapUuid to:ostream
				if mtrl.sAlphaMapUuid != undefined do
					Format "\"alphaMap\": \"%\",\n" mtrl.sAlphaMapUuid to:ostream
				if mtrl.sLightMapUuid != undefined do
					Format "\"lightMap\": \"%\",\n" mtrl.sLightMapUuid to:ostream
				if mtrl.sBumpMapUuid != undefined do
				(
					Format "\"bumpMap\": \"%\",\n" mtrl.sBumpMapUuid to:ostream
					if mtrl.nBumpScale != undefined then
						Format "\"bumpScale\": %,\n" mtrl.nBumpScale to:ostream
					else
						Format "\"bumpScale\": 1,\n" to:ostream
				)
				if mtrl.sNormalMapUuid != undefined do
				(
					Format "\"normalMap\": \"%\",\n" mtrl.sNormalMapUuid to:ostream
					if mtrl.nNormalScale != undefined then
						Format "\"normalScale\": %,\n" mtrl.nNormalScale to:ostream
					else
						Format "\"normalScale\": 1,\n" to:ostream
				)
				if mtrl.sDisplacementMapUuid != undefined do
				(
					Format "\"displacementMap\": \"%\",\n" mtrl.sDisplacementMapUuid to:ostream
					if mtrl.nDisplacementScale != undefined then
						Format "\"displacementScale\": %,\n" mtrl.nDisplacementScale to:ostream
					else
						Format "\"displacementScale\": 1,\n" to:ostream
					if mtrl.nDisplacementBias != undefined then
						Format "\"displacementBias\": %,\n" mtrl.nDisplacementBias to:ostream
					else
						Format "\"displacementBias\": 0,\n" to:ostream
				)
				if mtrl.sRoughnessMapUuid != undefined do
					Format "\"roughnessMap\": \"%\",\n" mtrl.sRoughnessMapUuid to:ostream
				if mtrl.sMetalnessMapUuid != undefined do
					Format "\"metalnessMap\": \"%\",\n" mtrl.sMetalnessMapUuid to:ostream
				if mtrl.sEmissiveMapUuid != undefined do
					Format "\"emissiveMap\": \"%\",\n" mtrl.sEmissiveMapUuid to:ostream
				if mtrl.sSpecularMapUuid != undefined do
					Format "\"specularMap\": \"%\",\n" mtrl.sSpecularMapUuid to:ostream
				if mtrl.sEnvMapUuid != undefined do
				(
					Format "\"envMap\": \"%\",\n" mtrl.sEnvMapUuid to:ostream
					--if mtrl.nEnvMapIntensity != undefined do
					--	Format "\"envMapIntensity\": %,\n" mtrl.nEnvMapIntensity to:ostream
					--else
					--	Format "\"envMapIntensity\": 1,\n" to:ostream
					if mtrl.nReflectivity != undefined then
						Format "\"reflectivity\": %,\n" mtrl.nReflectivity to:ostream
					else if mtrl.nEnvMapIntensity != undefined then
						Format "\"envMapIntensity\": %,\n" mtrl.nEnvMapIntensity to:ostream
					else
						Format "\"reflectivity\": 1,\n" to:ostream
				)
				if mtrl.nSize != undefined do
					Format "\"size\": %,\n" mtrl.nSize to:ostream
				if mtrl.bSizeAttenuation != undefined do
					Format "\"sizeAttenuation\": %,\n" mtrl.bSizeAttenuation to:ostream
				
				if mtrl.nBlending != undefined and mtrl.nBlending != 1 do
					Format "\"blending\": %,\n" mtrl.nBlending to:ostream
				if mtrl.nShading != undefined and mtrl.nShading != 2 do
					Format "\"shading\": %,\n" mtrl.nShading to:ostream
				if mtrl.nSide != undefined and mtrl.nSide != 0 do
					Format "\"side\": %,\n" mtrl.nSide to:ostream
				if mtrl.nVertexColors != undefined and mtrl.nVertexColors != 0 do
					Format "\"vertexColors\": %,\n" mtrl.nVertexColors to:ostream
				
				if mtrl.nOpacity != undefined and mtrl.nOpacity < 1 do
					Format "\"opacity\": %,\n" mtrl.nOpacity to:ostream
				if mtrl.bTransparent != undefined and mtrl.bTransparent == true do
					Format "\"transparent\": %,\n" mtrl.bTransparent to:ostream
				
				Format "\"depthFunc\": %,\n" mtrl.nDepthFunc to:ostream
				Format "\"depthTest\": %,\n" mtrl.bDepthTest to:ostream
				Format "\"depthWrite\": %,\n" mtrl.bDepthWrite to:ostream
				
				if mtrl.nAlphaTest != undefined and mtrl.nAlphaTest > 0 do
					Format "\"alphaTest\": %,\n" mtrl.nAlphaTest to:ostream
				if mtrl.bPremultipliedAlpha != undefined and mtrl.bPremultipliedAlpha == true do
					Format "\"premultipliedAlpha\": %,\n" mtrl.bPremultipliedAlpha to:ostream

				if mtrl.bWireframe != undefined and mtrl.bWireframe == true do
					Format "\"wireframe\": %,\n" mtrl.bWireframe to:ostream
				if mtrl.nWireframeLinewidth != undefined and mtrl.nWireframeLinewidth > 1 do
					Format "\"wireframeLinewidth\": %,\n" mtrl.nWireframeLinewidth to:ostream
				if mtrl.sWireframeLinecap != undefined and mtrl.sWireframeLinecap != "round" do
					Format "\"wireframeLinecap\": \"%\",\n" mtrl.sWireframeLinecap to:ostream
				if mtrl.sWireframeLinejoin != undefined and mtrl.sWireframeLinejoin != "round" do
					Format "\"wireframeLinejoin\": \"%\",\n" mtrl.sWireframeLinejoin to:ostream
				
				Format "\"skinning\": %,\n" mtrl.bSkinning to:ostream
				Format "\"morphTargets\": %,\n" mtrl.bMorphTargets to:ostream
				Format "\"morphNormals\": %\n" mtrl.bMorphNormals to:ostream
				
				if i < oMaterials.count then
					Format footerItemFormat "," to:ostream
				else
					Format footerItemFormat "" to:ostream
			)
			Format footerArrayFormat "," to:ostream
		)
	)

	function exportMesh msh =
	(
		Format "\"uuid\": \"%\",\n" msh.sUuid to:ostream
		Format "\"type\": \"%\",\n" msh.sType to:ostream		
		if msh.sName != undefined do
			Format "\"name\": \"%\",\n" msh.sName to:ostream
		if msh.bCastShadow == true do
			Format "\"castShadow\": %,\n" msh.bCastShadow to:ostream
		if msh.bReceiveShadow == true do
			Format "\"receiveShadow\": %,\n" msh.bReceiveShadow to:ostream
		if msh.bVisible != true do
			Format "\"visible\": %,\n" false to:ostream

		if msh.sGeometryUuid != undefined do
			Format "\"geometry\": \"%\",\n" msh.sGeometryUuid to:ostream
		if msh.sMaterialUuid != undefined do
			Format "\"material\": \"%\",\n" msh.sMaterialUuid to:ostream
		
		if msh.aChildren.count > 0 do
		(
			Format headerArrayFormat "children" to:ostream
			for i = 1 to msh.aChildren.count do
			(
				Format headerItemFormat to:ostream
		
				exportMesh msh.aChildren[i]

				if i < msh.aChildren.count then
					Format footerItemFormat "," to:ostream
				else
					Format footerItemFormat "" to:ostream
			)
			Format footerArrayFormat "," to:ostream
		)
		
		Format "\"matrix\": [%,%,%,%,%,%,%,%,%,%,%,%,%,%,%,%]\n" msh.aMatrix[1] msh.aMatrix[2] msh.aMatrix[3] msh.aMatrix[4] msh.aMatrix[5] msh.aMatrix[6] msh.aMatrix[7] msh.aMatrix[8] msh.aMatrix[9] msh.aMatrix[10] msh.aMatrix[11] msh.aMatrix[12] msh.aMatrix[13] msh.aMatrix[14] msh.aMatrix[15] msh.aMatrix[16]  to:ostream 
	)

	function exportObjects =
	(
		Format headerObjFormat "object" to:ostream
		if oMeshs.count == 0 then
		(
			
		)
		else if oMeshs.count == 1 then
		(
			exportMesh oMeshs[1]
		)
		else
		(
			Format "\"uuid\": \"%\",\n" (generateUUID()) to:ostream
			Format "\"type\": \"%\",\n" "Group" to:ostream
			Format "\"name\": \"%\",\n" zname to:ostream
			Format headerArrayFormat "children" to:ostream
			for i = 1 to oMeshs.count do
			(
				Format headerItemFormat to:ostream
				
				exportMesh oMeshs[i]
				
				if i < oMeshs.count then
					Format footerItemFormat "," to:ostream
				else
					Format footerItemFormat "" to:ostream
			)
			Format footerArrayFormat "," to:ostream
			
			Format "\"matrix\": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]\n" to:ostream
		)

		Format footerObjFormat to:ostream
	)

	--事件
	on btn_export pressed do
	(
		if maxFileName == undefined or maxFileName == "" then
		(
			MessageBox "请先保存正在编辑的场景后，再导出模型。"
		)
		else
		(
			if extractScene() then
			(
				zname = getFilenameFile maxFileName
				if zname != undefined and zname != "" then
				(
					zname += ".json"
				)
				fname = GetSaveFileName filename:zname types:"JSON文件(*.json)|*.json|所有文件(*.*)|*.*"
				if fname != undefined then
				(
					ostream = CreateFile fname
					if ostream == undefined then
					(
						MessageBox "不能导出三维模型到文件 " + fname + " 中！"
					)
					else
					(
						Format headerFormat maxFileName to:ostream
						exportGeometries()
						exportImages()
						exportTextures()
						exportMaterials()
						exportObjects()
						Format footerFormat to:ostream
						close ostream
						DestroyDialog ModelExporter
					)
				)
			)
			else
			(
				MessageBox "请选择需要导出的模型物件！"
			)
		)
	)
)
createDialog ModelExporter height:320 width:240
