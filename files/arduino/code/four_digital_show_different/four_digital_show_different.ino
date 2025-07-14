//www.elegoo.com
//2016.12.12

// define the LED digit patterns
// 1 = LED on, 0 = LED off, in this order:
//                74HC595 pin     Q0,Q1,Q2,Q3,Q4,Q5,Q6,Q7 
//                Mapping to      a,b,c,d,e,f,g of Seven-Segment LED

int digit_position_input[] = {8,9,10,11};

byte pattern_digits[] = { B11111100,  // = 0
                              B01100000,  // = 1
                              B11011010,  // = 2
                              B11110010,  // = 3
                              B01100110,  // = 4
                              B10110110,  // = 5
                              B10111110,  // = 6
                              B11100000,  // = 7
                              B11111110,  // = 8
                              B11100110   // = 9
                             };
 
// connect to the ST_CP of 74HC595 (pin 3,latch pin)
int latchPin = 3;
// connect to the SH_CP of 74HC595 (pin 4, clock pin)
int clockPin = 4;
// connect to the DS of 74HC595 (pin 2)
int dataPin = 2;
 
void setup() {
  // Set latchPin, clockPin, dataPin as output
  pinMode(latchPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(dataPin, OUTPUT);

  for (int i=0; i<4; i++) {
    pinMode(digit_position_input[i], OUTPUT);
  }
}
 
// display on the digital segment display
void write_pattern(byte *array, int position_in_array) {
  // set the latchPin to low potential, before sending data
  digitalWrite(latchPin, LOW);
     
  // the original data (bit pattern)
  shiftOut(dataPin, clockPin, LSBFIRST, pattern_digits[position_in_array]);  
 
  // set the latchPin to high potential, after sending data
  digitalWrite(latchPin, HIGH);
}
 
void loop() {
   /*
    // Show a static 1234 number
    write_pattern(pattern_digits, 1);
    digitalWrite(digit_position_input[0], LOW);
    digitalWrite(digit_position_input[1], HIGH);
    digitalWrite(digit_position_input[2], HIGH);
    digitalWrite(digit_position_input[3], HIGH);
    delay(5);
    write_pattern(pattern_digits, 2);
    digitalWrite(digit_position_input[0], HIGH);
    digitalWrite(digit_position_input[1], LOW);
    digitalWrite(digit_position_input[2], HIGH);
    digitalWrite(digit_position_input[3], HIGH);
    delay(5);
    write_pattern(pattern_digits, 3);
    digitalWrite(digit_position_input[0], HIGH);
    digitalWrite(digit_position_input[1], HIGH);
    digitalWrite(digit_position_input[2], LOW);
    digitalWrite(digit_position_input[3], HIGH);
    delay(5);
    write_pattern(pattern_digits, 4);
    digitalWrite(digit_position_input[0], HIGH);
    digitalWrite(digit_position_input[1], HIGH);
    digitalWrite(digit_position_input[2], HIGH);
    digitalWrite(digit_position_input[3], LOW);
    delay(5);
  */
  for (int iterator = 0; iterator < 10000; ++iterator) {
    write_pattern(pattern_digits, iterator%10);
    digitalWrite(digit_position_input[0], HIGH);
    digitalWrite(digit_position_input[1], HIGH);
    digitalWrite(digit_position_input[2], HIGH);
    digitalWrite(digit_position_input[3], LOW);
    delay(5);
    write_pattern(pattern_digits, (iterator/10)%10);
    digitalWrite(digit_position_input[0], HIGH);
    digitalWrite(digit_position_input[1], HIGH);
    digitalWrite(digit_position_input[2], LOW);
    digitalWrite(digit_position_input[3], HIGH);
    delay(5);
    write_pattern(pattern_digits, (iterator/100)%10);
    digitalWrite(digit_position_input[0], HIGH);
    digitalWrite(digit_position_input[1], LOW);
    digitalWrite(digit_position_input[2], HIGH);
    digitalWrite(digit_position_input[3], HIGH);
    delay(5);
    write_pattern(pattern_digits, (iterator/1000)%10);
    digitalWrite(digit_position_input[0], LOW);
    digitalWrite(digit_position_input[1], HIGH);
    digitalWrite(digit_position_input[2], HIGH);
    digitalWrite(digit_position_input[3], HIGH);
    delay(5);
  }

}
