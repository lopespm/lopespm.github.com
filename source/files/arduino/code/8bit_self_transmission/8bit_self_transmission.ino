int pinOut = 8;

void setup() {
  Serial.begin(9600, SERIAL_8E1); //initialize serial communication at a 9600 baud rate - 8 bits with even parity
  pinMode(pinOut, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  delay(1000);
  if (Serial.available() > 0) {
      Serial.print("buffer size:");
      Serial.println(Serial.available());
      int incomingByte = Serial.read();
      Serial.print("Received: ");
      Serial.println(incomingByte, DEC);
    }

  // https://docs.arduino.cc/learn/communication/uart/

  // Idle
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(200);

  // Start bit
  digitalWrite(pinOut, LOW);
  delayMicroseconds(106);

  // Data (8 bits) - lets say we want to send 1010 1101
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);
  digitalWrite(pinOut, LOW);
  delayMicroseconds(104);
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);
  digitalWrite(pinOut, LOW);
  delayMicroseconds(104);
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);
  digitalWrite(pinOut, LOW);
  delayMicroseconds(104);
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);

  // Parity Bit - 1 bit for even parity
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);

  // Stop bit
  digitalWrite(pinOut, HIGH);
  delayMicroseconds(104);

}
