class Prefixer {
  private readonly prefix: string;

  private readonly delimiter: string;

  constructor(prefix: string, { delimiter = '' }) {
    this.prefix = prefix;
    this.delimiter = delimiter;
  }

  applyTo(value: string): string {
    return `${this.prefix}${this.delimiter}${value}`;
  }
}

export default Prefixer;
