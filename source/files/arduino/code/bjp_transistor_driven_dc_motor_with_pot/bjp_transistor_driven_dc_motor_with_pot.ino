const int POT_PIN = A0;
const int OUTPUT_PIN = 5;

void setup() {
  pinMode(POT_PIN, INPUT);
  pinMode(OUTPUT_PIN, OUTPUT);
  Serial.begin(9600);
}


void loop() {
  int pot_value = analogRead(POT_PIN);
  int output_value = map(pot_value, 0, 1023, 0, 255);
  Serial.println(output_value);
  analogWrite(OUTPUT_PIN, output_value);
}
