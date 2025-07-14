//www.elegoo.com
//2018.10.24
#include <Wire.h>
#include <DS3231.h>

DS3231 clock;
RTCDateTime dt;

#define DS1307_I2C_ADDRESS 0x68

// From: https://www.youtube.com/watch?v=SXnqI23XXxQ
// 00010000 to produce a 1 Hz square wave 
// from the SQW pin.  00010011 for 32.768 kHz.
// 00010001 for 4.096 kHz. and 00010010 for
// 8.192 kHz.  The square wave output
// can be viewed on an oscilloscope.   
byte ctrlRegBytes[] = {B00010000, B00010001, B00010010, B00010011};
int freqIdx = 0;

void setup()
{
  
  Wire.begin();
  Serial.begin(9600);

  Serial.println("Initialize RTC module");
  // Initialize DS3231
  clock.begin();

  
  // Manual (YYYY, MM, DD, HH, II, SS
  // clock.setDateTime(2016, 12, 9, 11, 46, 00);
  
  // Send sketch compiling time to Arduino
  clock.setDateTime(__DATE__, __TIME__);    
  /*
  Tips:This command will be executed every time when Arduino restarts. 
       Comment this line out to store the memory of DS3231 module
  */

  //clock.enableOutput(true);
  //clock.setOutput(DS3231_1HZ);

  initFreqDs1307();

  pinMode(8, INPUT_PULLUP);
}

void loop()
{
  dt = clock.getDateTime();
  Serial.print("GetOutput");
  Serial.print(clock.getOutput());
  Serial.print("; output is: ");
  Serial.print(digitalRead(8));
  Serial.print("; ");

  // For leading zero look to DS3231_dateformat example

  Serial.print("Raw data: ");
  Serial.print(dt.year);   Serial.print("-");
  Serial.print(dt.month);  Serial.print("-");
  Serial.print(dt.day);    Serial.print(" ");
  Serial.print(dt.hour);   Serial.print(":");
  Serial.print(dt.minute); Serial.print(":");
  Serial.print(dt.second); Serial.println("");

  delay(10);
}


// Convert normal decimal numbers to binary coded decimal
byte decToBcd(byte val)
{
  return ( (val/10*16) + (val%10) );
}

void initFreqDs1307()
{
  Wire.beginTransmission(DS1307_I2C_ADDRESS);  
   
  uint8_t ret = Wire.write(0);
   
  ret = Wire.write(decToBcd(B00000000));
  ret = Wire.endTransmission();

  setFreqDs1307();
}

void setFreqDs1307()
{ 
   byte ctrlRegByte = ctrlRegBytes[freqIdx]; 

   Wire.beginTransmission(DS1307_I2C_ADDRESS); 
   uint8_t ret = Wire.write(7);
   ret = Wire.write(ctrlRegByte);
   
   ret = Wire.endTransmission();
}
