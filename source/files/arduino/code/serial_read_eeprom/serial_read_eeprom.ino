#include <EEPROM.h>

int ledPin = 6;
int eepromAddress = 345;

void setup() {
  Serial.begin(9600);
  pinMode(6, OUTPUT);
  byte storedByte = EEPROM.read(eepromAddress);
  if (storedByte == 1) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}

void loop() {
  if (Serial.available() > 0) {
    char receivedUnit = Serial.read();
    Serial.print("I received: ");
    Serial.println(receivedUnit);

    if (receivedUnit == '0') {
      digitalWrite(ledPin, LOW);
      EEPROM.write(eepromAddress, 0);
    } else if (receivedUnit == '1') {
      digitalWrite(ledPin, HIGH);
      EEPROM.write(eepromAddress, 1);
    }
  }
}
