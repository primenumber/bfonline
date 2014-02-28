var bf_control = {
  state : "stop",
  bf_wrapper : null,
  intervalID : null,
  is_debug : true,
  Reset : function() {
    console.log("Reset");
    this.changeState("stop");
    if ($("#debug").attr("checked")) {
      this.EnableDebug();
    } else {
      this.DisableDebug();
    }
  },
  Run : function() {
    console.log("Run");
    this.changeState("run");
    var code = $("#code").val();
    var input = $("#inputdata").val();
    if (this.is_debug) {
      var interval = parseFloat($("#waittime").val());
      this.bf_wrapper = new BFWrapper(code, input);
      this.bf_wrapper.RunInterval(interval);
      var self = this;
      this.intervalID = setInterval(function(){self.reflesh();}, 100);
    } else {
      this.bf_wrapper = new BFWrapper(code, input);
      this.bf_wrapper.RunEndless();
      this.reflesh();
      this.changeState("stop");
    }
  },
  Stop : function() {
    console.log("Stop");
    this.changeState("pause");
    this.bf_wrapper.StopInterval();
    this.reflesh();
    clearInterval(this.intervalID);
  },
  Restart : function() {
    console.log("Restart");
    this.changeState("run");
    var interval = parseFloat($("#waittime").val());
    this.bf_wrapper.RestartInterval(interval);
    var self = this;
    this.intervalID = setInterval(function(){self.reflesh();}, 100);
  },
  Rollback : function() {
    console.log("Rollback");
    this.changeState("rollback");
  },
  RunOneStep : function() {
    if (this.bf_wrapper == null) {
      var code = $("#code").val();
      var input = $("#inputdata").val();
      this.bf_wrapper = new BFWrapper(code, input);
    }
    console.log("RunOneStep");
    this.changeState("run");
    this.bf_wrapper.RunOneStep();
    this.reflesh();
    this.changeState("pause");
  },
  EnableDebug : function() {
    this.is_debug = true;
    this.changeState("enable_debug");
  },
  DisableDebug : function() {
    this.is_debug = false;
    this.changeState("disable_debug");
  },
  ShowVersion : function() {
    alert("Online Brainf*ck Debugger\nVersion 3.0.0 (2014/02/10)\nprime@KMC");
  },
  changeState : function(new_state) {
    console.log("changeState:"+new_state);
    switch (new_state) {
     case "stop":
      $("#run").attr("disabled", false);
      $("#stop").attr("disabled", true);
      $("#restart").attr("disabled", true);
      $("#runstep").attr("disabled", !this.is_debug);
      $("#rollback").attr("disabled", true);
      break;
     case "run":
      $("#run").attr("disabled", true);
      $("#stop").attr("disabled", false);
      $("#restart").attr("disabled", true);
      $("#runstep").attr("disabled", true);
      $("#rollback").attr("disabled", true);
      break;
     case "rollback":
      break;
     case "pause":
      $("#run").attr("disabled", false);
      $("#stop").attr("disabled", true);
      $("#restart").attr("disabled", !this.is_debug);
      $("#runstep").attr("disabled", !this.is_debug);
      $("#rollback").attr("disabled", !this.is_debug);
      break;
     case "enable_debug":
     case "disable_debug":
      switch (bf_control.state) {
       case "stop":
        $("#runstep").attr("disabled", !this.is_debug);
        $("#rollback").attr("disabled", true);
        break;
       case "run":
        $("#runstep").attr("disabled", true);
        $("#rollback").attr("disabled", true);
        break;
       case "rollback":
        break;
       case "pause":
        $("#restart").attr("disabled", !this.is_debug);
        $("#runstep").attr("disabled", !this.is_debug);
        $("#rollback").attr("disabled", !this.is_debug);
        break;
      }
      return;
    }
    this.state = new_state;
  },
  reflesh : function() {
    console.log("reflesh");
    if (this.bf_wrapper.isEnded == true) {
      clearInterval(this.intervalID);
      this.intervalID = null;
      this.changeState("stop");
    }
    if ($("#outputdata").val() != this.bf_wrapper.bf_state.output) {
      $("#outputdata").val(this.bf_wrapper.bf_state.output);
    }
    var code_html = "";
    for (var i = 0; i < this.bf_wrapper.bf_state.code.length; i++) {
      if (i == this.bf_wrapper.bf_state.prog_ptr - 1){
        code_html += "<span style=\"color:#0FF\">";
      }
      switch (this.bf_wrapper.bf_state.code[i]) {
        case "<":
        code_html += "&lt;";
        break;
        case ">":
        code_html += "&gt;";
        break;
        case "+":
        case "-":
        case ",":
        case ".":
        case "[":
        case "]":
        code_html += this.bf_wrapper.bf_state.code[i];
        break;
      }
      if (i == this.bf_wrapper.bf_state.prog_ptr - 1){
        code_html += "</span>";
      }
    }
    $("#source").html(code_html);
    var ary_view_length = parseInt($("#memorysize").val());
    var mem_html = "";
    for (var i = 0; i < ary_view_length; i++) {
      if (i == this.bf_wrapper.bf_state.data_ptr) {
        mem_html += "<span style=\"color:#0FF\">";
      }
      var num_str = this.bf_wrapper.bf_state.data[i].toString(16);
      if (num_str.length < 2) {
        num_str = "0" + num_str;
      }
      mem_html += num_str;
      if (i == this.bf_wrapper.bf_state.data_ptr) {
        mem_html += "</span>";
      }
      mem_html += " ";
    }
    $("#memory").html(mem_html);
  }
};

onload = function() {
  $(document).delegate('#code', 'keydown', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode == 9) {
      e.preventDefault();
      var start = $(this).get(0).selectionStart;
      var end = $(this).get(0).selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      $(this).val($(this).val().substring(0, start)
        + "\t"
        + $(this).val().substring(end));

      // put caret at right position again
      $(this).get(0).selectionStart =
      $(this).get(0).selectionEnd = start + 1;
    }
  });
  bf_control.Reset();
}
