import React from "react";
import { AlertTriangle, Shield, Activity, DollarSign, TrendingDown } from "lucide-react";
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
              claim the collateral, earning a bonus for maintaining protocol solvency.
            </p>
            <p className="mt-3">
              Liquidations ensure that all loans remain overcollateralized, protecting the protocol and 
              lenders from bad debt situations where borrowed assets cannot be recovered.
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
              What Happens in the Smart Contracts
            </h3>
            <div className="space-y-4">
              <p className="text-sm">
                When a liquidation is executed on-chain, the following steps occur atomically:
              </p>
              
              <div className="bg-slate-900 bg-opacity-50 rounded p-4 space-y-3 border border-slate-700">
                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 1</span>
                    <span className="font-bold text-cyan-300">Eligibility Check</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    CR = (collateralAmount × oraclePrice) ÷ debtAmount<br/>
                    assert(CR {"<"}= liquidationThreshold, "loan is not liquidatable")
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The contract verifies the collateral ratio has fallen below the market's liquidation threshold using real-time oracle prices.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 2</span>
                    <span className="font-bold text-cyan-300">Debt Repayment</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    liquidateASA(debtor, axferTxn) or liquidateAlgo(debtor, paymentTxn)
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The liquidator sends a transaction transferring the full debt amount (or partial amount for partial liquidations) 
                    to the contract. This can be either an ASA transfer or ALGO payment depending on the borrowed asset type.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 3</span>
                    <span className="font-bold text-cyan-300">Loan Record Deletion</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    loan_record(debtor).delete()<br/>
                    active_loan_records.value -= 1
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The borrower's loan record is permanently deleted from the contract state, removing their debt obligation.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 4</span>
                    <span className="font-bold text-cyan-300">Collateral Transfer</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    assetTransfer({'{'}
                      assetReceiver: liquidator,<br/>
                      &nbsp;&nbsp;xferAsset: collateralTokenId,<br/>
                      &nbsp;&nbsp;assetAmount: collateralAmount<br/>
                    {'}'})
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    All collateral is transferred to the liquidator. This includes the liquidation bonus, which is built into 
                    the economics (debt is less than collateral value even at liquidation threshold).
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 5</span>
                    <span className="font-bold text-cyan-300">State Update</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    updateCollateralTotal(collateralTokenId, newTotal)
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The market's total collateral tracking is updated to reflect the removed collateral amount.
                  </p>
                </div>
              </div>

              <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded p-4">
                <p className="text-cyan-200 text-sm">
                  <strong className="text-cyan-400">Partial Liquidations:</strong> Orbital also supports partial liquidations 
                  through <code className="text-cyan-300 text-xs">liquidatePartialASA</code> and <code className="text-cyan-300 text-xs">liquidatePartialAlgo</code> methods. 
                  These allow liquidators to repay only a portion of the debt and receive a proportional amount of collateral, 
                  which can be more capital efficient for liquidators and less punishing for borrowers.
                </p>
              </div>
            </div>
          </div>

          {/* Results After Liquidation */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
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
                      <span>Reduces active loan count</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
                  <h4 className="text-red-400 font-bold mb-2 text-sm">For the Borrower</h4>
                  <ul className="space-y-2 text-sm text-red-200">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Loses all collateral in the position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Debt is cleared but at a loss</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Liquidation bonus paid from their collateral</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>May have lost more than if they had repaid early</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-3 text-sm">Example Liquidation Scenario</h4>
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
                  <div className="bg-slate-900 bg-opacity-50 rounded p-3 border border-slate-700">
                    <p className="text-cyan-400 font-bold text-xs mb-2">Liquidation Execution:</p>
                    <ul className="space-y-1 text-xs">
                      <li>→ Liquidator pays: 15 USDCt ($15)</li>
                      <li>→ Liquidator receives: 100 cALGO ($16 value)</li>
                      <li>→ Liquidator profit: ~$1 (6.7% return minus gas)</li>
                      <li className="text-red-400">→ Borrower loses: 100 cALGO (entire collateral)</li>
                      <li className="text-red-400">→ Net borrower loss: ~$1 from the collateral value drop + liquidation penalty</li>
                    </ul>
                  </div>
                </div>
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

