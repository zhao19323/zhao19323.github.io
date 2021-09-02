var moveZ = {};

moveZ.timeScroll = null;  //挂载整屏切换动画的实例

moveZ.currentStep = "step1";

moveZ.init = function(){

	moveZ.resize(); //设置每一屏的高度和top值

	moveZ.events(); //配置事件

	moveZ.configIntAnimate();//配置导航条的动画

	moveZ.button3D(".start",".state1",".state2",0.3);
	moveZ.button3D(".button1",".state1",".state2",0.3);
	moveZ.button3D(".button2",".state1",".state2",0.3);

	//设置每一屏中img的百分比

	moveZ.imgWidth($(".scene images"));

	moveZ.configTimeScroll(); //配置横屏切换的动画

	twoAnimate.init(); //执行第二屏里面的动画
	threeAnimate.init();//执行第三屏里面的动画
	fiveAnimate.init(); //执行第三五屏里面的动画
}

$(document).ready( moveZ.init );

//配置事件
moveZ.events = function(){
	

	moveZ.nav(); //执行导航条的鼠标移入移除的动画

	$(window).bind("scroll",scrollFn);

	function scrollFn(){
		$(window).scrollTop(0);
	}
	//在滚动条滚动的过程中，计算页面中应该到哪一个时间点上去
	$(window).bind("scroll",moveZ.scrollStatus);

	//当mousedown的时候，解除scroll事件对应的scrollFn

	$(window).bind("mousedown",function(){
		$(window).unbind("scroll",scrollFn);
	});

	//当mouseup的时候，让当前这一屏到达某个状态

	$(window).bind("mouseup",moveZ.mouseupFn)

	//干掉浏览器默认的滚动行为

	$(".wrapper").bind("mousewheel",function(ev){
		if($(window).width()>780) ev.preventDefault();
	});

	$(".wrapper").one("mousewheel",mousewheelFn);

	var timer = null;
	function mousewheelFn(ev,direction){
		$(window).unbind("scroll",scrollFn);
		if( direction<1 ){  //向下滚动
			//console.log("next");
			moveZ.changeStep("next");
		}else{  //向上滚动
			console.log("prev");
			moveZ.changeStep("prev");
		};
		clearTimeout(timer);
		timer = setTimeout(function(){
			if( $(window).width() > 780 ){
				$(".wrapper").one("mousewheel",mousewheelFn);
			}
			
		},1200)
	}

	$(window).resize( moveZ.resize );


};
//当mouseup的时候，让当前这一屏到达某个状态
moveZ.mouseupFn = function(){
	//在滚动过程中计算出一个比例
	var scale = moveZ.scale();
	//得到当前页面到达的某个时间点
	var times = scale * moveZ.timeScroll.totalDuration();

	//获取到上一个状态和下一个状态
	var prevStep = moveZ.timeScroll.getLabelBefore(times);
	var nextStep = moveZ.timeScroll.getLabelAfter(times);

	//获取到上一个状态的时间和下一个状态的时间
	var prevTime = moveZ.timeScroll.getLabelTime(prevStep);
	var nextTime = moveZ.timeScroll.getLabelTime(nextStep);

	//计算差值
	var prevDvalue = Math.abs( prevTime - times );
	var nextDvalue = Math.abs( nextTime - times );

	/*
		如果scale为0 
			step1
		如果scale为1
			step5 
		如果 prevDvalue < nextDvalue
			prevStep
		如果 prevDvalue > nextDvalue
			nextStep
	*/
	var step = "";
	if( scale === 0 ){
		step = "step1"
	}else if( scale === 1 ){
		step = "footer"
	}else if(prevDvalue < nextDvalue){
		step = prevStep;
	}else{
		step = nextStep;
	};

	moveZ.timeScroll.tweenTo(step);
	//获取动画的总时长
	var totalTime = moveZ.timeScroll.totalDuration();
	//获取到要到达的状态的时间
	var afterTime = moveZ.timeScroll.getLabelTime(step);
	//获取到滚动条能够滚动的最大的高度
	var maxH = $("body").height() - $(window).height();
	//计算出滚动条滚动的距离
	var positionY = afterTime/totalTime * maxH;
	//滚动条滚动的距离的持续时间
	var d = Math.abs( moveZ.timeScroll.time() - afterTime );

	var scrollAnimate = new TimelineMax();

	scrollAnimate.to("html,body",d,{scrollTop:positionY});

	moveZ.currentStep = step;
}

//计算滚动条在滚动过程中的一个比例

moveZ.scale = function(){
	var scrollT = $(window).scrollTop();
	var MaxH = $("body").height() - $(window).height();
	var s = scrollT/MaxH;
	return s;
}

//在滚动条滚动的过程中，计算页面中应该到哪一个时间点上去
moveZ.scrollStatus = function (){
	var times = moveZ.scale() * moveZ.timeScroll.totalDuration();
	//当滚动条在滚动的过程中，让页面中的动画到打某个时间点
	moveZ.timeScroll.seek(times,false);
}

//切换整屏并且计算滚动条的距离

moveZ.changeStep = function(value){
	if( value === "next" ){ //向下切换

		//获取当前的时间
		var currentTime = moveZ.timeScroll.getLabelTime(moveZ.currentStep);

		//获取到下一个状态的字符串
		var afterStep = moveZ.timeScroll.getLabelAfter(currentTime);

		if( !afterStep ) return;

		//获取动画的总时长
		var totalTime = moveZ.timeScroll.totalDuration();
		//获取到下一个状态的时间
		var afterTime = moveZ.timeScroll.getLabelTime(afterStep);
		//获取到滚动条能够滚动的最大的高度
		var maxH = $("body").height() - $(window).height();

		//计算出滚动条滚动的距离
		var positionY = afterTime/totalTime * maxH;
		//滚动条滚动的距离的持续时间
		var d = Math.abs( moveZ.timeScroll.time() - afterTime );

		var scrollAnimate = new TimelineMax();

		scrollAnimate.to("html,body",d,{scrollTop:positionY});

		//运动到下一个状态

		//moveZ.timeScroll.tweenTo(afterStep);
		//记录当前的状态为下一个状态，方便继续切换到下一个状态上
		moveZ.currentStep = afterStep;

	}else{ //向上切换

		//获取当前的时间
		var currentTime = moveZ.timeScroll.getLabelTime(moveZ.currentStep);

		//获取到上一个状态的字符串
		var beforeStep = moveZ.timeScroll.getLabelBefore(currentTime);

		if( !beforeStep ) return;

		//获取动画的总时长
		var totalTime = moveZ.timeScroll.totalDuration();
		//获取到下一个状态的时间
		var BeforeTime = moveZ.timeScroll.getLabelTime(beforeStep);
		//获取到滚动条能够滚动的最大的高度
		var maxH = $("body").height() - $(window).height();

		//计算出滚动条滚动的距离
		var positionY = BeforeTime/totalTime * maxH;
		//滚动条滚动的距离的持续时间
		var d = Math.abs( moveZ.timeScroll.time() - BeforeTime );

		var scrollAnimate = new TimelineMax();

		scrollAnimate.to("html,body",d,{scrollTop:positionY});

		//运动到上一个状态

		//moveZ.timeScroll.tweenTo(beforeStep);
		//记录当前的状态为上一个状态，方便继续切换到上一个状态上
		moveZ.currentStep = beforeStep;
	}
}

//配置整屏切换的动画以及每一屏中的小动画

moveZ.configTimeScroll = function(){

	var time = moveZ.timeScroll ? moveZ.timeScroll.time() : 0;

	if( moveZ.timeScroll ) moveZ.timeScroll.clear();

	moveZ.timeScroll = new TimelineMax();

		// 当从第二屏切换到第一屏的时候，让第二屏里面的动画时间点重归0
		moveZ.timeScroll.to(".scene1",0,{onReverseComplete:function(){
			twoAnimate.timeline.seek(0,false);
		}},0);

		moveZ.timeScroll.to(".footer",0,{top:"100%"});

		moveZ.timeScroll.add("step1");

	moveZ.timeScroll.to(".scene2",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
			threeAnimate.timeline.seek(0,false);
		}});
	moveZ.timeScroll.to({},0.1,{onComplete:function(){
			menu.changeMenu("menu_state2");  //切换到第二屏调用的函数，同时传入导航条背景颜色变化的class名字
		},onReverseComplete:function(){
			menu.changeMenu("menu_state1");
		}},"-=0.2");
	moveZ.timeScroll.to({},0.1,{onComplete:function(){
			threeAnimate.timeline.tweenTo("threeSate1");
		}},"-=0.2");

	moveZ.timeScroll.add("step2");

	// --- 主动画中配置第二萍的小动画 end


	moveZ.timeScroll.to(".scene3",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
		threeAnimate.timeline.seek(0,false);
	}});
	moveZ.timeScroll.to({},0.1,{onComplete:function(){
		menu.changeMenu("menu_state3");  //切换到第二屏调用的函数，同时传入导航条背景颜色变化的class名字
	},onReverseComplete:function(){
		menu.changeMenu("menu_state2");
	}},"-=0.2");
	moveZ.timeScroll.to({},0.1,{onComplete:function(){
		threeAnimate.timeline.tweenTo("threeSate1");
	}},"-=0.2");
		moveZ.timeScroll.add("step3");

	var Pop = document.getElementById("popup");
	var Dele = document.getElementById("dele");



	moveZ.timeScroll.to(".scene4",0.8,{top:0,ease:Cubic.easeInOut});
		moveZ.timeScroll.add("step4");

	//滚动到第五屏的时候，要让第四屏滚出屏幕外
	moveZ.timeScroll.to(".scene4",0.8,{top:0,ease:Cubic.easeInOut});
	//当可视区域大于950，那么就让导航条隐藏起来
	if($(window).width()>950){
		moveZ.timeScroll.to(".menu_wrapper",0.8,{top:-110,ease:Cubic.easeInOut},"-=0.8");
	}else{
		$(".menu_wrapper").css("top",0);
	}

	moveZ.timeScroll.to(".scene5",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
		fiveAnimate.timeline.seek(0,false);
	}},"-=0.8");
	moveZ.timeScroll.to({},0.1,{onComplete:function(){
		fiveAnimate.timeline.tweenTo("fiveState");
	}},"-=0.2");
		moveZ.timeScroll.add("step5");

	moveZ.timeScroll.to(".scene5",0.5,{top:-$(".footer").height(),ease:Cubic.easeInOut});
	moveZ.timeScroll.to(".footer",0.5,{top:$(window).height()-$(".footer").height(),ease:Cubic.easeInOut},"-=0.5");

		moveZ.timeScroll.add("footer");

	moveZ.timeScroll.stop();
	//当改变浏览器的大小时，让动画走到之前已经到达的时间点
	moveZ.timeScroll.seek(time);
}

//配置导航条的动画
moveZ.configIntAnimate = function(){
	var initAnimate = new TimelineMax();

	initAnimate.to( ".menu",0.5,{opacity:1} );
	initAnimate.to( ".menu",0.5,{left:22},"-=0.3" );
	initAnimate.to( ".nav",0.5,{opacity:1} );

	//设置首屏的动画

	initAnimate.to(".scene1_logo",0.5,{opacity:1});
	initAnimate.staggerTo( ".scene1_1 images",2,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2 );
	initAnimate.to(".light_left",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=2");
	initAnimate.to(".light_right",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=2");
	initAnimate.to(".controls",0.5,{bottom:20,opacity:1},"-=0.7");

	initAnimate.to("body",0,{"overflow-y":"scroll"});
}

// 导航条中的动画

moveZ.nav = function(){
	var navAnimate = new TimelineMax();
	$(".nav a").bind("mouseenter",function(){
		var w = $(this).width();
		var l = $(this).offset().left;
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:1,left:l,width:w});
	});

	$(".nav a").bind("mouseleave",function(){
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:0});
	});

	//鼠标移入 language 要显示 dropdown

	var languageAinimate = new TimelineMax();

	$(".language").bind("mouseenter",function(){
		languageAinimate.clear();
		languageAinimate.to(".dropdown",0.5,{opacity:1,"display":"block"});
	});

	$(".language").bind("mouseleave",function(){
		languageAinimate.clear();
		languageAinimate.to(".dropdown",0.5,{opacity:0,"display":"none"});
	});

	//调出左侧的导航条

	$(".btn_mobile").click(function(){
		var m_aimate = new TimelineMax();
		m_aimate.to(".left_nav",0.5,{left:0});
	});

	$(".l_close").click(function(){
		var l_aimate = new TimelineMax();
		l_aimate.to(".left_nav",0.5,{left:-300});
	})

};

// 3D翻转效果
moveZ.button3D = function(obj,element1,element2,d){
	var button3DAnimate = new TimelineMax();

	button3DAnimate.to( $(obj).find(element1),0,{rotationX:0,transformPerspective:600,transformOrigin:"center bottom"} );
	button3DAnimate.to( $(obj).find(element2),0,{rotationX:-90,transformPerspective:600,transformOrigin:"top center"} );

	$(obj).bind("mouseenter",function(){
		var enterAnimate = new TimelineMax();

		var ele1 = $(this).find(element1);
		var ele2 = $(this).find(element2);

		enterAnimate.to(ele1,d,{rotationX:90,top:-ele1.height(),ease:Cubic.easeInOut},0);
		enterAnimate.to(ele2,d,{rotationX:0,top:0,ease:Cubic.easeInOut},0);
	});

	$(obj).bind("mouseleave",function(){
		var leaveAinimate = new TimelineMax();

		var ele1 = $(this).find(element1);
		var ele2 = $(this).find(element2);

		leaveAinimate.to(ele1,d,{rotationX:0,top:0,ease:Cubic.easeInOut},0);
		leaveAinimate.to(ele2,d,{rotationX:-90,top:ele2.height(),ease:Cubic.easeInOut},0);
	});
}

//设置每一屏的高度和top值
moveZ.resize = function(){

	$(".scene").height( $(window).height() )// 设置每一屏的height
	$(".scene:not(':first')").css("top",$(window).height());

	moveZ.configTimeScroll();

	if( $(window).width() <= 780 ){

		$(".wrapper").unbind();
		$(window).unbind("mousewheel");
		$(window).unbind("scroll");
		$(window).unbind("mousedown");
		$(window).unbind("mouseup");

		$("body").css("height","auto");
		$("body").addClass("r780 r950").css("overflow-y","scroll");

		$(".menu").css("top",0);
		$(".menu").css("transform","none");
		$(".menu_wrapper").css("top",0);

		$(".menu").removeClass("menu_state2");
		$(".menu").removeClass("menu_state3");

	}else if( $(window).width() <= 950 ){
		$("body").css("height",8500);
		$("body").removeClass("r780").addClass("r950");
		$(".menu").css("top",0);
		$(".menu").css("transform","none");
	}else{
		$("body").removeClass("r780 r950");
		$("body").css("height",8500);
		$("body").removeClass("r950");
		$(".menu").css("top",22);
		$(".left_nav").css("left",-300);
	}

};

//设置img的百分比

moveZ.imgWidth = function(elementImg){
	elementImg.each(function(){
		$(this).load(function(){
			width = $(this).width();

			$(this).css({
				width:"100%",
				"max-width":width,
				height:"auto"
			})
		})
	})
}

// 配置第二屏的动画
var twoAnimate = {};

twoAnimate.timeline = new TimelineMax();

//具体的第二屏里面动画要实现的细节
twoAnimate.init = function(){
	twoAnimate.timeline.staggerTo(".scene2_1 images",1.5,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.1);
	twoAnimate.timeline.to(".points",0.2,{bottom:20},"-=1");

	//初始第一个按钮
	twoAnimate.timeline.to(".scene2 .point0 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point0 .point_icon",0,{"background-position":"right top"});


		twoAnimate.timeline.add("state1");

	twoAnimate.timeline.staggerTo(".scene2_1 images",0.2,{opacity:0,rotationX:90},0);

	twoAnimate.timeline.to(".scene2_2 .left",0.4,{opacity:1});
	twoAnimate.timeline.staggerTo(".scene2_2 .right images",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4");

	//第二个按钮

	twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point1 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point1 .point_icon",0,{"background-position":"right top"},"-=0.4");

		twoAnimate.timeline.add("state2");

	twoAnimate.timeline.to(".scene2_2 .left",0.4,{opacity:0});
	twoAnimate.timeline.staggerTo(".scene2_2 .right images",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4");
	twoAnimate.timeline.to(".scene2_3 .left",0.4,{opacity:1});
	twoAnimate.timeline.staggerTo(".scene2_3 .right images",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4");

	//第三个按钮

	twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point2 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point2 .point_icon",0,{"background-position":"right top"},"-=0.4");

		twoAnimate.timeline.add("state3");

	twoAnimate.timeline.to(".scene2_3 .left",0.4,{opacity:0});
	twoAnimate.timeline.staggerTo(".scene2_3 .right images",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4");
	twoAnimate.timeline.to(".scene2_4 .left",0.4,{opacity:1});
	twoAnimate.timeline.staggerTo(".scene2_4 .right images",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4");

	//第三个按钮

	twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point3 .text",0.1,{opacity:1});
	twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
	twoAnimate.timeline.to(".scene2 .point3 .point_icon",0,{"background-position":"right top"},"-=0.4");

		twoAnimate.timeline.add("state4");

	twoAnimate.timeline.stop();
};

// 配置第三屏动画
var threeAnimate = {};

threeAnimate.timeline = new TimelineMax();

threeAnimate.init = function(){
	//把第三屏里面的所有的图片翻转-90，透明度设为0
	threeAnimate.timeline.to(".scene3 .step images",0,{rotationX:-90,opacity:0,transformPerspective:600,transformOrigin:"center center"});

	threeAnimate.timeline.staggerTo(".step3_1 images",0.2,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0.1);

	threeAnimate.timeline.add("threeSate1");

	threeAnimate.timeline.to(".step3_1 images",0.3,{opacity:0,rotationX:-90,ease:Cubic.easeInOut});
	threeAnimate.timeline.to(".step3_2 images",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut});

	threeAnimate.timeline.add("threeSate2");

	threeAnimate.timeline.stop();
}

//配置第五屏的动画
var fiveAnimate = {};

fiveAnimate.timeline = new TimelineMax();

fiveAnimate.init = function(){
	//把所有图片和button翻转-90，透明度变为0，scene5_img的top初始为-220

	fiveAnimate.timeline.to(".scene5 .area_content images, .scene5 .button1,.scene5 .button2",0,{rotationX:-90,transformPerspective:600,transformOrigin:"center center"});
	fiveAnimate.timeline.to(".scene5 .scene5_img",0,{top:-220});

	fiveAnimate.timeline.to(".scene5 .scene5_img",0.5,{top:0,ease:Cubic.easeInOut});
	fiveAnimate.timeline.staggerTo( ".scene5 .button1,.scene5 .button2,.scene5 .area_content images",1.2,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2 );

	fiveAnimate.timeline.to(".scene5 .lines",0.5,{opacity:1});
		fiveAnimate.timeline.add("fiveState");

	fiveAnimate.timeline.stop();


}



//实现导航条3D翻转动画
var menu = {};

//每滚动一屏的时候，就调用这个函数，函数里面是3D翻转的具体实现细节
menu.changeMenu = function( stateClass ){ //参数的作用：切换到某一屏的时候，要传入的class名字
	
	//具体实现3D翻转效果
	var oldMenu = $(".menu");
	var newMenu = oldMenu.clone();
	newMenu.removeClass("menu_state1").removeClass("menu_state2").removeClass("menu_state3");
	newMenu.addClass( stateClass );

	$(".menu_wrapper").append(newMenu);

	oldMenu.addClass("removeClass");
	
	moveZ.nav();
	moveZ.button3D(".start",".state1",".state2",0.3);

	var menuAnimate = new TimelineMax();
	//如果可视区域大于950，才让导航条有一个3D翻转过程
	if( $(window).width() > 950 ){
		menuAnimate.to( newMenu,0,{top:100,rotationX:-90,transformPerspective:600,transformOrigin:"top center"} );
		menuAnimate.to( oldMenu,0,{rotationX:0,top:22,transformPerspective:600,transformOrigin:"center bottom"} );

		menuAnimate.to( oldMenu,0.3,{rotationX:90,top:-55,ease:Cubic.easeInOut,onComplete:function(){
			$(".removeClass").remove();
		}} );

		menuAnimate.to(newMenu,0.3,{rotationX:0,top:22,ease:Cubic.easeInOut},"-=0.3")
	}

	
}

