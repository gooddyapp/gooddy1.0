/**
 * Lightweight smoke checks for cycle math.
 * Run: node scripts/smoke.mjs
 */
import assert from "node:assert/strict";

function phaseForCycleDay(cycleDay, cycleLength, periodLength) {
  const menstrual = Math.max(2, Math.min(periodLength, Math.floor(cycleLength * 0.25)));
  const ovulationCenter = Math.max(menstrual + 3, cycleLength - 14);
  const ovulationLen = Math.min(3, Math.max(2, Math.round(cycleLength * 0.1)));
  const ovulationStart = Math.max(
    menstrual + 1,
    ovulationCenter - Math.floor((ovulationLen - 1) / 2),
  );
  const ovulationEnd = Math.min(cycleLength - 1, ovulationStart + ovulationLen - 1);
  if (cycleDay <= menstrual) return "menstrual";
  if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) return "ovulation";
  if (cycleDay < ovulationStart) return "follicular";
  return "luteal";
}

assert.equal(phaseForCycleDay(1, 28, 5), "menstrual");
assert.equal(phaseForCycleDay(5, 28, 5), "menstrual");
assert.equal(phaseForCycleDay(8, 28, 5), "follicular");
assert.equal(phaseForCycleDay(14, 28, 5), "ovulation");
assert.equal(phaseForCycleDay(20, 28, 5), "luteal");
assert.equal(phaseForCycleDay(28, 28, 5), "luteal");

console.log("smoke ok");
