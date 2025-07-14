void setup() {
  // put your setup code here, to run once:
  Serial.begin(250);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(12, HIGH);
  Serial.write(0x01);
  Serial.write("Something something something");
  Serial.write("Something something something asd aklsnd klasdklasjkldj aklsjd klasjdkl jaskldj aklsjdklasj dklajsdkl jaskld jaklsjd lkasjd klajsd klajsdkl jaskld jaksldj klasjd klajs dkljaskldj aklssss lkIOh)O=H");
  Serial.write("Something something something asd aklsnd klasdklasjkldj aklsjd klasjdkl jaskldj aklsjdklasj dklajsdkl jaskld jaklsjd lkasjd klajsd klajsdkl jaskld jaksldj klasjd klajs dkljaskldj aklssss lkIOh)O=H");
  Serial.write("Something something something asd aklsnd klasdklasjkldj aklsjd klasjdkl jaskldj aklsjdklasj dklajsdkl jaskld jaklsjd lkasjd klajsd klajsdkl jaskld jaksldj klasjd klajs dkljaskldj aklssss lkIOh)O=H");
  digitalWrite(12, LOW);
  Serial.write(0x00);
  delay(5000);
}
