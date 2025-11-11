import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin only once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

type CostCategories = {
  ticketsCents: number;
  transportLocalCents: number;
  hotelCents: number;
  foodCents: number;
  hydrationCents: number;
  allowanceExtraCents: number;
};

type PlannedDay = {
  date: string;
  unitId: string;
  techIds: string[];
  plannedAssets: number;
  plannedCosts: CostCategories;
};

type ActualDay = {
  date: string;
  unitId: string;
  techIds: string[];
  actualAssets: number;
  actualCosts: CostCategories;
};

type Totals = {
  assets: number;
  costs: CostCategories;
};

function emptyCosts(): CostCategories {
  return {
    ticketsCents: 0,
    transportLocalCents: 0,
    hotelCents: 0,
    foodCents: 0,
    hydrationCents: 0,
    allowanceExtraCents: 0,
  };
}

function addCosts(target: CostCategories, delta: Partial<CostCategories>, factor = 1): void {
  target.ticketsCents += Math.round((delta.ticketsCents ?? 0) * factor);
  target.transportLocalCents += Math.round((delta.transportLocalCents ?? 0) * factor);
  target.hotelCents += Math.round((delta.hotelCents ?? 0) * factor);
  target.foodCents += Math.round((delta.foodCents ?? 0) * factor);
  target.hydrationCents += Math.round((delta.hydrationCents ?? 0) * factor);
  target.allowanceExtraCents += Math.round((delta.allowanceExtraCents ?? 0) * factor);
}

function addTotals(target: Totals, assetsDelta: number, costsDelta: Partial<CostCategories>, factor = 1): void {
  target.assets += Math.round((assetsDelta || 0) * factor);
  addCosts(target.costs, costsDelta, factor);
}

async function recomputeAnalytics(operationId: string): Promise<void> {
  const planningSnap = await db
    .collection(`operations/${operationId}/planning`)
    .get();
  const actualsSnap = await db
    .collection(`operations/${operationId}/actuals`)
    .get();

  const byDay: Record<string, { planned: Totals; actual: Totals }> = {};
  const byUnit: Record<string, { planned: Totals; actual: Totals }> = {};
  const byTech: Record<string, { planned: Totals; actual: Totals }> = {};
  const byCategory: { planned: CostCategories; actual: CostCategories } = {
    planned: emptyCosts(),
    actual: emptyCosts(),
  };

  const makeTotals = (): Totals => ({ assets: 0, costs: emptyCosts() });

  // Planned
  planningSnap.forEach((doc) => {
    const d = doc.data() as PlannedDay;
    const techCount = Math.max(1, (d.techIds || []).length);
    const factor = 1 / techCount; // split across techs to avoid double counting

    // by day
    if (!byDay[d.date]) byDay[d.date] = { planned: makeTotals(), actual: makeTotals() };
    addTotals(byDay[d.date].planned, d.plannedAssets, d.plannedCosts);

    // by unit
    if (!byUnit[d.unitId]) byUnit[d.unitId] = { planned: makeTotals(), actual: makeTotals() };
    addTotals(byUnit[d.unitId].planned, d.plannedAssets, d.plannedCosts);

    // by tech (split)
    (d.techIds || []).forEach((techId) => {
      if (!byTech[techId]) byTech[techId] = { planned: makeTotals(), actual: makeTotals() };
      addTotals(byTech[techId].planned, d.plannedAssets, d.plannedCosts, factor);
    });

    // by category totals (global)
    addCosts(byCategory.planned, d.plannedCosts);
  });

  // Actuals
  actualsSnap.forEach((doc) => {
    const d = doc.data() as ActualDay;
    const techCount = Math.max(1, (d.techIds || []).length);
    const factor = 1 / techCount; // split across techs

    // by day
    if (!byDay[d.date]) byDay[d.date] = { planned: makeTotals(), actual: makeTotals() };
    addTotals(byDay[d.date].actual, d.actualAssets, d.actualCosts);

    // by unit
    if (!byUnit[d.unitId]) byUnit[d.unitId] = { planned: makeTotals(), actual: makeTotals() };
    addTotals(byUnit[d.unitId].actual, d.actualAssets, d.actualCosts);

    // by tech (split)
    (d.techIds || []).forEach((techId) => {
      if (!byTech[techId]) byTech[techId] = { planned: makeTotals(), actual: makeTotals() };
      addTotals(byTech[techId].actual, d.actualAssets, d.actualCosts, factor);
    });

    // by category totals (global)
    addCosts(byCategory.actual, d.actualCosts);
  });

  const cacheRef = db.doc(`analyticsCache/${operationId}`);
  await cacheRef.set(
    {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      byDay,
      byUnit,
      byTech,
      byCategory,
    },
    { merge: true }
  );
}

export const onPlanningWrite = functions.firestore
  .document('operations/{operationId}/planning/{dayId}')
  .onWrite(async (_change, context) => {
    const { operationId } = context.params as { operationId: string };
    await recomputeAnalytics(operationId);
  });

export const onActualsWrite = functions.firestore
  .document('operations/{operationId}/actuals/{dayId}')
  .onWrite(async (_change, context) => {
    const { operationId } = context.params as { operationId: string };
    await recomputeAnalytics(operationId);
  });










