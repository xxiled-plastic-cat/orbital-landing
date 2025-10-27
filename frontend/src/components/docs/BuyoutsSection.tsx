import React from "react";
import { ShoppingBag, TrendingUp, Users, DollarSign, Zap, CheckCircle } from "lucide-react";
import VideoEmbed from "./VideoEmbed";

const BuyoutsSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Buyouts
        </h2>
      </div>

      <VideoEmbed
        title="Understanding Buyouts"
        description="Learn how the debt marketplace and buyout mechanism works"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-6">
          
          {/* What are Buyouts */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              What are Buyouts?
            </h3>
            <p>
              <strong className="text-cyan-400">Buyouts</strong> are an innovative feature unique to Orbital that 
              creates a marketplace for <strong className="text-pink-400">healthy</strong> loan positions. Unlike liquidations that only occur when 
              positions become undercollateralized, buyouts allow third parties to purchase the collateral of any healthy 
              loan by paying a <strong className="text-pink-400">premium</strong> above the debt value.
            </p>
            <p className="mt-3">
              This creates a new DeFi primitive: a <strong className="text-pink-400">liquid secondary market</strong> for debt positions where borrowers can 
              exit positions early, and traders can acquire yield-bearing collateral without borrowing themselves.
            </p>
            <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded-lg p-4 mt-4">
              <p className="text-cyan-200 text-sm">
                <strong className="text-cyan-400">Key Difference:</strong> Liquidations are punitive and only 
                available for unhealthy loans (below threshold). Buyouts are voluntary opportunities for healthy 
                loans (above threshold) that benefit all parties through a premium mechanism.
              </p>
            </div>
          </div>

          {/* How Buyouts Work */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              How Buyouts Work
            </h3>
            <div className="space-y-4">
              <p className="text-sm">
                A buyout is an atomic on-chain transaction where a buyer acquires a borrower's collateral by paying 
                both the outstanding debt and a premium fee. The process is fully automated and transparent.
              </p>

              <div className="bg-slate-900 bg-opacity-50 rounded p-4 space-y-3 border border-slate-700">
                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 1</span>
                    <span className="font-bold text-cyan-300">Eligibility Check</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    CR = (collateralValue ÷ debtValue) × 100<br/>
                    assert(CR {">"} liquidationThreshold, "loan not eligible for buyout")
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The loan must be healthy (above the liquidation threshold). The healthier the loan, 
                    the higher the premium the buyer must pay.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 2</span>
                    <span className="font-bold text-cyan-300">Premium Calculation</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    premiumRate = (CR × 10000 ÷ liquidationThreshold) - 10000  // basis points<br/>
                    premium = collateralValue × premiumRate ÷ 10000
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The premium rate scales with how far above the liquidation threshold the position is. 
                    For example, if CR is 150% and liquidation threshold is 120%, the premium rate is ~25%.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 3</span>
                    <span className="font-bold text-cyan-300">Buyer Payment</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    Transaction 1: premiumTokens (xUSD) → Protocol<br/>
                    Transaction 2: debtAmount (base token) → Protocol
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The buyer sends two transactions: one paying the premium in buyout tokens (typically xUSD), 
                    and another repaying the full debt in the market's base token.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 4</span>
                    <span className="font-bold text-cyan-300">Loan Closure & Collateral Transfer</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    loan_record(debtor).delete()<br/>
                    assetTransfer(collateral → buyer)
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The borrower's loan record is deleted, freeing them from the debt obligation, 
                    and all collateral is transferred to the buyer.
                  </p>
                </div>

                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded px-2 py-1 text-xs font-bold shrink-0">STEP 5</span>
                    <span className="font-bold text-cyan-300">Premium Distribution</span>
                  </div>
                  <code className="text-xs text-slate-400 block ml-16">
                    splitPremium(premiumTokens, borrower, protocol)<br/>
                    // Default: 50% to borrower, 50% to protocol treasury
                  </code>
                  <p className="text-xs text-slate-400 ml-16 mt-2">
                    The premium is split between the original borrower (who receives a bonus for their position) 
                    and the protocol treasury. This split ratio can be adjusted via governance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Who Benefits and Why */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Who Benefits From Buyouts?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-green-400 font-bold mb-3 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  For Borrowers
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Receive 50% of the premium as bonus payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Exit position without manually repaying debt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Realize profit on appreciated collateral</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Avoid manual position management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Debt obligation completely cleared</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-3 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  For Buyers
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Acquire yield-bearing collateral (LSTs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>No need to create own borrowing position</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Access to curated collateral opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Transparent on-chain pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Immediate settlement, no counterparty risk</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-3 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  For Protocol
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Earns 50% of all premiums</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Creates additional utility and liquidity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Reduces active loan management burden</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Innovative revenue stream beyond interest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Differentiates from other lending protocols</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example Scenarios */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Buyout Example Scenarios
            </h3>
            
            <div className="space-y-6">
              {/* Scenario 1 */}
              <div>
                <h4 className="text-cyan-300 font-bold mb-3 text-sm">Scenario 1: Collateral Appreciation Play</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 bg-opacity-50 rounded p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-2 font-bold">Initial Loan Position:</p>
                      <ul className="space-y-1 text-xs">
                        <li>Collateral: 500 cALGO @ $0.20 = $100</li>
                        <li>Debt: $50 USDCt</li>
                        <li>Health Ratio (CR): 200% (2.0x)</li>
                        <li>Liquidation Threshold: 120%</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900 bg-opacity-50 rounded p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-2 font-bold">After cALGO Appreciates 50%:</p>
                      <ul className="space-y-1 text-xs">
                        <li>Collateral: 500 cALGO @ $0.30 = $150</li>
                        <li>Debt: $50 USDCt (unchanged)</li>
                        <li className="text-green-400 font-bold">Health Ratio: 300% (3.0x)</li>
                        <li>Very healthy position!</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-cyan-900 bg-opacity-30 rounded p-4 border border-cyan-600">
                    <p className="text-cyan-300 font-bold text-xs mb-2">Buyout Calculation:</p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <code className="text-cyan-200">
                          Premium Rate = (300% × 10000 ÷ 120%) - 10000 = 15000 bps = <span className="text-pink-400">150%</span>
                        </code>
                      </div>
                      <div>
                        <code className="text-cyan-200">
                          Premium = $150 × 150% ÷ 100% = <span className="text-pink-400">$225</span>
                        </code>
                      </div>
                      <div className="pt-2 border-t border-cyan-700 mt-2">
                        <p className="text-cyan-200 mb-2 font-bold">Buyer pays:</p>
                        <ul className="space-y-1 ml-4">
                          <li>→ Debt repayment: $50 USDCt</li>
                          <li>→ Premium: $225 xUSD</li>
                          <li className="text-cyan-300 font-bold">→ Total cost: <span className="text-pink-400">$275</span></li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-cyan-700 mt-2">
                        <p className="text-green-200 mb-2 font-bold">Buyer receives:</p>
                        <ul className="space-y-1 ml-4">
                          <li>→ 500 cALGO (worth $150)</li>
                          <li>→ Plus ongoing <span className="text-pink-400">staking yield</span> from cALGO</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-cyan-700 mt-2">
                        <p className="text-green-200 mb-2 font-bold">Borrower receives:</p>
                        <ul className="space-y-1 ml-4">
                          <li>→ Original collateral equity: $150 - $50 = $100</li>
                          <li>→ Plus 50% of premium: $225 ÷ 2 = $112.50</li>
                          <li className="text-green-400 font-bold">→ Total received: <span className="text-pink-400">$212.50</span> (112.5% profit!)</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-cyan-700 mt-2">
                        <p className="text-cyan-200 mb-2 font-bold">Protocol receives:</p>
                        <ul className="space-y-1 ml-4">
                          <li>→ 50% of premium: $112.50</li>
                          <li>→ Revenue for treasury</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 2 */}
              <div>
                <h4 className="text-cyan-300 font-bold mb-3 text-sm">Scenario 2: LST Yield Acquisition</h4>
                <p className="text-xs text-slate-400 mb-3">
                  A buyer wants to acquire <span className="text-pink-400">liquid staking tokens (LSTs)</span> like cALGO for the staking yield, 
                  but doesn't want to borrow or manage a position themselves.
                </p>
                <div className="bg-slate-900 bg-opacity-50 rounded p-4 border border-slate-700">
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">1.</span>
                      <span>Browse the debt marketplace for healthy positions with LST collateral</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">2.</span>
                      <span>Find a position: 1000 cALGO collateral, $180 debt, 200% health ratio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">3.</span>
                      <span>Execute buyout: pay debt + premium (~$300 total for $200 worth of cALGO)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">4.</span>
                      <span>Receive 1000 cALGO which earns <span className="text-pink-400">~5-8% APY</span> from staking rewards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span className="text-cyan-200">Result: Buyer now holds yield-bearing cALGO without needing to borrow or lock collateral themselves</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Buyouts vs Liquidations */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Buyouts vs. Liquidations: Key Differences
            </h3>
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="text-left p-3 text-slate-400 font-mono text-xs">Feature</th>
                    <th className="text-left p-3 text-cyan-400 font-mono text-xs">Buyouts</th>
                    <th className="text-left p-3 text-red-400 font-mono text-xs">Liquidations</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-700">
                    <td className="p-3 text-slate-300 font-bold">Loan Health</td>
                    <td className="p-3 text-cyan-200">Healthy (above threshold)</td>
                    <td className="p-3 text-red-200">Unhealthy (below threshold)</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="p-3 text-slate-300 font-bold">Buyer Payment</td>
                    <td className="p-3 text-cyan-200">Debt + Premium ({">"} collateral value)</td>
                    <td className="p-3 text-red-200">Debt only ({"<"} collateral value)</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="p-3 text-slate-300 font-bold">Borrower Outcome</td>
                    <td className="p-3 text-green-200">Profit (debt + equity + bonus)</td>
                    <td className="p-3 text-red-200">Loss (loses all collateral)</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="p-3 text-slate-300 font-bold">Protocol Revenue</td>
                    <td className="p-3 text-cyan-200">50% of premium</td>
                    <td className="p-3 text-red-200">Liquidation bonus (~5-10%)</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="p-3 text-slate-300 font-bold">Purpose</td>
                    <td className="p-3 text-cyan-200">Market opportunity / voluntary exit</td>
                    <td className="p-3 text-red-200">Safety mechanism / forced exit</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="p-3 text-slate-300 font-bold">Eligibility</td>
                    <td className="p-3 text-cyan-200">CR {">"} Liquidation Threshold</td>
                    <td className="p-3 text-red-200">CR ≤ Liquidation Threshold</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Execute Buyouts */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">How to Execute a Buyout</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">1</span>
                <div>
                  <h4 className="text-cyan-300 font-bold mb-1 text-sm">Navigate to Trade (Marketplace)</h4>
                  <p className="text-xs text-slate-400">
                    Visit the Trade page to browse all available debt positions in the protocol.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">2</span>
                <div>
                  <h4 className="text-cyan-300 font-bold mb-1 text-sm">Filter for Healthy Positions</h4>
                  <p className="text-xs text-slate-400">
                    Look for positions with <span className="text-pink-400">high health ratios</span> (green status). Only healthy positions above 
                    the liquidation threshold are eligible for buyout.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">3</span>
                <div>
                  <h4 className="text-cyan-300 font-bold mb-1 text-sm">Review Buyout Terms</h4>
                  <p className="text-xs text-slate-400">
                    Click on a position to view detailed buyout terms including <span className="text-pink-400">total cost</span> (debt + premium), 
                    collateral you'll receive, and expected yield if applicable.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">4</span>
                <div>
                  <h4 className="text-cyan-300 font-bold mb-1 text-sm">Ensure Sufficient Funds</h4>
                  <p className="text-xs text-slate-400">
                    You'll need both the debt repayment amount (in the market's base token) and the premium amount 
                    (typically in xUSD) in your wallet.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">5</span>
                <div>
                  <h4 className="text-cyan-300 font-bold mb-1 text-sm">Execute Buyout</h4>
                  <p className="text-xs text-slate-400">
                    Click "Buy Out Position" and approve the transaction. The buyout is <span className="text-pink-400">atomic</span>: either everything 
                    succeeds or nothing happens. You'll receive the collateral immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Innovation Box */}
          <div className="bg-gradient-to-br from-cyan-900 via-slate-800 to-cyan-900 bg-opacity-50 border-2 border-cyan-500 border-opacity-30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-cyan-300 font-bold mb-3 text-lg">
                  A New DeFi Primitive
                </h4>
                <div className="text-cyan-100 text-sm space-y-2">
                  <p>
                    Buyouts represent a <span className="text-pink-400">fundamental innovation</span> in DeFi lending. While most protocols only offer 
                    liquidation as a resolution mechanism, Orbital's buyout system creates:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>A liquid secondary market for debt positions</li>
                    <li>Win-win scenarios where borrowers profit from premiums</li>
                    <li>New strategies for collateral acquisition</li>
                    <li>Additional revenue streams for the protocol</li>
                    <li>Reduced need for manual position management</li>
                  </ul>
                  <p className="mt-3 text-cyan-200 font-bold">
                    This transforms lending from a purely utilitarian function into a <span className="text-pink-400">dynamic marketplace</span> 
                    with emergent strategies and opportunities.
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

export default BuyoutsSection;

