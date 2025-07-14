//www.elegoo.com
//2022.03.10

/************************
  Exercise the motor using
  the relay
************************/

#define ENABLE 5
#define DIRA 3
#define DIRB 4

int i;

void setup() {
  //---set pin direction
  pinMode(ENABLE, OUTPUT);
  pinMode(DIRA, OUTPUT);
  pinMode(DIRB, OUTPUT);
  Serial.begin(9600);
}

void loop() {

  //---relay example
  digitalWrite(ENABLE, HIGH); // enable on
  for (i = 0; i < 5; i++)
  {
    Serial.println("spin");
    digitalWrite(DIRA, HIGH); //motor spins
    digitalWrite(DIRB, LOW);

    delay(2000);
    digitalWrite(ENABLE, LOW); // enable off
    delay(2000);
    digitalWrite(ENABLE, HIGH); // enable on

    digitalWrite(DIRA, LOW); //motor spins (same direction as above since we only controlling the coil)
    digitalWrite(DIRB, HIGH);

    delay(2000);
    digitalWrite(ENABLE, LOW); // enable off
    delay(2000);
    digitalWrite(ENABLE, HIGH); // enable on

  }
}
