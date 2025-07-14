#define BUTTON_PIN 2
#define SIGNAL_OUTPUT_PIN 4

int is_signal_enabled = false;
bool is_button_pressed = false;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(SIGNAL_OUTPUT_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    if (!is_button_pressed) {
      is_signal_enabled = !is_signal_enabled;
    }
    is_button_pressed = true;
    delay(20);
  } else {
    is_button_pressed = false;
    delay(20);
  }

  if (is_signal_enabled) {
    digitalWrite(SIGNAL_OUTPUT_PIN, HIGH);
  } else {
    digitalWrite(SIGNAL_OUTPUT_PIN, LOW);
  }
}
