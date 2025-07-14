//www.elegoo.com
//2016.12.12

// define the LED digit patterns
// 1 = LED on, 0 = LED off, in this order:
//                74HC595 pin     Q0,Q1,Q2,Q3,Q4,Q5,Q6,Q7 
//                Mapping to      a,b,c,d,e,f,g of Seven-Segment LED
byte pattern_rotation[] = {  B10000000,
                              B01000000,
                              B00100000,
                              B00010000,
                              B00001000,
                              B00000100,
                             };
byte pattern_figure_eight_rotation[] = {  
                              B10000000,
                              B01000000,
                              B00000010,
                              B00001000,
                              B00010000, 
                              B00100000,
                              B00000010, 
                              B00000100,
                             };

byte another_pattern[] = {  
                              B00010000,
                              B00000001,
                              B00000010,
                              B00000001,
                              B10000000,
                              B00000001,
                              B00000000,
                              B00000001,
                              B00000000,
                              B00000001,
                              B00000000,
                              B00101000,
                              B01101100,
                              B00000000,
                              B00101000,
                              B01101100,
                              B00000000,
                              B00101000,
                              B01101100,
                              B00000000,
                              B10000000,
                              B00000010,
                              B00010000,
                              B10000000,
                              B10000010,
                              B10010010,
                              B01101100,
                              B10010010,
                              B01101100,
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
}
 
// display on the digital segment display
void write_pattern(byte *array, int position_in_array) {
  // set the latchPin to low potential, before sending data
  digitalWrite(latchPin, LOW);
     
  // the original data (bit pattern)
  shiftOut(dataPin, clockPin, LSBFIRST, array[position_in_array]);  
 
  // set the latchPin to high potential, after sending data
  digitalWrite(latchPin, HIGH);
}
 
void loop() {
  for (int iterator = 0; iterator < sizeof(another_pattern); ++iterator) {
    delay(350);
    write_pattern(another_pattern, iterator); 
  }
}
