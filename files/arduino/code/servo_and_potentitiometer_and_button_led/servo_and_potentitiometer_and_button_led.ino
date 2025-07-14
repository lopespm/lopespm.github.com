//www.elegoo.com
//2018.12.19
#include <Servo.h>
/* After including the corresponding libraries,
   we can use the "class" like "Servo" created by the developer for us.
   We can use the functions and variables created in the libraries by creating 
   objects like the following "myservo" to refer to the members in ".".*/

Servo myservo;
//it created an object called myservo.
/*  you can see Servo as a complex date type(Including functions and various data types)
    and see myservo as variables.               */

int potPin = A3; // Potentiometer output connected to analog pin 3
int buttonPin = 12; // Potentiometer output connected to analog pin 3
int ledPin = 13;

bool shouldPutInFixedPosition = false;

void setup(){
  /*"attach" and "write" are both functions,
     and they are members contained in the complex structure of "Servo". 
     We can only use them if we create the object "myservo" for the complex structure of "Servo".
  */
  myservo.attach(9);//connect pin 9 with the control line(the middle line of Servo) 
  myservo.write(90);// move servos to center position -> 90°
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT); //initialize the buzzer pin as an output
  Serial.begin(9600);  // ...set up the serial output 
} 
void loop(){
  int potVal = analogRead(potPin);
  Serial.println(potVal);
  
  if (digitalRead(buttonPin) == LOW) {
    shouldPutInFixedPosition = !shouldPutInFixedPosition;
    delay(300);
  }

  if (shouldPutInFixedPosition) {
    myservo.write(170);    
    digitalWrite(ledPin, LOW);
  } else {
    digitalWrite(ledPin, HIGH);
    int mappedVval = map(potVal, 0, 1023, 0, 180);     // scale it to use it with the servo (value between 0 and 180)
    myservo.write(mappedVval);                  // sets the servo position according to the scaled value
    delay(15);                           // waits for the servo to get there
  }

  //myservo.write(90);// move servos to center position -> 90°
  //delay(1000);
  //myservo.write(60);// move servos to center position -> 60°
  //delay(1000);
  //myservo.write(90);// move servos to center position -> 90°
  //delay(1000);
  //myservo.write(150);// move servos to center position -> 120°
  //delay(1000);
}
