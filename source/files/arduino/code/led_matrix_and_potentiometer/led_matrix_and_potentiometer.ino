//www.elegoo.com
//2016.12.9

//We always have to include the library
#include "LedControl.h"

/*
 Now we need a LedControl to work with.
 ***** These pin numbers will probably not work with your hardware *****
 pin 12 is connected to the DataIn 
 pin 11 is connected to LOAD(CS)
 pin 10 is connected to the CLK 
 We have only a single MAX72XX.
 */
LedControl lc=LedControl(12,10,11,1);

/* image switching time */
unsigned long delaytime1=500;
unsigned long delaytime2=50;
void setup() {
  /*
   The MAX72XX is in power-saving mode on startup,
   we have to do a wakeup call
   */
  lc.shutdown(0,false);
  /* Set the brightness to a medium values */
  lc.setIntensity(0,0);
  /* and clear the display */
  lc.clearDisplay(0);

  Serial.begin(9600);
  Serial.print("device count");
  Serial.println(lc.getDeviceCount());
}

void loop() { 
   /* here is the data for the characters */
  lc.clearDisplay(0);
  byte a[]= {B00010000,
             B00010000,
             B00010000,
             B00010000,
             B00101000,
             B00101000,
             B01000100,
             B10000010,
             B00000001,
             B00000000,
             B00011000,
             B00000000,
             B00100000,
             B00000000,
             B00010000,
             B00000000,
             B00000100,
             B00001000,
             B00000000,
             B00100000,
             B00000000,
             B01001000,
             B00000000,
             B00010000,
             B00101000,
             B00000000,
             B00000000,
             B00000000,
             B01111110,
             B10000001,
             B01111110,
             B00000000,
             B00000001,
             B00000001,
             B11111111,
             B00000000,
             B00000001,
             B00000001,
             B11111111,
             B00000000,
             B10000001,
             B10010001,
             B11111111,
             B00000000,
             B11111111,
             B00010000,
             B00010000,
             B11111111,
             B00000000};

  int a_length = sizeof(a);
  int potValue  = analogRead(A0);
  int offset = min(map(potValue, 0, 1023, 0, a_length), a_length-8);
  Serial.println(offset);

  for(int row=0;row<8;row++) {
    lc.setRow(0,row,a[row+offset]);
    //delay(1);
  }
  //lc.clearDisplay(0);
  //delay(1);
}
