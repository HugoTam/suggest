// @element为输入框
// @emailSuffixs为email后缀，不用传入at，可以以数组或者字符串的形式传入，默认一些国内的邮箱地址
// @showSuggest为用户输入@后执行
// @clickSuggest为用户点击、回车li后执行，如有判断邮件格式，需要输入函数判断条件防止点击、回车之后按照原来输入框的输入判断
// @noSuggest为用户输入并无联想后执行
// @eventType为点击li的类型，如优化了手机端tap事件可以传进去，冒泡事件为ture
// @note为ul第一行li的提示词，默认为”请选择邮件类型“
// @isMobile为true后，设置wrapper最大高度，以免手机屏幕不够区域显示
// @suggestLeft为ul的margin-left的负值，默认为0，为有div修饰的装饰input设置左偏移量
// @suggestWrapperWidth为ul的宽度，默认为真正的input的宽度，为有div修饰的装饰input设置宽度
function Suggest(options){
	utilityDomTool = {
		before: function(refEl,el){
	        refEl.parentNode.insertBefore(el,refEl);
	    },

	    after: function(refEl,el){
	        if(refEl.nextSibling){
	            this.before(refEl.nextSibling,el);
	        }else{
	            refEl.parentNode.appendChild(el);
	        }
	    },

	    isArray: function(obj){  
			return Object.prototype.toString.call(obj) === '[object Array]';   
		}
	}

	var uDT = utilityDomTool;

	// 传入参数
	var element = options.element,
		emailSuffixs = options.emailSuffixs || ["126.com","163.com","qq.com","yeah.net","foxmail.com","gmail.com","sina.com","yahoo.com"],
		eventType = options.eventType || "click",
		showSuggest = options.showSuggest || null,
		clickSuggest = options.clickSuggest || null,
		noSuggest = options.noSuggest || null,
		note = options.note || "请选择邮件类型",
		isMobile = options.isMobile || false;
		suggestLeft = options.left || false;
		suggestWrapperWidth = options.width || false;

	var suggestion = "";
	var hasAt = false;
	var hasSuggest = false;

	// 建立ul包裹suggest
	var suggestList = document.createElement("ul"),
		suggestWrapper = document.createElement("ul"),
		suggestNote = document.createElement("li");

		// 加类
		suggestNote.classList.add("note");
		suggestWrapper.classList.add("sI-suggest-wrapper");
		suggestList.classList.add("sI-suggest-list");

		if(isMobile){
			suggestWrapper.classList.add("mobile");
		}

		// DOM插入
		suggestWrapper.appendChild(suggestNote);
		suggestWrapper.appendChild(suggestList);
		uDT.after(element,suggestWrapper);

		// 默认联想宽度等于input宽度
		// 有些input并不是真正的input，而是用div包裹装饰的，里面真正的input并没有外观上的这么宽
		// 所以要上传宽度
		var suggestWW = suggestWrapperWidth ? suggestWrapperWidth : element.offsetWidth;
		suggestWrapper.style.width = suggestWW + "px";

		var suggestML = suggestLeft ? suggestLeft : 0;
		suggestWrapper.style.marginLeft = -suggestML + "px"
		


		// 为suggestNote插入提示语
		suggestNote.innerHTML = note;

	element.addEventListener("keyup",function(event){
		// 非上下和回车
		if(event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13){
			// 按方向上下
			if(hasAt){
				// 上下选择li，并为其加上active类
				var allSuggest = suggestList.querySelectorAll(".suggest");
				var activeSuggest = suggestList.querySelector(".suggest.active");

				if(allSuggest.length===0 || !activeSuggest){

				}else{
					activeSuggest.classList.remove("active");
					if(event.keyCode===40){
						// 下
						var next = activeSuggest.nextSibling;
						// 如果不是最后一个
						if(next !== null){
							next.classList.add("active");
						}else{
							allSuggest[0].classList.add("active");
						}
					}else if(event.keyCode===38){
						// 上
						var previous = activeSuggest.previousSibling;
						// 如果不是第一个
						if(previous !== null){
							previous.classList.add("active");
						}else{
							allSuggest[allSuggest.length-1].classList.add("active");
						}
					}else if(event.keyCode===13){
						// 回车，将联想输进输入框
						var target = activeSuggest;
						var suggestText = target.innerText;
						element.value = suggestText;
						if(clickSuggest){
							(clickSuggest());
						}
						suggestWrapper.classList.remove("associate");

					}
				}
			}
		}else{
			if(element.value.indexOf("@")>-1){
				var inputText = element.value,
					inputLength = inputText.length,
					atIndex = inputText.indexOf("@"),
					name = inputText.substring(0,atIndex),
					// 输入的email部分，不包括at
					// 如果只输入到@的部位，则为空字符串
					inputEmailPart = inputText.substring(atIndex+1,inputLength),
					// li集合
					suggestion = "";

				// 判断有联想的邮箱后缀是否在最后
				if(emailSuffixs && uDT.isArray(emailSuffixs)){
					// 遍历每条
					for(var i=0,j=0;i<emailSuffixs.length;i++){
						var emailSuffix = emailSuffixs[i];
						// 用户输入的是否有联想，如果有值为0；否则为-1；
						// 如果只输入到@，因为判断的是空字符串，所以值也为0
						// 这个值加一后分别为1（真）和0（假）
						var boolean = emailSuffix.indexOf(inputEmailPart)+1;
						// 开始判断
						if(boolean){
							// 创建li
							var suggest = "<li class=\"suggest\">"+ name +"@"+ emailSuffix +"</li>";
							// 为第一个li添加active，j为判断符合的个数
							j++;
							if(j===1){
								suggest = "<li class=\"suggest active\">"+ name +"@"+ emailSuffix +"</li>";

							}
							suggestion += suggest;
						}
						if(j===0){
							hasSuggest = false;
						}else{
							hasSuggest = true;
						}
						
					}

				}else if(emailSuffixs && !uDT.isArray(emailSuffixs)){
					// 非数组，同上
					var emailSuffix = emailSuffixs;
					var boolean = emailSuffix.indexOf(inputEmailPart)+1;
					// 开始判断
					if(boolean){
						// 创建li
						var suggest = "<li class=\"suggest\">"+ name +"@"+ emailSuffix +"</li>";
						suggestion += suggest;
					}
					
				}
				hasAt = true;

			}else{
				hasAt = false;
				if(noSuggest){
					(noSuggest());
				}
				// suggestList上次的信息清零
				suggestList.innerHTML = "";
				suggestWrapper.classList.remove("associate");

			}

			if(hasAt){
				// 将li替代wrapper的html，建议 suggestList中再包一个wrapper来放提示词
				suggestList.innerHTML = suggestion;
				// 显示联想，并执行第一个传入函数
				suggestWrapper.classList.add("associate");
				if(showSuggest){
					(showSuggest());
				}
				// 关闭联想，并执行第二个联想
				if(!hasSuggest){
					if(noSuggest){
						(noSuggest());
					}
					suggestWrapper.classList.remove("associate");
				}

				// 暂未hack
				// 点击li，将内容传入input输入框后，执行第二个fn
				// 执行了冒泡事件
				suggestList.addEventListener(eventType, function(event){
					var target = event.target;
					var suggestText = target.innerText;
					element.value = suggestText;
					if(clickSuggest){
						(clickSuggest());
					}
				},true);

				// 失去焦点
				// 用setTimeout来避免click事件无法执行
				element.addEventListener("blur", function(event){
					setTimeout(function(){
						suggestWrapper.classList.remove("associate");
					},150);
				},false);

			}
		}
	},false);
}