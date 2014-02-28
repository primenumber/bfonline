function BF(code, input) {
  this.output = "";
  this.code = code;
  this.input = input;
  this.data = new Uint8Array(1024);
  this.prog_ptr = 0;
  this.input_ptr = 0;
  this.data_ptr = 0;
  this.RunOneStep = function() {
    switch(this.code[this.prog_ptr]) {
     case "+":
      this.data[this.data_ptr]++;
      break;
     case "-":
      this.data[this.data_ptr]--;
      break;
     case ">":
      this.data_ptr++;
      break;
     case "<":
      this.data_ptr--;
      break;
     case ",":
      this.data[this.data_ptr] = this.input[this.input_ptr];
      this.input_ptr++;
      break;
     case ".":
      this.output += String.fromCharCode(this.data[this.data_ptr]);
      break;
     case "[":
      if (this.data[this.data_ptr] == 0) {
        var count = 1;
        while (count != 0) {
          this.prog_ptr++;
          if (this.code[this.prog_ptr] == "[") {
            count++;
          } else if (this.code[this.prog_ptr] == "]") {
            count--;
          }
        }
      }
      break;
     case "]":
      if (this.data[this.data_ptr] != 0) {
        var count = -1;
        while (count != 0) {
          this.prog_ptr--;
          if (this.code[this.prog_ptr] == "[") {
            count++;
          } else if (this.code[this.prog_ptr] == "]") {
            count--;
          }
        }
      }
      break;
     default:
    }
    this.prog_ptr++;
    if (this.prog_ptr >= this.code.length) {
      return false;
    }
    return true;
  };
};
