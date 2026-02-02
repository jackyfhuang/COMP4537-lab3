// User-facing greeting template
export class EnStrings {
  constructor() {
    this.greeting = 'Hello %1, What a beautiful day. Server current date and time is';
  }

  getGreeting() {
    return this.greeting;
  }
}
