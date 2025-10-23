A New Mechanism in DeFi Lending

Most DeFi lending protocols resolve debt in one way: liquidation. When a borrower’s collateral ratio drops below the required threshold, their position is liquidated by third parties at a discount. While effective for maintaining solvency, this system leaves little room for optionality or innovation.
Orbital introduces something new: a Debt Marketplace, where even healthy loans can be bought out for a premium. This creates an entirely new layer of flexibility and opportunity for borrowers, lenders, and traders alike.
How It Works

Borrower opens a loan using c-assets (e.g. cALGO) as collateral.
Loan is healthy and above the liquidation threshold.
A third party (the “buyer”) chooses to buy out the loan by paying a single buyout price.
That payment simultaneously:
Repays the borrower’s debt
Returns the borrower’s equity
Pays a premium fee, split between borrower and protocol
The transaction is fully on-chain and atomic: no debt is left behind, collateral is transferred instantly, and the premium is distributed fairly.
How the Buyout Price is Calculated

The buyout price is derived from the loan’s Collateral Ratio (CR) compared to the liquidation threshold. The healthier the loan, the higher the premium a buyer must pay.
const premiumRate_bps =
    (CR_bps * 10000) / liq_threshold_bps - 10000 // basis points

const buyoutPrice =
    collateralUSD * (1 + premiumRate_bps / 10000)
Equivalently:
buyoutPrice=Collateral Value+Debt+PremiumbuyoutPrice=Collateral Value+Debt+Premium
Where:
Debt (D): principal + accrued interest (always repaid)
Borrower Equity (C − D): what the borrower would recover if they repaid normally
Premium (F): additional fee = buyoutPrice − collateralValue, split 50/50 between borrower and protocol (initial setting, adjustable by governance)
Example Scenarios: Why a Buyout Happens

1. Arbitrage Opportunity
Collateral = $1,000
Debt = $500
CR = 200%, Threshold = 150%
Premium Rate: 33%
Buyout Price: $1,333
Settlement of the single $1,333 payment:
$500 → debt repaid
$500 → borrower equity returned
$333 → fee, split $166.50 borrower / $166.50 protocol
✅ Borrower exits with $666.50
✅ Buyer receives $1,000 collateral to deploy in arbitrage
✅ Protocol captures $166.50 revenue
2. Fast Exit for Liquidity
Collateral = $4,000
Debt = $2,000
CR = 200%, Threshold = 160%
Premium Rate: 25%
Buyout Price: $5,000
Settlement of the single $5,000 payment:
$2,000 → debt repaid
$2,000 → borrower equity returned
$1,000 → fee, split $500 borrower / $500 protocol
✅ Borrower exits instantly with $2,500
✅ Buyer gains $4,000 collateral
✅ Protocol books $500
3. Ecosystem Partner Campaign
Collateral = $2,000
Debt = $800
CR = 250%, Threshold = 170%
Premium Rate: ≈ 47%
Buyout Price: $2,940
Settlement of the single $2,940 payment:
$800 → debt repaid
$1,200 → borrower equity returned
$940 → fee, split $470 borrower / $470 protocol
✅ Borrower receives $1,670 in total
✅ Buyer secures $2,000 collateral
✅ Protocol earns $470 (plus any partner incentives layered on)
Risks & Considerations

For Borrowers
Loss of position: Being bought out means losing collateral, even if healthy.
Fee calibration: If buyout premiums are set too low, positions could be bought out more frequently than desired.
For Buyers
Collateral risk: Acquiring collateral means exposure to its market value.
Premium mispricing: Overpaying relative to collateral value reduces profitability.
For the Protocol
Governance balance: Fee splits and premium rates must be tuned carefully.
Market dynamics: Buyouts introduce new strategies that governance must monitor.
Why It Matters

The Debt Marketplace transforms Orbital into more than a traditional lending protocol. It creates a multi-sided marketwhere:
Borrowers can exit flexibly and earn a share of fees
Lenders benefit from certainty of repayment
Traders gain structured entry points into collateral
Ecosystem partners can use buyouts as an incentive and distribution channel
By ensuring every buyout covers debt, equity, and premium, Orbital makes debt itself into a tradable asset class, unlocking new liquidity pathways and strengthening system resilience.
🔭 In essence: The Debt Marketplace is Orbital’s most innovative feature — giving DeFi participants more choice, more flexibility, and more opportunity. With transparent money flows that always cover debt and equity, and a premium that rewards both borrower and protocol, Orbital reimagines debt as a dynamic, tradable resource.