void setup() {
  Serial.begin(9600);
  pinMode(6, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    char receivedUnit = Serial.read();
    Serial.print("I received: ");
    Serial.println(receivedUnit);

    if (receivedUnit == '0') {
      digitalWrite(6, LOW);
    } else if (receivedUnit == '1') {
      digitalWrite(6, HIGH);
    }
  }
}
