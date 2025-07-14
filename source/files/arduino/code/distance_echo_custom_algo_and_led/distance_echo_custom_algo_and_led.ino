int trigger_pin = 12;
int echo_pin = 11;
int led_pin = 10;

bool is_transmitting_trigger = true;
long trigger_microseconds_elapsed = 0L;
long echo_microseconds_elapsed = 0L;

void setup() {
  pinMode(trigger_pin, OUTPUT);
  pinMode(led_pin, OUTPUT);
  Serial.begin(9600);
  delay(1000);
}

void loop() {
  if (trigger_microseconds_elapsed > 10L) {
    is_transmitting_trigger = false;
    trigger_microseconds_elapsed = 0L;
  }

  if (is_transmitting_trigger == true) {
    digitalWrite(trigger_pin, HIGH);
    trigger_microseconds_elapsed +=1L;
  } else {
    digitalWrite(trigger_pin, LOW);
    if (digitalRead(echo_pin) == HIGH) {
      echo_microseconds_elapsed +=1L;
    } else {
      if (echo_microseconds_elapsed > 0L) {
        // speed of sound: 343 micrometers per microsecond
        long micrometers_traversed_total = 343L * echo_microseconds_elapsed;
        double cm_traversed_total = micrometers_traversed_total / 1000.0;
        double cm_traversed_half = cm_traversed_total / 2.0;
        Serial.print(cm_traversed_half);
        Serial.println("cm");

        int led_output = map(cm_traversed_half, 0L, 230L, 0, 255);
        analogWrite(led_pin, led_output);

        delay(10);

        echo_microseconds_elapsed = 0L;
        is_transmitting_trigger = true;
      }
    }
  }
}
