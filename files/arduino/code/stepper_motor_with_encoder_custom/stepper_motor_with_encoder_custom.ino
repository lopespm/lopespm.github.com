// See also https://www.friendlywire.com/tutorials/rotary-encoder/ where part of this code was based on

#include "Stepper.h"
#define STEPS 32  // Number of steps for one revolution of Internal shaft \
                  // 2048 steps for one revolution of External shaft

const int PinCLK = 2;  // Generating interrupts using CLK signal
const int PinDT = 3;   // Reading DT signal
const int PinSW = 4;   // Reading Push Button switch

int previous_rotary_position = 0;

int current_stepper_position = 0;
int target_stepper_position = 0;

bool lock = false;

// Setup of proper sequencing for Motor Driver Pins
// In1, In2, In3, In4 in the sequence 1-3-2-4
Stepper small_stepper(STEPS, 8, 10, 9, 11);

void setup() {
  pinMode(PinCLK, INPUT_PULLUP);
  pinMode(PinDT, INPUT_PULLUP);
  pinMode(PinSW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PinCLK), isr, CHANGE);
  attachInterrupt(digitalPinToInterrupt(PinDT), isr, CHANGE);
  small_stepper.setSpeed(700);
  Serial.begin(9600);
}

// Interrupt routine runs if CLK goes from HIGH to LOW
void isr() {
  if (!lock) {
    lock = true;
    int current_rotary_position = convertGrayToBinary();
    int difference = previous_rotary_position - current_rotary_position;

    if (((difference == -1) || (difference == 3))) {
      previous_rotary_position = current_rotary_position;
      target_stepper_position += 1;
    } else if (((difference == 1) || (difference == -3))) {
      previous_rotary_position = current_rotary_position;
      target_stepper_position -= 1;
    } else if ((difference == 2) || (difference == -2)) {
      // in this case, an step has been missed
      // (best practice: ignore it!)
      Serial.println("UNEXPECTED");
    }
  }
  lock = false;
}

int convertGrayToBinary() {
  int encoder_a = digitalRead(PinDT);
  int encoder_b = digitalRead(PinCLK);
  if (encoder_a == HIGH && encoder_b == HIGH) {
    return 0;
  } else if (encoder_a == LOW && encoder_b == HIGH) {
    return 1;
  } else if (encoder_a == LOW && encoder_b == LOW) {
    return 2;
  } else {
    return 3;
  }
}

void loop() {
  if (current_stepper_position < target_stepper_position) {
    small_stepper.step(STEPS);
    current_stepper_position +=1;
    Serial.println("++ Step");
  } else if (current_stepper_position > target_stepper_position) {
    small_stepper.step(-STEPS);
    current_stepper_position -=1;
    Serial.println("-- Step");
  }
}
