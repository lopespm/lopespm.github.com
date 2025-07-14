// MPU-6050 Short Example Sketch
//www.elegoo.com
//2016.12.9

#include<Wire.h>
const int MPU_addr=0x68;  // I2C address of the MPU-6050
int16_t AcX,AcY,AcZ,Tmp,GyX,GyY,GyZ;

int pinInterrupt = 6;
int pinLed = 3;

void setup(){
  Wire.begin();
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);  // PWR_MGMT_1 register
  Wire.write(0);     // set to zero (wakes up the MPU-6050)
  Wire.endTransmission(true);

  //Wire.beginTransmission(MPU_addr);
  //Wire.write(0x6C);  
  //Wire.write(0);     
  //Wire.endTransmission(true);

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x38);  
  Wire.write(B01000000);     
  Wire.endTransmission(true);

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x1D);  
  Wire.write(B00000001);     
  Wire.endTransmission(true);

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x69);  
  Wire.write(B11000000);     
  Wire.endTransmission(true);

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x1F);  
  Wire.write(5);     
  Wire.endTransmission(true);

 // Wire.beginTransmission(MPU_addr);
  //Wire.write(0x1E);  
  //Wire.write(100);     
 // Wire.endTransmission(true);

  pinMode(pinInterrupt, INPUT);
  pinMode(pinLed, OUTPUT);

  Serial.begin(9600);
}
void loop(){
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B);  // starting with register 0x3B (ACCEL_XOUT_H)
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr,14,true);  // request a total of 14 registers
  AcX=Wire.read()<<8|Wire.read();  // 0x3B (ACCEL_XOUT_H) & 0x3C (ACCEL_XOUT_L)    
  AcY=Wire.read()<<8|Wire.read();  // 0x3D (ACCEL_YOUT_H) & 0x3E (ACCEL_YOUT_L)
  AcZ=Wire.read()<<8|Wire.read();  // 0x3F (ACCEL_ZOUT_H) & 0x40 (ACCEL_ZOUT_L)
  Tmp=Wire.read()<<8|Wire.read();  // 0x41 (TEMP_OUT_H) & 0x42 (TEMP_OUT_L)
  GyX=Wire.read()<<8|Wire.read();  // 0x43 (GYRO_XOUT_H) & 0x44 (GYRO_XOUT_L)
  GyY=Wire.read()<<8|Wire.read();  // 0x45 (GYRO_YOUT_H) & 0x46 (GYRO_YOUT_L)
  GyZ=Wire.read()<<8|Wire.read();  // 0x47 (GYRO_ZOUT_H) & 0x48 (GYRO_ZOUT_L)
  /*Serial.print("AcX = "); Serial.print(AcX);
  Serial.print(" | AcY = "); Serial.print(AcY);
  Serial.print(" | AcZ = "); Serial.print(AcZ);
  Serial.print(" | Tmp = "); Serial.print(Tmp/340.00+36.53);  //From the datasheet of MPU6050, we can know the temperature formula
  Serial.print(" | GyX = "); Serial.print(GyX);
  Serial.print(" | GyY = "); Serial.print(GyY);
  Serial.print(" | GyZ = "); Serial.println(GyZ);*/

  Serial.print(GyX);
  Serial.print(",");
  Serial.print(GyY);
  Serial.print(",");
  Serial.print(GyZ);

  int read_of_interrupt = digitalRead(pinInterrupt);
  Serial.print(",");
  Serial.print(read_of_interrupt);

  digitalWrite(pinLed, read_of_interrupt);

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3A);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr,1,true);
  int16_t interrupt_status_from_board=Wire.read()<<8|Wire.read();
  Serial.print(",");
  Serial.println(interrupt_status_from_board);
  
}
