export namespace MathHelper {
  export function getNormalizerFixed(decimal: number, value: number): string {
    if (value !== 0 && value < 1 && decimal === 0) {
      return value.toFixed(3);
    }

    return value.toFixed(decimal);
  }
}
