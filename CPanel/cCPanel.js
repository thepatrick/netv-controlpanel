// -------------------------------------------------------------------------------------------------
//	cCPanel class
//
//
//
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
//	constructor
// -------------------------------------------------------------------------------------------------
function cCPanel(
)
{
	this.JSCORE = null;
	this.mModel = null;
	
	this.mMessageDisplayInProgress = false;
	this.mMessageList = [];
	
	this.mPrevState = "";
	this.mState = "";
	this.mSubState = "";
	
	this.mLocked = false;
	console.log("hello console");
}

// -------------------------------------------------------------------------------------------------
//	singleton
// -------------------------------------------------------------------------------------------------
cCPanel.instance = null;
cCPanel.fGetInstance = function(
)
{
	return cCPanel.instance ? cCPanel.instance : (cCPanel.instance = new cCPanel());
}

// -------------------------------------------------------------------------------------------------
//	pState
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.pState = function(
	vState
)
{
	if (! vState)
		return cCPanel.instance.mState;
		
	if (cCPanel.instance.mState != vState)
	{
		cCPanel.instance.mPrevState = cCPanel.instance.mState;
		cCPanel.instance.mState = vState;
	}
	return cCPanel.instance.mState;
}

// -------------------------------------------------------------------------------------------------
//	fInit
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fInit = function(
	vReturnFun
)
{
	this.fHideAll();
	
	// hide the flash widget div
	$("#div_flashWidgetMain_arrowPrev").click(function() {
		cModel.fGetInstance().PREV_WIDGET_INDEX = cModel.fGetInstance().CURR_WIDGET_INDEX;
		cModel.fGetInstance().CURR_WIDGET_INDEX--;
		if (cModel.fGetInstance().CURR_WIDGET_INDEX < 0)
			cModel.fGetInstance().CURR_WIDGET_INDEX = cModel.fGetInstance().CHANNEL_LIST[cModel.fGetInstance().CURR_CHANNEL_INDEX].mWidgetList.length - 1;
		cCPanel.fGetInstance().fRefreshChannelDiv();
	});
	$("#div_flashWidgetMain_arrowNext").click(function() {
		cModel.fGetInstance().PREV_WIDGET_INDEX = cModel.fGetInstance().CURR_WIDGET_INDEX;
		cModel.fGetInstance().CURR_WIDGET_INDEX++;
		if (cModel.fGetInstance().CURR_WIDGET_INDEX > cModel.fGetInstance().CHANNEL_LIST[cModel.fGetInstance().CURR_CHANNEL_INDEX].mWidgetList.length - 1)
			cModel.fGetInstance().CURR_WIDGET_INDEX = 0;
		cCPanel.fGetInstance().fRefreshChannelDiv();
	});
	
	$("#div_loader").fadeIn();
	$("#div_messageBoard").fadeIn();
	
	var vViewPortSize = [];
	var vWidgetEdgeOffset = [50, 50];
	if (typeof window.innerWidth != 'undefined')
	{
		vViewPortSize[0] = window.innerWidth,
		vViewPortSize[1] = window.innerHeight
	}
	if (vViewPortSize[0] > 800)
		$("#div_CPanel").css("left", (vViewPortSize[0] - 800) / 2 + "px");
	if (vViewPortSize[1] > 600)
		$("#div_CPanel").css("top", (vViewPortSize[1] - 600) / 2 + "px");

	if ($("#div_actionArea").length)
	{
		$("#div_actionArea").css("top", (parseFloat($("#div_CPanel").css("top").split("px")[0]) + 570) + "px");
		$("#div_actionArea").css("left", $("#div_CPanel").css("left"));
	}
	
	if ($("#div_widgetPlayer").length)
	{
		$("#div_widgetPlayer").css("left", (vViewPortSize[0] - parseFloat($("#div_widgetPlayer").css("width").split("px")[0]) - vWidgetEdgeOffset[0]) + "px")
		$("#div_widgetPlayer").css("top", (vViewPortSize[1] - parseFloat($("#div_widgetPlayer").css("height").split("px")[0]) - vWidgetEdgeOffset[1]) + "px")
	}
	
	mCurrDivVisible = "div_messageBoard";
	this.pState("controlpanel");
}

// -------------------------------------------------------------------------------------------------
//	fHideAll
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fHideAll = function(
)
{
	$("#div_flashWidgetMain").hide();
	
	// hide main channel div
	$("#div_channelMain").hide();
	$("#div_tempBg").hide();
	$("#div_activation").hide();
		
	// hide all debug div
	$("#div_actionArea").hide();
	$("#div_dbg_container").hide();
	
	$("#div_flashWidgetPlayer").hide();
	$("#div_htmlWidgetPlayer").hide();
	$("#div_loader").hide();
	
	$("#div_messageBoard").hide();
}

// -------------------------------------------------------------------------------------------------
//	fOnSignal
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fOnSignal = function(
	vSignal,		// string
	vData,			// data array
	vReturnFun		// return function call
)
{
fDbg("*** cCPanel, fOnSignal(), " + vSignal + ", " + vData);
	var mCPanel = cCPanel.fGetInstance();
	
	// JavaScript Injection Signals
	switch(vSignal)
	{
	case cConst.SIGNAL_TOGGLE_CONTROLPANEL:
		if (mCPanel.mState != "controlpanel")
			mCPanel.fOnSignal(cConst.SIGNAL_GOTO_CONTROLPANEL);
		else
		{
			if (mCPanel.mPrevState == "htmlwidgetengine")
				mCPanel.fOnSignal(cConst.SIGNAL_GOTO_HTMLWIDGETENGINE);
		}
		break;
		
	case cConst.SIGNAL_TOGGLE_WIDGETENGINE:
		if (cCPanel.instance.mLocked == true)
			return;
		cCPanel.instance.mLocked = true;
		switch (mCPanel.mState)
		{
		case "htmlwidgetengine":
			mCPanel.fHideHTMLWidgetEngine(function() {
				cCPanel.instance.pState("empty");
				cCPanel.instance.mLocked = false;
			});
			break;
		case "flashwidgetengine":
			break;
		case "empty":
			if (mCPanel.mPrevState == "htmlwidgetengine")
				mCPanel.fShowHTMLWidgetEngine2(function() {
					cCPanel.instance.pState("htmlwidgetengine");
					cCPanel.instance.mLocked = false;
				});
			break;
		case "controlpanel":
			mCPanel.fOnSignal(cConst.SIGNAL_BUTTON_CENTER);
			break;
		}
		break;
		
	case cConst.SIGNAL_BUTTON_LEFT:
		if (mCPanel.mState == "controlpanel" && mCPanel.mSubState == "channelMain")
		{
			$("#div_channelMain_channelThumbnail_0_shadow").show();
			$("#div_channelMain_channelThumbnail_1_shadow").hide();
		}
		break;
		
	case cConst.SIGNAL_BUTTON_RIGHT:
		if (mCPanel.mState == "controlpanel" && mCPanel.mSubState == "channelMain")
		{
			$("#div_channelMain_channelThumbnail_0_shadow").hide();
			$("#div_channelMain_channelThumbnail_1_shadow").show();
		}
		break;
		
	case cConst.SIGNAL_BUTTON_CENTER:
		if (mCPanel.mState == "controlpanel" && mCPanel.mSubState == "channelMain")
		{
			if ($('#div_channelMain_channelThumbnail_0_shadow').is(':visible'))
				mCPanel.fOnSignal(cConst.SIGNAL_GOTO_FLASHWIDGETENGINE);
			else if ($('#div_channelMain_channelThumbnail_1_shadow').is(':visible'))
				mCPanel.fOnSignal(cConst.SIGNAL_GOTO_HTMLWIDGETENGINE);
		}
		break;
		
	case cConst.SIGNAL_BUTTON_UP:
		break;
		
	case cConst.SIGNAL_BUTTON_DOWN:
		cProxy.xmlhttpPost("", "post", {cmd : "WidgetEngine", data : "<value>Restart</value>"}, cCPanel.instance.fShowFLASHWidgetEngineReturn);
		break;
	}
	
	// internal signals
	switch(vSignal)
	{
	case cConst.SIGNAL_MESSAGE:
		mCPanel.fDisplayMessageBoard(vData[0]);
		break;
		
	case cConst.SIGNAL_CHANNELDIV_SHOW:
		switch (mCurrDivVisible)
		{
		case "div_messageBoard":
			mCPanel.fRefreshChannelDiv(mCPanel.fShowChannelDiv);	
			break;
		}
		break;
		
	case cConst.SIGNAL_WIDGETENGINE_SHOW:
		//mCPanel.fShowWidgetEngine();
		mCPanel.fOnSignal(cConst.SIGNAL_GOTO_HTMLWIDGETENGINE);
		break;
		
	case cConst.SIGNAL_GOTO_CONTROLPANEL:
		switch (mCPanel.mState)
		{
		case "controlpanel":
			break;
		case "htmlwidgetengine":
			mCPanel.fHideHTMLWidgetEngine(function() {
				mCPanel.fShowControlPanel();
			});
			break;
		case "flashwidgetengine":
			cProxy.xmlhttpPost("", "post", {cmd : "SetChromaKey", data : "<value>On</value>"}, function() {});
			cProxy.xmlhttpPost("", "post", {cmd : "PlayWidget", data : "<value>hide</value>"}, function() {});
			cProxy.xmlhttpPost("", "post", {cmd : "WidgetEngine", data : "<value>Minimize</value>"}, function() {});
			cProxy.xmlhttpPost("", "post", {cmd : "SetBox", data : "<value>0 0 1279 719</value>"}, function() {});
			mCPanel.fShowControlPanel();
			break;
		case "empty":
			mCPanel.fShowControlPanel();
			break;
		}
		break;
		
	case cConst.SIGNAL_GOTO_HTMLWIDGETENGINE:
		mCPanel.fShowHTMLWidgetEngine();
		break;
		
	case cConst.SIGNAL_GOTO_FLASHWIDGETENGINE:
		$("#div_flashWidgetMain").show();
		$("#div_CPanel").animate({
			left: "-=1200"
		}, 800, function() {
			mCPanel.fShowFLASHWidgetEngine();
		});
		break;
	}	
}
































// -------------------------------------------------------------------------------------------------
//	fShow
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fDisplayMessageBoard = function(
	v
)
{
	var o;
	
	if (v)
	{
		if ($("#div_messageBoard_text").html() !== v)
		{
			mCPanel.mMessageList.push(v);
			if (mCPanel.mMessageDisplayInProgress === false)
			{
				mCPanel.mMessageDisplayInProgress = true;
				$("#div_messageBoard_text").fadeOut("fast", function() {
					$("#div_messageBoard_text").html(v);
					mCPanel.mMessageList.splice(0, 1);
					$("#div_messageBoard_text").fadeIn("fast", function() {
						if (mCPanel.mMessageList.length > 0)
							mCPanel.instance.fDisplayMessageBoard();
						else
							mCPanel.mMessageDisplayInProgress = false;
					});
				});
			}
		}
		else
		{
			if (mCPanel.mMessageList.length > 0)
				mCPanel.mMessageList.splice(0, 1);
			fDisplayMessageBoard();
		}
	}
	else
	{
		if (mCPanel.mMessageList.length == 0)
			return;
		o = mCPanel.mMessageList[0];
		mCPanel.mMessageList.splice(0, 1);
		if (mCPanel.mMessageDisplayInProgress === false)
		{
			mCPanel.mMessageDisplayInProgress = true;
		}
			$("#div_messageBoard_text").fadeOut("fast", function() {
				$("#div_messageBoard_text").html(o);
fDbg("new curr : " + $("#div_messageBoard_text").html());
				$("#div_messageBoard_text").fadeIn("fast", function() {
					if (mCPanel.mMessageList.length > 0)
					{
						fDisplayMessageBoard();
					}
					else
						mCPanel.mMessageDisplayInProgress = false;
				});
			});
	}
	cCPanel.instance.mSubState = "messageBoard";
}


// -------------------------------------------------------------------------------------------------
//	fShowMessageDiv
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fShowMessageDiv = function(
)
{
	
}

// -------------------------------------------------------------------------------------------------
//	fHideMessageDiv
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fHideMessageDiv = function(
)
{
	
}


/*
// -------------------------------------------------------------------------------------------------
//	fPlayWidget
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fPlayWidget = function(
	vWidgetPath
)
{
fDbg("*** cCPanel, fPlayWidget(), " + vWidgetPath);
	$("#div_widgetPlayer").show();
	$("#div_widgetPlayer_embed").css("left", (parseFloat($("#div_widgetPlayer_embed").css("left").split("px")[0]) + 800) + "px");
	$("#div_widgetPlayer_embed").animate({
		left: '-=800'
	}, 200, function() {
		// Animation complete.
	});
	
	$("#div_messageBoard").animate({
		left: "-=800"
	}, 200, function() {
		// Animation compelte
	});
	
	var o = setInterval(function() {
		//document.getElementById("widget_player_01").fPlayWidget();
		clearInterval(o);
	}, 500);
}

// -------------------------------------------------------------------------------------------------
//	fShow
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fShow = function(
)
{
	// hide widget rendering engine
	$("#div_widgetPlayer_embed").animate({
		left: '+=800'
	}, 200, function() {
		// Animation complete.
		//~ $("#div_widgetPlayer").hide();
	});
	// tell JSCore to hold counter/heartbeat, or shall reset it??
	
	
	// show control panel MAIN div
	$.get('http://192.168.1.210/projects/0009.chumbyJSCore/test/test1.php?url=' + "http://s3movies.chumby.com/cdn/xmlthumbnail/40D95390-FF04-11DE-A291-001B24E044BE", function(data) {
		$("#div_main_thumbnailPrev").attr("src", "data:image/jpg;base64," + data);
	});
	$.get('http://192.168.1.210/projects/0009.chumbyJSCore/test/test1.php?url=' + "http://s3movies.chumby.com/cdn/xmlthumbnail/B86CAD48-3114-11DF-B75B-001B24E044BE", function(data) {
		$("#div_main_thumbnailCurr").attr("src", "data:image/jpg;base64," + data);
	});
	$.get('http://192.168.1.210/projects/0009.chumbyJSCore/test/test1.php?url=' + "http://s3movies.chumby.com/cdn/xmlthumbnail/F9694E16-2AEB-11DF-B699-001B24E044BE", function(data) {
		$("#div_main_thumbnailNext").attr("src", "data:image/jpg;base64," + data);
	});
	//~ $("#div_main").fadeIn();

	
	$("#div_main").show();
	$("#div_main").css("left", "-800px");
	$("#div_main").animate({
		left: "+=800"
	}, 200, function() {
		// Animation complete
	});
}

cCPanel.prototype.fHide = function(
)
{
	$("#div_main").show();
	$("#div_main").css("left", "0px");
	$("#div_main").animate({
		left: "-=800"
	}, 200, function() {
		// Animation complete
	});
	
	$("#div_widgetPlayer_embed").show();
	$("#div_widgetPlayer_embed").css("left", "800px");
	$("#div_widgetPlayer_embed").animate({
		left: '-=800'
	}, 200, function() {
		// Animation complete.
	});
}
*/



// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	control panel div functions
// 
// 
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	fShowControlPanel
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fShowControlPanel = function(
)
{
fDbg("*** cCPanel, fShowControlPanel(), ");
	
	$("#div_tempBg").show();
	$("#div_tempBg").hide();
	
	$("#div_CPanel").css("left", "-960px");
	$("#div_CPanel").animate({
		left: "+=1200"
	}, 800, function() {
		cCPanel.instance.fRenderChannelMain();
		cCPanel.instance.fShowControlPanelReturn();
		$("#div_tempBg").show();
		$("#div_tempBg").hide();
	});
}

cCPanel.prototype.fShowControlPanelReturn = function(
	vData
)
{
fDbg("*** cCPanel, fShowControlPanelReturn(), " + vData);
	this.pState("controlpanel");
}

// -------------------------------------------------------------------------------------------------
//	fRenderChannelMain
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fRenderChannelMain = function(
)
{
fDbg("*** cCPanel, fRenderChannelMain(), ");
	$("#div_channelMain").fadeIn(800, function() {
	
	});
	
	switch (cCPanel.instance.mState)
	{
	case "htmlwidgetengine":
		$("#div_channelMain_channelThumbnail_0_shadow").hide();
		$("#div_channelMain_channelThumbnail_1_shadow").show();
		cCPanel.instance.mSubState = "channelMain";
		break;
	case "flashwidgetengine":
		$("#div_channelMain_channelThumbnail_0_shadow").show();
		$("#div_channelMain_channelThumbnail_1_shadow").hide();
		cCPanel.instance.mSubState = "channelMain";
		break;
	case "empty":
		$("#div_channelMain_channelThumbnail_0_shadow").hide();
		$("#div_channelMain_channelThumbnail_1_shadow").show();
		cCPanel.instance.mSubState = "channelMain";
		break;
	}
}


























// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	widget engine div functions   (HTML widgets)
// 
// 
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	fShowHTMLWidgetEngine
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fShowHTMLWidgetEngine2 = function(
	vReturnFun
)
{
	if (vReturnFun)
	{
		$("#div_htmlWidgetPlayer").show();
		$("#div_htmlWidgetPlayer").css("top", "720px");
		$("#div_htmlWidgetPlayer").animate({
			top: "-=80"
		}, 300, function() {
			vReturnFun();
		});
	}
}


cCPanel.prototype.fShowHTMLWidgetEngine = function(
	vReturnFun
)
{
fDbg("*** cCPanel, fShowHTMLWidgetEngine(), ");
	//cProxy.xmlhttpPost("", "post", {cmd : "ShowWidgetEngine", data : "<value>true</value>"}, cCPanel.instance.fShowHTMLWidgetEngineReturn);
	cCPanel.instance.fShowHTMLWidgetEngineReturn(null, vReturnFun);
	
}

cCPanel.prototype.fShowHTMLWidgetEngineReturn = function(
	vData,
	vReturnFun
)
{
fDbg("*** cCPanel, fShowHTMLWidgetEngineReturn(), " + vData);
	if (!vReturnFun)
		cCPanel.instance.fSetHTMLWidgetEngineSize();
	else
	{
		vReturnFun();

	}
}

// -------------------------------------------------------------------------------------------------
//	fSetWidgetEngineSize
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fSetHTMLWidgetEngineSize = function(
)
{
fDbg("*** cCPanel, fSetHTMLWidgetEngineSize(), ");
	
	$("#div_loader").fadeOut(200, function() {
	});
	$("#div_CPanel").animate({
		left: "-=1200"
	}, 800, function() {
		cCPanel.instance.fSetHTMLWidgetEngineSizeReturn();
	});
}

cCPanel.prototype.fSetHTMLWidgetEngineSizeReturn = function(
	vData
)
{
fDbg("*** cCPanel, fSetHTMLWidgetEngineSizeReturn(), " + vData);
	var o, p;
	o = 'http://localhost/widgets/twitter0.1/index.html';
	
	//p = setTimeout(function() {
		$("#div_htmlWidgetPlayer").show();
		$("#div_htmlWidgetPlayer").css("top", "720px");
		$("#div_htmlWidgetPlayer").animate({
			top: "-=80"
		}, 300, function() {
		
		});
	//}, 800);
	
	$("#div_htmlWidgetPlayer").html('<iframe id="iframe_htmlWidgetPlayer" src="' + o + '" marginheight="0" marginwidth="0" frameborder="0" scrolling="no" style="width: 1279px; height: 70px; background-color:rgba(255, 255, 255, 1)"></iframe>');
	this.pState("htmlwidgetengine");
}

// -------------------------------------------------------------------------------------------------
//	fHideHTMLWidgetEngine
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fHideHTMLWidgetEngine = function(
	vReturnFun
)
{
fDbg("*** cCPanel, fHideHTMLWidgetEngine(), ");
	$("#div_htmlWidgetPlayer").animate({
		top: "+=80"
	}, 300, function() {
		cCPanel.instance.fHideHTMLWidgetEngineReturn(null, vReturnFun);
	});
}

cCPanel.prototype.fHideHTMLWidgetEngineReturn = function(
	vData,
	vReturnFun
)
{
fDbg("*** cCPanel, fHideHTMLWidgetEngineReturn(), " + vData);
	if (vReturnFun)
		vReturnFun();
}






































// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	widget engine div functions		(flash widgets)
// 
// 
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
//	fShowFLASHWidgetEngine
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fShowFLASHWidgetEngine = function(
)
{
fDbg("*** cCPanel, fShowFLASHWidgetEngine(), ");
	cProxy.xmlhttpPost("", "post", {cmd : "SetChromaKey", data : "<value>On</value>"}, function(vData) {
		fDbg2("===> " + vData.split("<status>")[1].split("</status>")[0]);
		fDbg2("===> " + vData.split("<value>")[1].split("</value>")[0]);
	});
	//cProxy.xmlhttpPost("", "post", {cmd : "SetChromaKey", data : "<value>On</value>"}, function(vData) {fDbg2("---> " + encodeURI(vData));});
	cProxy.xmlhttpPost("", "post", {cmd : "PlayWidget", data : "<value>show</value>"}, cCPanel.instance.fShowFLASHWidgetEngineReturn);
	cProxy.xmlhttpPost("", "post", {cmd : "SetBox", data : "<value>959 479 320 240</value>"}, null);
	cProxy.xmlhttpPost("", "post", {cmd : "WidgetEngine", data : "<value>Maximize</value>"}, cCPanel.instance.fShowFLASHWidgetEngineReturn);
	//cProxy.xmlhttpPost("", "post", {cmd : "SetBox", data : "<value>959 479 320 240</value>"}, function() {});
	//$("#div_dbg_container").show();
	
	//cProxy.xmlhttpPost("", "post", {cmd : "WidgetEngine", data : "<value>SetBox 959 479 320 240</value>"}, cCPanel.instance.fShowFLASHWidgetEngineReturn);
}

cCPanel.prototype.fShowFLASHWidgetEngineReturn = function(
	vData
)
{
fDbg("*** cCPanel, fShowFLASHWidgetEngineReturn(), " + vData);
	cCPanel.instance.pState("flashwidgetengine");
	fDbg2("-----> " + vData.split("<status>")[1].split("</status>")[0]);
	fDbg2("-----> " + vData.split("<value>")[1].split("</value>")[0]);
	// fDbg2("---> " + encodeURI(vData));
	
	
	//cCPanel.instance.fSetWidgetEngineSize();
//$('#div_channelMain_channelThumbnail_0_title').css("font-size", "12px");
//$('#div_channelMain_channelThumbnail_0_title').css("width", "600px");

//$('#div_channelMain_channelThumbnail_0_title').html(vData.replace("<", "||").replace(">", "||"));

}

// -------------------------------------------------------------------------------------------------
//	fSetWidgetEngineSize
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fSetWidgetEngineSize = function(
)
{
fDbg("*** cCPanel, fSetWidgetEngineSize(), ");

	$("#div_CPanel").animate({
		left: "-=1200"
	}, 800, function() {
		cProxy.xmlhttpPost("", "post", {cmd : "SetWidgetSize", data : "<value>1000 520 240 180</value>"}, cCPanel.instance.fSetWidgetEngineSizeReturn);
		
		/*
		var vStepCount = 50;
		var vCurrBox = [240, 60, 800, 600];
		var vFinalBox = [800, 450, 320, 240];
		var vStep = [
			(vFinalBox[0] - vCurrBox[0]) / vStepCount,
			(vFinalBox[1] - vCurrBox[1]) / vStepCount,
			(vFinalBox[2] - vCurrBox[2]) / vStepCount,
			(vFinalBox[3] - vCurrBox[3]) / vStepCount
		];
		var i = 0;
		//cProxy.xmlhttpPost("", "post", {cmd : "SetWidgetSize", data : "<value>" + vFinalBox.join(" ") + "</value>"}, cCPanel.instance.fSetWidgetEngineSizeReturn);
		//return;
		var o = setInterval(function() {
			i++;
			vCurrBox = [vCurrBox[0] + vStep[0], vCurrBox[1] + vStep[1], vCurrBox[2] + vStep[2], vCurrBox[3] + vStep[3]];
			var str = vCurrBox[0] + " " + vCurrBox[1] + " " + vCurrBox[2] + " " + vCurrBox[3];
			cProxy.xmlhttpPost("", "post", {cmd : "SetWidgetSize", data : "<value>" + str + "</value>"}, cCPanel.instance.fSetWidgetEngineSizeReturn);
			if (i == vStepCount)
				clearInterval(o);
		}, 20);
		*/
	});
	
}

cCPanel.prototype.fSetWidgetEngineSizeReturn = function(
	vData
)
{
fDbg("*** cCPanel, fSetWidgetEngineSizeReturn(), " + vData);
	$("#div_flashWidgetPlayer").show();
	$("#div_flashWidgetPlayer").css("left", "1000px");
	$("#div_flashWidgetPlayer").css("top", "520px");
	cCPanel.instance.fPlayWidget();
}


// -------------------------------------------------------------------------------------------------
//	fPlayWidget
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fPlayWidget = function(
)
{
fDbg("*** cCPanel, fPlayWidget(), ");
	cProxy.xmlhttpPost("", "post", {cmd : "PlayWidget", data : "<value>./widget1.swf</value>"}, cCPanel.instance.fPlayWidgetReturn);
}

cCPanel.prototype.fPlayWidgetReturn = function(
	vData
)
{
fDbg("*** cCPanel, fPlayWidgetReturn(), " + vData);
	
}


























// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	channel div functions
// 
// 
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
//	fShowChannelDiv
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fRefreshChannelDiv = function(
	vReturnFun
)
{
	var o, p, vWidgetList, vTransitionTime;
	var i;
	vTransitionTime = 500;
	
	if (!this.mModel)
		this.mModel = cModel.fGetInstance();
	
	if (!this.mModel.CURR_CHANNEL_INDEX)
		this.mModel.CURR_CHANNEL_INDEX = 0;
	if (!this.mModel.CURR_WIDGET_INDEX)
		this.mModel.CURR_WIDGET_INDEX = 0;

	vWidgetList = this.mModel.CHANNEL_LIST[this.mModel.CURR_CHANNEL_INDEX].mWidgetList;
	if ($("#img_flashWidgetMain_thumbnailPrev").attr("src") == "")
	{
		// show control panel MAIN div
		if (this.mModel.CURR_WIDGET_INDEX == 0)
			p = vWidgetList.length - 1;
		else
			p = this.mModel.CURR_WIDGET_INDEX - 1;
		cProxy.xmlhttpPost("", "post", {cmd: "GetJPG", data: "<value>" + vWidgetList[p].mWidget.mThumbnail.mHref + "</value>"}, function(vData) {
			vData = vData.split("<data><value>")[1].split("</value></data>")[0];
			$("#img_flashWidgetMain_thumbnailPrev").attr("src", "");
			$("#img_flashWidgetMain_thumbnailPrev").attr("src", vData);
		});
		
		cProxy.xmlhttpPost("", "post", {cmd: "GetJPG", data: "<value>" + vWidgetList[this.mModel.CURR_WIDGET_INDEX].mWidget.mThumbnail.mHref + "</value>"}, function(vData) {
			vData = vData.split("<data><value>")[1].split("</value></data>")[0];
			$("#img_flashWidgetMain_thumbnailCurr").attr("src", "");
			$("#img_flashWidgetMain_thumbnailCurr").attr("src", vData);
		});

		if (this.mModel.CURR_WIDGET_INDEX == vWidgetList.length - 1)
			p = 0;
		else
			p = this.mModel.CURR_WIDGET_INDEX + 1;
		cProxy.xmlhttpPost("", "post", {cmd: "GetJPG", data: "<value>" + vWidgetList[p].mWidget.mThumbnail.mHref + "</value>"}, function(vData) {
			vData = vData.split("<data><value>")[1].split("</value></data>")[0];
			$("#img_flashWidgetMain_thumbnailNext").attr("src", "");
			$("#img_flashWidgetMain_thumbnailNext").attr("src", vData);
		});
		
		$("#div_flashWidgetMain_title_container").html(vWidgetList[this.mModel.CURR_WIDGET_INDEX].mWidget.mName);
		$("#div_flashWidgetMain_description_container").html(vWidgetList[this.mModel.CURR_WIDGET_INDEX].mWidget.mDescription);


		if (vReturnFun)
			vReturnFun();
	}
	else
	{
		o = ["Prev", "Curr", "Next"];
		p = [
			parseFloat($("#div_flashWidgetMain_thumbnail" + o[0] + "_container").css("left").split("px")[0]),
			parseFloat($("#div_flashWidgetMain_thumbnail" + o[1] + "_container").css("left").split("px")[0]),
			parseFloat($("#div_flashWidgetMain_thumbnail" + o[2] + "_container").css("left").split("px")[0])
		];
		if (p[0] < p[1] && p[1] < p[2])
			o = ["Prev", "Curr", "Next"];
		else if (p[1] < p[2] && p[2] < p[0])
			o = ["Curr", "Next", "Prev"];
		else if (p[2] < p[0] && p[0] < p[1])
			o = ["Next", "Prev", "Curr"];
		
		if ((cModel.fGetInstance().CURR_WIDGET_INDEX < cModel.fGetInstance().PREV_WIDGET_INDEX && cModel.fGetInstance().PREV_WIDGET_INDEX - cModel.fGetInstance().CURR_WIDGET_INDEX == 1) ||
			(cModel.fGetInstance().CURR_WIDGET_INDEX == vWidgetList.length - 1 && cModel.fGetInstance().PREV_WIDGET_INDEX == 0))
		{
			if (this.mModel.CURR_WIDGET_INDEX == 0)
				i = vWidgetList.length - 1;
			else
				i = this.mModel.CURR_WIDGET_INDEX - 1;
			/*
			$.get('http://192.168.1.210/projects/0009.chumbyJSCore/test/test1.php?url=' + vWidgetList[i].mWidget.mThumbnail.mHref, function(data) {
				$("#img_flashWidgetMain_thumbnail" + o[2]).attr("src", "data:image/jpg;base64," + data);
			});
			*/
			cProxy.xmlhttpPost("", "post", {cmd: "GetJPG", data: "<value>" + vWidgetList[i].mWidget.mThumbnail.mHref + "</value>"}, function(vData) {
				vData = vData.split("<data><value>")[1].split("</value></data>")[0];
				$("#img_flashWidgetMain_thumbnail" + o[2]).attr("src", vData);
			});
			
			$("#div_flashWidgetMain_thumbnail" + o[2] + "_container").animate({
				left: "+=300"
			}, vTransitionTime / 2, function() {
				// Animation complete
			});
			$("#img_flashWidgetMain_thumbnail" + o[2]).animate({
				width: "-=100",
				height: "-=100"
			}, vTransitionTime / 2, function() {
					$("#img_flashWidgetMain_thumbnail" + o[2]).attr("src", "");
					$("#img_flashWidgetMain_thumbnail" + o[2]).attr("src", "./images/chumby_logo_48x48.png");
					$("#div_flashWidgetMain_thumbnail" + o[2] + "_container").css("left", "-100px");
					$("#div_flashWidgetMain_thumbnail" + o[2] + "_container").animate({
						left: "+=200"
					}, vTransitionTime, function() {
						// Animation complete
					});
					$("#img_flashWidgetMain_thumbnail" + o[2]).animate({
						width: "+=100",
						height: "+=100"
					}, vTransitionTime, function() {
						// Animation complete
					});
			});
			
			$("#div_flashWidgetMain_thumbnail" + o[0] + "_container").animate({
				left: "+=200",
				top: "-=15"
			}, vTransitionTime, function() {
				// Animation complete
			});
			$("#img_flashWidgetMain_thumbnail" + o[0]).animate({
				width: "+=40",
				height: "+=30"
			}, vTransitionTime, function() {
				// Animation complete
			});

			
			$("#div_flashWidgetMain_thumbnail" + o[1] + "_container").animate({
				left: "+=240",
				top: "+=15"
			}, vTransitionTime, function() {
				// Animation complete
			});
			$("#img_flashWidgetMain_thumbnail" + o[1]).animate({
				width: "-=40",
				height: "-=30"
			}, vTransitionTime, function() {
				// Animation complete
			});
		}
		else if ((cModel.fGetInstance().CURR_WIDGET_INDEX > cModel.fGetInstance().PREV_WIDGET_INDEX && cModel.fGetInstance().CURR_WIDGET_INDEX - cModel.fGetInstance().PREV_WIDGET_INDEX == 1) ||
			(cModel.fGetInstance().CURR_WIDGET_INDEX == 0 && cModel.fGetInstance().PREV_WIDGET_INDEX == vWidgetList.length - 1))
		{
			if (this.mModel.CURR_WIDGET_INDEX == vWidgetList.length - 1)
				i = 0;
			else
				i = this.mModel.CURR_WIDGET_INDEX + 1;
			/*
			$.get('http://192.168.1.210/projects/0009.chumbyJSCore/test/test1.php?url=' + vWidgetList[i].mWidget.mThumbnail.mHref, function(data) {
				$("#img_flashWidgetMain_thumbnail" + o[0]).attr("src", "data:image/jpg;base64," + data);
			});
			*/
			cProxy.xmlhttpPost("", "post", {cmd: "GetJPG", data: "<value>" + vWidgetList[i].mWidget.mThumbnail.mHref + "</value>"}, function(vData) {
				vData = vData.split("<data><value>")[1].split("</value></data>")[0];
				$("#img_flashWidgetMain_thumbnail" + o[0]).attr("src", vData);
			});
			
			$("#div_flashWidgetMain_thumbnail" + o[0] + "_container").animate({
				left: "-=300"
			}, vTransitionTime / 2, function() {
				// Animation complete
			});
			$("#img_flashWidgetMain_thumbnail" + o[0]).animate({
				width: "-=100",
				height: "-=100"
			}, vTransitionTime / 2, function() {
					$("#img_flashWidgetMain_thumbnail" + o[0]).attr("src", "");
					$("#img_flashWidgetMain_thumbnail" + o[0]).attr("src", "./images/chumby_logo_48x48.png");
					$("#div_flashWidgetMain_thumbnail" + o[0] + "_container").css("left", "840px");
					$("#div_flashWidgetMain_thumbnail" + o[0] + "_container").animate({
						left: "-=300"
					}, vTransitionTime, function() {
						// Animation complete
					});
					$("#img_flashWidgetMain_thumbnail" + o[0]).animate({
						width: "+=100",
						height: "+=100"
					}, vTransitionTime, function() {
						// Animation complete
					});
			});
			
			$("#div_flashWidgetMain_thumbnail" + o[1] + "_container").animate({
				left: "-=200",
				top: "+=15"
			}, vTransitionTime, function() {
				// Animation complete
			});

			$("#img_flashWidgetMain_thumbnail" + o[1]).animate({
				width: "-=40",
				height: "-=30"
			}, vTransitionTime, function() {
			});

			
			$("#div_flashWidgetMain_thumbnail" + o[2] + "_container").animate({
				left: "-=240",
				top: "-=15"
			}, vTransitionTime, function() {
				// Animation complete
			});

			$("#img_flashWidgetMain_thumbnail" + o[2]).animate({
				width: "+=40",
				height: "+=30"
			}, vTransitionTime, function() {
				
			});
		}

		
		$("#div_flashWidgetMain_title_container").html(vWidgetList[this.mModel.CURR_WIDGET_INDEX].mWidget.mName);
		$("#div_flashWidgetMain_description_container").html(vWidgetList[this.mModel.CURR_WIDGET_INDEX].mWidget.mDescription);
		
		if (vReturnFun)
			vReturnFun();
	}
}

// -------------------------------------------------------------------------------------------------
//	fShowChannelDiv
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fShowChannelDiv = function(
)
{
	$("#div_flashWidgetMain").show();
	$("#div_flashWidgetMain").css("left", "-800px");
	$("#div_flashWidgetMain").animate({
		left: "+=800"
	}, 200, function() {
		// Animation complete
	});
}

// -------------------------------------------------------------------------------------------------
//	fHideChannelDiv
// -------------------------------------------------------------------------------------------------
cCPanel.prototype.fHideChannelDiv = function(
)
{
	
}


