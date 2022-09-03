export const release = {
    "version": "1.1-beta",
    "description": "Invest in the hacknet.",
    "log": ["1.0 Spend money on the hacknet", "1.1 Assign a budget"]
}

import { NS } from "/lib/NetscriptDefinitions";

const MONEY_FORMAT = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

export async function main(ns: NS) {
    ns.disableLog("ALL");

    const FLAGS = ns.flags([["budget", ns.getServerMoneyAvailable("home")]]);

    // Purchase hacknet
    let workingBudget = FLAGS.budget as number;
    let nextPurchase = availableActions(ns).sort((a, b) => a.cost - b.cost)[0];
    let totalSpent = 0;
    while (nextPurchase.cost < workingBudget) {
        nextPurchase.func.call(null, ...nextPurchase.args);
        totalSpent += nextPurchase.cost;
        workingBudget -= nextPurchase.cost;
        nextPurchase = availableActions(ns).sort((a, b) => a.cost - b.cost)[0];
    }

    // Notify client
    if (totalSpent > 0) {
        ns.print("Spent " + MONEY_FORMAT.format(totalSpent));
        ns.toast(`Hacknet: Spent ${MONEY_FORMAT.format(totalSpent)}`);
    } else {
        ns.print("WARN Cannot afford any hacknet nodes.");
        ns.tail();
    }
}

function availableActions(ns: NS): [{ cost: number; func: Function; args: any[] }] {
    const actions: [{ cost: number; func: Function; args: any[] }] = [
        { cost: ns.hacknet.getPurchaseNodeCost(), func: ns.hacknet.purchaseNode, args: [] }
    ];
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        actions.push({ cost: ns.hacknet.getLevelUpgradeCost(i, 1), func: ns.hacknet.upgradeLevel, args: [i, 1] });
        actions.push({ cost: ns.hacknet.getRamUpgradeCost(i, 1), func: ns.hacknet.upgradeRam, args: [i, 1] });
        actions.push({ cost: ns.hacknet.getCoreUpgradeCost(i, 1), func: ns.hacknet.upgradeCore, args: [i, 1] });
    }
    actions.sort((a, b) => a.cost - b.cost);
    return actions;
}
