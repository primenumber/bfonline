BFWrapper = function(code, input) {
  this.bf_state = new BF(code, input);
  this.timerID = null;
  this.run_start_time = null;
  this.interval = null;
  this.steps = 0;
  this.isEnded = false;
  this.RunInterval = function(interval) {
    this.run_start_time = new Date;
    this.steps = 0;
    this.interval = interval;
    var self = this;
    this.timerID = setInterval(function(){self.run_steps();}, Math.max(20, interval));
  };
  this.StopInterval = function() {
    clearInterval(this.timerID);
    this.timreID = 0;
  };
  this.RestartInterval = function(interval) {
    this.RunInterval(interval);
  };
  this.run_steps = function() {
    var now_time = new Date;
    var elapsed = now_time - this.run_start_time;
    var need_steps = Math.floor(elapsed / this.interval);
    while (this.steps < need_steps) {
      this.steps++;
      if (!this.bf_state.RunOneStep()) {
        clearInterval(this.timerID);
        this.timerID = null;
        this.isEnded = true;
        break;
      }
    }
  };
  this.RunOneStep = function() {
    var is_end = !this.bf_state.RunOneStep();
    if (is_end) {
      this.isEnded = true;
    }
    return is_end;
  };
  this.RunEndless = function() {
    while(this.bf_state.RunOneStep());
  };
};
