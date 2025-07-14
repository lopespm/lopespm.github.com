int pinIRReceiverSignal = 11;
int pinLedEmitter = 7;

int stepCount = 0;

void setup() {
  pinMode(pinIRReceiverSignal, INPUT);
  pinMode(pinLedEmitter, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // This doesnt work with a normal red LED, because it sits around 640nm - we would need a 900 to 1000nm for IR receiver to pick it up
  // The 25 microsecond intervalis are to comply with the 38khz signal modulation expectation on the IR receiver
  digitalWrite(pinLedEmitter, HIGH);
  delayMicroseconds(25);
  digitalWrite(pinLedEmitter, LOW);
  delayMicroseconds(25);

  Serial.print(digitalRead(pinIRReceiverSignal));
  Serial.print(" ");

  if (stepCount > 64) {
    Serial.begin(9600);
    stepCount = 0;
  }
  stepCount++;
}
