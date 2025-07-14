//www.elegoo.com
//2016.12.9

#include <LiquidCrystal.h>
int tempPin = 0;
//                BS  E  D4 D5  D6 D7
LiquidCrystal lcd(7, 8, 9, 10, 11, 12);
void setup()
{
  /*lcd.begin(cols, rows)
    lcd: a variable of type LiquidCrystal
    cols: the number of columns that the display has
    rows: the number of rows that the display has 
  */
  lcd.begin(16, 2);
}
void loop()
{
  double analogReading = analogRead(tempPin);

  lcd.setCursor(0, 0);
  lcd.print("Light Intensity:");
  lcd.setCursor(0, 1);
  lcd.print(analogReading);
  delay(500);
}
