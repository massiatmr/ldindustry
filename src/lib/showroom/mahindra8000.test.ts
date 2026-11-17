import { describe, expect, it } from "vitest";
import { mahindra8000 } from "./mahindra8000";
describe("Mahindra 8000 verified specifications", () => {
  it("uses the 80 horsepower turbo diesel specification", () => { expect(mahindra8000.horsepower).toBe(80); });
  it("uses four cylinders and 3.192 litres", () => { expect([mahindra8000.cylinders, mahindra8000.displacementCc]).toEqual([4, 3192]); });
  it("has 12 forward and 12 reverse speeds", () => { expect([mahindra8000.forwardGears, mahindra8000.reverseGears]).toEqual([12, 12]); });
  it("has a nominal 1800 kg lift", () => { expect(mahindra8000.liftKg).toBe(1800); });
});