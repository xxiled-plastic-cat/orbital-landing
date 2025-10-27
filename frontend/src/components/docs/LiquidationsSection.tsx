import React from "react";
import { AlertTriangle, Shield, Activity, DollarSign, TrendingDown, Zap, RefreshCw, CheckCircle, Settings } from "lucide-react";
import VideoEmbed from "./VideoEmbed";

const LiquidationsSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Liquidations
        </h2>
      </div>

      <VideoEmbed
        title="Understanding Liquidations"
        description="Learn how liquidations work and protect your positions from being liquidated"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-6">
          
          {/* What is Liquidation */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              What is Liquidation?
            </h3>
            <p>
              <strong className="text-cyan-400">Liquidation</strong> is a critical safety mechanism in the Orbital protocol 
              that protects lenders when a borrower's collateral value falls too low relative to their debt. 
              When a position becomes undercollateralized, liquidators can step in to repay the debt and 
              claim the collateral, earning a liquidation bonus for maintaining protocol solvency.
            </p>
            <p className="mt-3">
              Orbital supports both <strong className="text-cyan-400">full liquidations</strong> (repay entire debt) and{" "}
              <strong className="text-cyan-400">partial liquidations</strong> (repay a portion of debt up to the close factor), 
              providing flexibility for liquidators and potentially reducing losses for borrowers.
            </p>
          </div>

          {/* How a Loan Enters Liquidation */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              How a Loan Can Enter Liquidation
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-cyan-300 font-bold mb-2">Health Factor & Collateral Ratio</h4>
                <p className="text-sm mb-3">
                  Every loan has two key metrics that determine its health:
                </p>
                <div className="bg-slate-900 bg-opacity-50 rounded p-4 space-y-3 text-sm border border-slate-700">
                  <div>
                    <span className="text-cyan-400 font-bold">Health Ratio:</span>
                    <code className="ml-2 text-white">Collateral Value (USD) ÷ Debt Value (USD)</code>
                    <p className="text-slate-400 text-xs mt-1">
                      • Safe when {">"} 1.2x<br/>
                      • At risk when between 1.0x - 1.2x<br/>
                      • Liquidatable when {"<"} 1.0x (or market's specific threshold)
                    </p>
                  </div>
                  <div>
                    <span className="text-cyan-400 font-bold">Collateral Ratio (CR):</span>
                    <code className="ml-2 text-white">Collateral Value (USD) ÷ Debt Amount</code>
                    <p className="text-slate-400 text-xs mt-1">
                      On-chain, the protocol checks: CR {"<"}= Liquidation Threshold
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-cyan-300 font-bold mb-2">Common Causes of Liquidation</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">1.</span>
                    <span><strong>Collateral Price Drop:</strong> The market price of your collateral token decreases, 
                    reducing the total value of your collateral relative to your debt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">2.</span>
                    <span><strong>Interest Accumulation:</strong> Over time, interest accrues on your loan, 
                    increasing your total debt while collateral remains constant.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">3.</span>
                    <span><strong>Debt Token Appreciation:</strong> If the borrowed asset increases in value, 
                    your debt becomes worth more in USD terms.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">4.</span>
                    <span><strong>Combination Effects:</strong> Multiple factors can compound simultaneously, 
                    rapidly deteriorating your position's health.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-30 rounded p-4">
                <p className="text-orange-200 text-sm">
                  <strong className="text-orange-400">Important:</strong> Each market has its own liquidation threshold. 
                  Conservative markets might liquidate at 1.1x, while more aggressive markets might allow down to 1.0x. 
                  Always check the specific market's liquidation threshold before borrowing.
                </p>
              </div>
            </div>
          </div>

          {/* What to Consider When Liquidating */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              What to Consider When Liquidating a Loan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-3 text-sm">For Liquidators (Opportunity)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong>Liquidation Bonus:</strong> Earn 5-10% bonus on collateral claimed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong>Debt Repayment:</strong> Must have sufficient funds to repay the debt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong>Gas Costs:</strong> Factor in transaction fees on Algorand</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong>Price Slippage:</strong> Consider collateral price volatility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong>Competition:</strong> Other liquidators may execute first</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-red-400 font-bold mb-3 text-sm">For Borrowers (Protection)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Monitor Health:</strong> Regularly check your health ratio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Maintain Buffer:</strong> Keep health ratio above 1.5x for safety</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Add Collateral:</strong> Deposit more collateral if health drops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Repay Debt:</strong> Reduce debt to improve health ratio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Set Alerts:</strong> Use the Logbook to track positions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Smart Contract Mechanics */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Liquidation Flow: Smart Contract Mechanics
            </h3>
            <div className="space-y-4">
              <p className="text-sm">
                When a liquidation is executed on-chain via <code className="text-cyan-300 text-xs">liquidatePartialAlgo</code> or{" "}
                <code className="text-cyan-300 text-xs">liquidatePartialASA</code>, the following steps occur atomically:
              </p>
              
              <div className="bg-slate-900 bg-opacity-50 rounded p-4 space-y-3 border border-slate-700">
                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 1</span>
                    <span className="font-bold text-cyan-300">Trigger Checks</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    assert(loan_record.exists, "loan must exist")<br/>
                    assert(debt {">"} 0, "debt must be positive")<br/>
                    assert(repayAmount {">"} 0 AND {"<"}= closeFactor, "invalid amount")<br/>
                    CR = (collateralValueUSD) ÷ debtAmount<br/>
                    assert(CR {"<"}= liq_threshold_bps, "not liquidatable")
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The contract snapshots the borrower's loan, confirms it exists with positive debt, verifies the repayment 
                    amount is within the close factor (typically 50% max for partial liquidations), and checks that the 
                    collateral ratio is at or below the liquidation threshold using real-time oracle prices.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 2</span>
                    <span className="font-bold text-cyan-300">Value Math</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    repayValueUSD = repayAmount × oraclePrice(baseToken)<br/>
                    bonusMultiplier = 1 + (liqBonusBps / 10000)<br/>
                    seizeValueUSD = repayValueUSD × bonusMultiplier<br/>
                    seizeAmount = convertUSDtoLST(seizeValueUSD)
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The market pulls current oracle prices, translates the proposed repayment into USD, applies the liquidation 
                    bonus (e.g., 5-10%), and computes the USD value of collateral to be seized. Helper routines convert between 
                    USD, underlying value, and LST units, ensuring the seize amount doesn't exceed the borrower's balance.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 3</span>
                    <span className="font-bold text-cyan-300">Safety Guard</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    if (seizeLST == totalCollateral AND remainingDebt {">"} 0) {'{'}<br/>
                    &nbsp;&nbsp;revert("FULL_REPAY_REQUIRED")<br/>
                    {'}'}
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The contract only blocks partial liquidations when the seizure would wipe the entire collateral yet still 
                    leave debt outstanding. This critical safety check prevents "all collateral gone but debt remains" scenarios 
                    while allowing smaller partial liquidations to proceed normally.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 4</span>
                    <span className="font-bold text-cyan-300">State Updates</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    // Transfer seized LST to liquidator<br/>
                    innerTxn.assetTransfer(liquidator, seizedLST)<br/>
                    <br/>
                    // Refund excess repayment if any<br/>
                    if (excessRepay {">"} 0) innerTxn.payment/axfer(liquidator, excess)<br/>
                    <br/>
                    // Update borrower's loan record<br/>
                    loan.totalDebt -= repaidDebt<br/>
                    loan.collateralAmount -= seizedLST<br/>
                    <br/>
                    // If debt hits zero, return remaining collateral<br/>
                    if (loan.totalDebt == 0) {'{'}<br/>
                    &nbsp;&nbsp;returnCollateral(borrower, remainingLST)<br/>
                    &nbsp;&nbsp;loan_record.delete()<br/>
                    {'}'}
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    An inner transaction transfers the seized LST to the liquidator. Any excess repayment is automatically refunded 
                    (ASA markets refund the base asset via axfer; ALGO markets use payment). The borrower's loan record, total borrows, 
                    collateral tallies, and market cash are all updated atomically. If the debt reaches zero, any remaining collateral 
                    is returned to the borrower and the loan record is deleted.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 5</span>
                    <span className="font-bold text-cyan-300">Market State Update</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    updateCollateralTotal(collateralTokenId, newTotal)<br/>
                    totalBorrows -= repaidAmount<br/>
                    cashOnHand += repaidAmount
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The market's global state is updated to reflect the removed collateral, reduced total borrows, 
                    and increased cash reserves from the repayment.
                  </p>
                </div>
              </div>

              <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded p-4">
                <p className="text-cyan-200 text-sm mb-2">
                  <strong className="text-cyan-400">Partial vs Full Liquidations:</strong>
                </p>
                <ul className="space-y-1 text-sm text-cyan-200">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>
                      <strong>Partial:</strong> Repay up to the close factor (typically 50% of debt), receive proportional collateral. 
                      More capital efficient for liquidators, less punishing for borrowers.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>
                      <strong>Full:</strong> Repay 100% of debt, receive all collateral. Required when collateral is insufficient 
                      to support partial liquidation with bonus.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 rounded p-4">
                <p className="text-purple-200 text-sm">
                  <strong className="text-purple-400">Buyout Branch:</strong> For positions that are healthy but above the liquidation 
                  threshold, the buyout mechanism (<code className="text-purple-300 text-xs">buyoutSplitAlgo</code> /{" "}
                  <code className="text-purple-300 text-xs">buyoutSplitASA</code>) allows a third party to acquire the debt position 
                  by repaying the full debt and paying a premium. The contract asserts that{" "}
                  <code className="text-purple-300 text-xs">CR {">"} liq_threshold_bps</code> before execution, with the premium 
                  split between the protocol and the original borrower.
                </p>
              </div>
            </div>
          </div>

          {/* Results After Liquidation */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Results After a Liquidation
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
                  <h4 className="text-green-400 font-bold mb-2 text-sm">For the Protocol</h4>
                  <ul className="space-y-2 text-sm text-green-200">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Maintains solvency and overcollateralization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Protects lenders from bad debt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Frees up borrowing capacity in the market</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Reduces or eliminates risky debt positions</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
                  <h4 className="text-red-400 font-bold mb-2 text-sm">For the Borrower</h4>
                  <ul className="space-y-2 text-sm text-red-200">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Loses seized collateral (partial or full)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Debt reduced/cleared but at a loss</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Liquidation bonus paid from their collateral</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">○</span>
                      <span className="text-amber-200">
                        <strong>Partial liquidations:</strong> May retain some collateral and debt
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-3 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Example Partial Liquidation Scenario
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Initial Position:</p>
                      <ul className="space-y-1 text-xs">
                        <li>Collateral: 100 cALGO @ $0.20 = $20</li>
                        <li>Borrowed: 15 USDCt @ $1.00 = $15</li>
                        <li>Health Ratio: 1.33x (Safe)</li>
                        <li>Liquidation Threshold: 1.10x</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-2">After cALGO Drops 20%:</p>
                      <ul className="space-y-1 text-xs">
                        <li>Collateral: 100 cALGO @ $0.16 = $16</li>
                        <li>Borrowed: 15 USDCt @ $1.00 = $15</li>
                        <li className="text-red-400 font-bold">Health Ratio: 1.07x (Liquidatable!)</li>
                        <li>Below threshold of 1.10x</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Partial Liquidation Example */}
                  <div className="bg-slate-900 bg-opacity-50 rounded p-3 border border-cyan-700">
                    <p className="text-cyan-400 font-bold text-xs mb-2 flex items-center gap-2">
                      <span className="bg-cyan-400 bg-opacity-20 rounded px-2 py-0.5">OPTION A</span>
                      Partial Liquidation (50% close factor):
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>→ Liquidator pays: 7.5 USDCt ($7.50)</li>
                      <li>→ With 5% bonus: Claims ~$7.88 worth of collateral</li>
                      <li>→ Seizes: ~49.2 cALGO ($7.88 value)</li>
                      <li>→ Liquidator profit: ~$0.38 (5% minus gas)</li>
                      <li className="text-amber-400 mt-2">→ Borrower keeps: 50.8 cALGO ($8.12 value)</li>
                      <li className="text-amber-400">→ Remaining debt: 7.5 USDCt</li>
                      <li className="text-amber-400">→ New health ratio: ~1.08x (still at risk)</li>
                    </ul>
                  </div>

                  {/* Full Liquidation Example */}
                  <div className="bg-slate-900 bg-opacity-50 rounded p-3 border border-red-700">
                    <p className="text-red-400 font-bold text-xs mb-2 flex items-center gap-2">
                      <span className="bg-red-400 bg-opacity-20 rounded px-2 py-0.5">OPTION B</span>
                      Full Liquidation:
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>→ Liquidator pays: 15 USDCt ($15)</li>
                      <li>→ Liquidator receives: ALL 100 cALGO ($16 value)</li>
                      <li>→ Liquidator profit: ~$1 (6.7% return minus gas)</li>
                      <li className="text-red-400 mt-2">→ Borrower loses: 100 cALGO (entire collateral)</li>
                      <li className="text-red-400">→ Debt: Fully cleared (0 USDCt)</li>
                      <li className="text-red-400">→ Net borrower loss: ~$1 liquidation penalty</li>
                    </ul>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                    <p className="text-purple-300 text-xs">
                      <strong className="text-purple-400">💡 Key Insight:</strong> Partial liquidations can be less 
                      punishing for borrowers, allowing them to retain some collateral and potentially recover if 
                      they add more collateral or repay more debt. However, they may require multiple liquidation 
                      rounds if the position remains underwater.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Front-End Liquidation UI */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Front-End Liquidation Interface
            </h3>
            <div className="space-y-4">
              <p className="text-sm">
                The Orbital UI provides a streamlined interface for liquidators to identify and execute liquidations. 
                Here's how the liquidation process works from the user interface:
              </p>
              
              <div className="space-y-3">
                <div className="bg-slate-900 bg-opacity-50 border border-slate-700 rounded p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-green-400 bg-opacity-20 text-green-400 rounded px-2 py-1 text-xs font-bold shrink-0">1</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-300 mb-2">Surface Eligibility</h4>
                      <p className="text-sm text-slate-400 mb-2">
                        The marketplace automatically fetches <code className="text-green-300 text-xs">getLoanStatus</code> for 
                        each position, displaying:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• Current collateral ratio (CR)</li>
                        <li>• Health ratio and liquidation threshold</li>
                        <li>• <code className="text-green-300">eligibleForLiquidation</code> flag</li>
                        <li>• Visual indicators when positions enter liquidation zone</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 bg-opacity-50 border border-slate-700 rounded p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-green-400 bg-opacity-20 text-green-400 rounded px-2 py-1 text-xs font-bold shrink-0">2</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-300 mb-2">Prep Data & Calculations</h4>
                      <p className="text-sm text-slate-400 mb-2">
                        When you view a liquidatable position, the UI fetches:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• Borrower's <code className="text-green-300">LoanRecord</code> (box read from blockchain)</li>
                        <li>• Collateral metadata (token IDs, decimals, current prices)</li>
                        <li>• Real-time oracle prices for accurate calculations</li>
                        <li>• Protocol constants (liqBonusBps, liqThresholdBps, close factor)</li>
                        <li>• Max partial repay allowed (typically 50% of live debt)</li>
                        <li>• Estimated seized collateral and bonus value via <code className="text-green-300 text-xs">computePartialLiquidationOutcome</code></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 bg-opacity-50 border border-slate-700 rounded p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-green-400 bg-opacity-20 text-green-400 rounded px-2 py-1 text-xs font-bold shrink-0">3</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-300 mb-2">User Input & Preview</h4>
                      <p className="text-sm text-slate-400 mb-2">
                        The liquidation panel provides:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• Partial vs full repayment toggle</li>
                        <li>• Quick preset buttons (25%, 50%, 100% of max)</li>
                        <li>• Live preview of seized collateral amount</li>
                        <li>• Estimated profit/bonus calculation</li>
                        <li>• Warnings if amount would seize all collateral (forcing full repay)</li>
                        <li>• Display of any expected refunds</li>
                      </ul>
                      <div className="mt-2 p-2 bg-amber-900/20 border border-amber-500/30 rounded">
                        <p className="text-amber-300 text-xs">
                          <strong>⚠️ Bad Debt Protection:</strong> If debt exceeds collateral value, the UI automatically 
                          locks to full repayment mode to prevent partial liquidations that would leave bad debt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 bg-opacity-50 border border-slate-700 rounded p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-green-400 bg-opacity-20 text-green-400 rounded px-2 py-1 text-xs font-bold shrink-0">4</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-300 mb-2">Transaction Assembly</h4>
                      <p className="text-sm text-slate-400 mb-2">
                        Behind the scenes, the UI constructs an atomic transaction group:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• <strong>Asset opt-in:</strong> Ensures liquidator can receive collateral token</li>
                        <li>• <strong>Base-token payment:</strong> ALGO payment or ASA transfer for <code className="text-green-300 text-xs">repayBaseAmount</code></li>
                        <li>• <strong>Liquidation call:</strong> Invokes <code className="text-green-300 text-xs">liquidatePartialAlgo</code> or{" "}
                          <code className="text-green-300 text-xs">liquidatePartialASA</code> with:
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>- Borrower's address</li>
                            <li>- Oracle app ID and LST app ID references</li>
                            <li>- Collateral box names</li>
                            <li>- Asset and app references</li>
                          </ul>
                        </li>
                        <li>• <strong>Gas transaction:</strong> For ALGO markets, includes localnet "gas" inner call</li>
                      </ul>
                      <p className="text-xs text-slate-400 mt-2">
                        All transactions are grouped atomically and signed with your wallet provider (Pera, Defly, etc.).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 bg-opacity-50 border border-slate-700 rounded p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-green-400 bg-opacity-20 text-green-400 rounded px-2 py-1 text-xs font-bold shrink-0">5</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-300 mb-2">Submission & Feedback</h4>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• Transaction group submitted to Algorand network</li>
                        <li>• Real-time status updates during confirmation</li>
                        <li>• Post-confirmation: Automatic refresh of borrower loan state</li>
                        <li>• Display of liquidator's updated balances</li>
                        <li>• Success summary showing:
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>- Debt repaid amount</li>
                            <li>- Collateral seized (with bonus)</li>
                            <li>- Any refunds received</li>
                            <li>- Net profit/loss</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-30 rounded p-4">
                <h4 className="text-orange-400 font-bold mb-2 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Safety UX Considerations
                </h4>
                <ul className="space-y-2 text-sm text-orange-200">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>
                      <strong>Asset Opt-In:</strong> Liquidators must opt-in to the collateral token before liquidating. 
                      The UI handles this automatically.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>
                      <strong>Refunds:</strong> ASA markets may refund excess base tokens; ALGO markets refund via payment. 
                      The UI displays expected refunds.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>
                      <strong>Oracle Updates:</strong> In test environments, manager role may need to update oracle prices 
                      before liquidation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>
                      <strong>Multiple Rounds:</strong> Partial liquidations may require multiple transactions to fully 
                      clear a heavily underwater position.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>
                      <strong>Gas Fees:</strong> All Algorand transaction fees are clearly displayed before confirmation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-red-500 bg-opacity-10 border-2 border-red-500 border-opacity-30 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold mb-3 text-lg">
                  Protect Your Positions
                </h4>
                <div className="text-red-200 text-sm space-y-2">
                  <p>
                    <strong>Prevention is key:</strong> Liquidation is a loss event for borrowers. The best strategy 
                    is to maintain healthy positions by:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Borrowing conservatively (aim for {"<"}50% of max LTV)</li>
                    <li>Monitoring your health ratio daily, especially during volatile markets</li>
                    <li>Maintaining a safety buffer above the liquidation threshold</li>
                    <li>Adding collateral or repaying debt when health ratio drops below 1.5x</li>
                    <li>Using the Logbook page to track all your active positions</li>
                  </ul>
                  <p className="mt-3">
                    <strong className="text-red-300">Remember:</strong> On volatile assets, price can move quickly. 
                    What seems safe at 1.3x health ratio could become liquidatable within hours during market turbulence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidationsSection;

