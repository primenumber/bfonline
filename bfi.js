function BFI()
{
	this.codeary = new Array();
	this.codelen = 0;
	this.optary = new Uint32Array(0);
	this.input = "";
	this.inputpt = 0;
	this.i = 0;
	this.pt = 0;
	this.debug = true;
	this.ary = new Uint8Array();
	this.wait = 0;
	this.pause = false;
	this.running = false;
	this.outputstr = "";
}
BFI.prototype.init = function()
{
	var code = document.interpreter.code.value;
	this.codeary = new Array();
	var k = 0;
	for(var j = 0;j < code.length;j++)
	{
		switch(code[j])
		{
			case ">":
			this.codeary[k] = "&gt;";
			k++;
			break;
			case "<":
			this.codeary[k] = "&lt;";
			k++;
			break;
			case "+":
			case "-":
			case "[":
			case "]":
			case ",":
			case ".":
			case "@":
			this.codeary[k] = code[j];
			k++;
		}
	}
	this.codelen = this.codeary.length;
	this.optary = new Uint32Array(this.codelen);
	for(var j = 0;j < this.codelen;j++)
	{
		if(this.codeary[j] == "[")
		{
			var k = j+1;
			var cnt = 1;
			while(cnt != 0 && k < this.codelen)
			{
				if(this.codeary[k] == "[")
					cnt++;
				else if(this.codeary[k] == "]")
					cnt--;
				k++;
			}
			if(cnt != 0)
			{
				this.err("unmatched brackets");
				return;
			}
			else
			{
				this.optary[j] = k-1;
			}
		}
		else if(this.codeary[j] == "]")
		{
			var k = j-1;
			var cnt = -1;
			while(cnt != 0 && k < this.codelen)
			{
				if(this.codeary[k] == "[")
					cnt++;
				else if(this.codeary[k] == "]")
					cnt--;
				k--;
			}
			if(cnt != 0)
			{
				this.err("unmatched brackets");
				return;
			}
			else
			{
				this.optary[j] = k+1;
			}
		}
	}
	if(document.interpreter.inputtype[0].checked)
		this.input = document.interpreter.inputdata.value;
	else
	{
		this.input = new String;
		var inhex = String(document.interpreter.inputdata.value);
		var inputlen = inhex.length;
		for(var j = 0;j+1 < inputlen;j += 2)
		{
			var fst = inhex.charCodeAt(j);
			var snd = inhex.charCodeAt(j+1);
			var num = 0;
			if(48 <= fst && fst < 58)
				num += (fst-48)*16;
			else if(65 <= fst && fst < 71)
				num += (fst-55)*16;
			else if(97 <= fst && fst < 103)
				num += (fst-87)*16;
			if(48 <= snd && snd < 58)
				num += snd-48;
			else if(65 <= snd && snd < 71)
				num += snd-55;
			else if(97 <= snd && snd < 103)
				num += snd-87;
			this.input += String.fromCharCode(num);
		}
	}
	this.i = 0;
	this.ary = new Uint8Array(1000);
	this.pt = 0;
	this.inputpt = 0;
	this.debug = document.interpreter.isdebug[0].checked;
	this.wait = document.interpreter.waittime.value;
	document.getElementById("outputdata").value="";
	document.getElementById("memory").innerHTML="";
	document.getElementById("source").innerHTML = "";
	this.outputstr = "";
	this.running = true;
}
BFI.prototype.step = function()
{
	switch(this.codeary[this.i])
	{
		case "+":
		this.ary[this.pt]++;
		break;
		case "-":
		this.ary[this.pt]--;
		break;
		case "&gt;":
		this.pt++;
		break;
		case "&lt;":
		this.pt--;
		break;
		case ",":
		this.ary[this.pt]=input.charCodeAt(this.inputpt);
		this.inputpt++;
		break;
		case ".":
		if(this.debug || this.wait == 0)
			document.getElementById("outputdata").value += String.fromCharCode(this.ary[this.pt]);
		else
			this.outputstr += String.fromCharCode(this.ary[this.pt]);
		break;
		case "[":
		if(this.ary[this.pt] == 0)
			this.i = this.optary[this.i];
		break;
		case "]":
		if(this.ary[this.pt] != 0)
			this.i = this.optary[this.i];
		break;
		case "@":
		if(this.debug)this.stop();
		break;
	}
	this.i++;
}
BFI.prototype.dump = function()
{
	var size = document.interpreter.memorysize.value;
	var str = "";
	for(var j = 0;j < size;j++)
	{
		var s = this.ary[j].toString(16);
		if(s.length == 1)
			s="0"+s;
		if(j == this.pt)
			str += "<span style=\"color:#F00;\"> "+s+"</span>";
		else
			str += " "+s;
	}
	document.getElementById("memory").innerHTML = str;
	var str2 = "";
	for(var j = 0;j < this.codelen;j++)
	{
		if(j == this.i)
			str2 += "<span style=\"color:#0EE;\">"+this.codeary[j]+"</span>";
		else
			str2 += this.codeary[j];
	}
	document.getElementById("source").innerHTML = str2;
}
BFI.prototype.dostep = function(parent)
{
	if(parent.pause == false)
	{
		parent.step();
		if(parent.i == parent.codelen)
		{
			document.interpreter.run.disabled = false;
			document.interpreter.pause.disabled = true;
			document.interpreter.unpause.disabled = true;
			parent.running = false;
		}
		parent.dump();
	}
	else
	{
		clearInterval(parent.timer);
	}
}
BFI.prototype.err = function(str)
{
	document.getElementById("outputdata").value = "";
	document.getElementById("memory").innerHTML = "";
	document.getElementById("source").innerHTML = "";
	document.interpreter.run.disabled = false;
	document.interpreter.pause.disabled = true;
	document.interpreter.unpause.disabled = true;
	alert(str);
}
BFI.prototype.nodebug = function()
{
	while(this.i < this.codelen)this.step();
	document.getElementById("outputdata").value = this.outputstr;
	document.interpreter.run.disabled = false;
	document.interpreter.pause.disabled = true;
	document.interpreter.unpause.disabled = true;
	this.running = false;
}
BFI.prototype.run = function()
{
	this.init();
	this.start();
}
BFI.prototype.stop = function()
{
	this.pause = true;
	document.interpreter.run.disabled = false;
	document.interpreter.pause.disabled = true;
	document.interpreter.unpause.disabled = false;
}
BFI.prototype.start = function()
{
	document.interpreter.run.disabled = true;
	document.interpreter.pause.disabled = false;
	document.interpreter.unpause.disabled = true;
	this.pause = false;
	this.wait = document.interpreter.waittime.value;
	if(this.debug)
	{
		if(this.wait == 0)
		{
			while(this.i < this.codelen && !this.stp)this.step();
			document.getElementById("outputdata").value = this.outputstr;
			if(this.i == this.codelen)
			{
				document.interpreter.run.disabled = false;
				document.interpreter.pause.disabled = true;
				document.interpreter.unpause.disabled = true;
				this.running = false;
			}
		}
		else
		{
			this.timer = setInterval(this.dostep,this.wait,this);
		}
		this.dump();
	}
	else
	{
		this.nodebug();
	}
}
BFI.prototype.steprun = function()
{
	if(this.running == false)
		this.init();
	this.pause = false;
	this.dostep(this);
	if(this.running)
		this.stop();
}
BFI.prototype.restart = function()
{
	this.start();
}
BFI.prototype.showversion = function()
{
	alert("Online Brainf*ck Debugger\nVersion 2.0.0 (2013/08/29)\nprime@KMC");
}

function debug_on()
{
	document.interpreter.memorysize.disabled = false;
	document.interpreter.waittime.disabled = false;
	document.interpreter.step.disabled = false;
}

function debug_off()
{
	document.interpreter.memorysize.disabled = true;
	document.interpreter.waittime.disabled = true;
	document.interpreter.step.disabled = true;
}

bfi = new BFI();
