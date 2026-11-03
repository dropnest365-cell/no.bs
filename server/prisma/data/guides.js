// Editorial guides. Factual statements are deliberately general and point to
// official portals, because rules and thresholds change. Reviewed 2026-11-03.

const common = [
  { label: 'Startup India', url: 'https://www.startupindia.gov.in/' },
  { label: 'Ministry of Corporate Affairs', url: 'https://www.mca.gov.in/' },
  { label: 'Udyam Registration', url: 'https://udyamregistration.gov.in/' },
  { label: 'GST Portal', url: 'https://www.gst.gov.in/' },
];

export const guides = [
  {
    slug: 'business-registration-india',
    title: 'Business registration in India: a practical starting map',
    excerpt:
      'Sole proprietorship, partnership, LLP or private limited company? Understand the trade-offs before you pay for registrations you may not need yet.',
    category: 'Registration',
    body: `## Start with the real requirement

Registration is not a single event. It is a set of registrations that depend on what you sell, where you operate, how many people you employ and who your customers are. A freelancer working alone, a food business with a kitchen and a startup raising investment do not need the same stack.

Before registering anything, answer four questions:

- Will you take on partners or investors?
- Will you employ people?
- Do you need to invoice other businesses or government departments?
- Does your activity need a sector-specific licence, such as food, health or transport?

## Common structures

### Sole proprietorship
The business is you. It is the simplest and cheapest way to start, and you can open a current account using your PAN and proof of business. There is no separate legal entity, which means you are personally liable for debts and disputes. Many freelancers and small shops start here.

### Partnership firm
Two or more people agree to share ownership, profit and losses through a partnership deed. A partnership firm is generally not a separate legal entity in the way a company is. Registration with the Registrar of Firms is state-specific. A written deed covering capital, roles, profit sharing, exits and dispute resolution is essential.

### Limited Liability Partnership (LLP)
An LLP is a separate legal entity with limited liability for partners, registered through the MCA. It suits professional firms and small businesses that want a formal structure without the full compliance load of a company. Annual filings still apply.

### Private Limited Company
A private limited company is a separate legal entity owned by shareholders. It is the usual structure for businesses that plan to raise equity, issue employee stock options or work with larger corporate customers. It also brings board meetings, statutory filings, audits and more compliance. Do not incorporate only because it sounds more professional; understand the ongoing obligations.

### One Person Company
The OPC structure allows a single person to operate a company with limited liability, subject to conditions in company law. Check the current MCA rules and eligibility before choosing it.

## Registrations that apply across structures

- **PAN and TAN** for tax and, where applicable, tax deduction.
- **Udyam registration** for MSME benefits. The official portal is free. Benefits and eligibility vary; verify current details.
- **GST registration** when your turnover or activity requires it. Thresholds differ by category and state, so check the GST portal rather than relying on a blog.
- **Shops and Establishments registration** under your state's rules for commercial premises and employees.
- **Professional tax** in states that levy it.
- **Current account** in the business name, with the documents your bank requires.

Sector-specific examples: FSSAI for food businesses, pollution control consent for certain manufacturing or waste activities, and transport permits for commercial vehicles.

## Sequence that avoids wasted money

1. Validate the business and start earning with the simplest compliant setup.
2. Open a separate bank account and keep business money separate.
3. Add Udyam and GST when they are actually required or clearly useful.
4. Incorporate a company or LLP when a contract, investor, partner or liability situation demands it.
5. Ask a qualified chartered accountant before making tax or structure decisions.

## Sources and verification

Rules, fees and thresholds change. Use the official portals below and confirm the current position for your state and activity. This guide is general information, not legal or tax advice.`,
    sources: common,
  },
  {
    slug: 'gst-basics-small-business',
    title: 'GST basics for small businesses in India',
    excerpt:
      'What GST is, when registration may apply, how invoicing works, and where to verify the rules instead of trusting outdated advice.',
    category: 'Tax',
    body: `## What GST is

Goods and Services Tax is an indirect tax on the supply of goods and services. Registered businesses collect GST on taxable supplies and generally claim credit for GST paid on business purchases. The net amount is deposited with the government. GST is administered through the official GST portal and state commercial tax departments.

## When registration may be required

Registration depends on factors including turnover, the type of supply, the state, and whether you sell through an e-commerce platform. Thresholds are revised from time to time, and special categories exist. **Do not rely on a number from an old article.** Check the current registration criteria on the official GST portal or ask a qualified professional.

Voluntary registration can make sense if your customers are businesses that want input tax credit, or if you need to sell through platforms that require it. It also adds compliance work, so weigh the benefit.

## Invoicing basics

A tax invoice generally includes:

- Your legal name, address and GSTIN
- Invoice number and date
- Customer details and place of supply
- Description, quantity and taxable value of each item
- GST rate and amount, split into CGST/SGST or IGST as applicable
- Total value and signature or digital authentication

Keep invoices sequential and backed up. Do not issue a tax invoice unless you are registered and the supply is taxable in the way you describe.

## Returns and records

Registered businesses file periodic returns, the frequency of which depends on turnover and scheme. Maintain purchase invoices, sales invoices, bank statements, e-way bills where applicable, and records of credit notes. A bookkeeper or accountant can set up a monthly close process.

## Composition scheme

The composition scheme is a simplified option for some small taxpayers. Eligibility, rates and restrictions vary and are not suitable for every business, especially those that need to pass on input tax credit. Check the official portal for current conditions.

## E-commerce sellers

Marketplace sellers often need to consider GST registration regardless of turnover, depending on the platform and the nature of supply. The rules have changed more than once. Confirm the current requirement on the GST portal and with the marketplace before you start selling.

## Common mistakes

- Mixing personal and business bank accounts.
- Collecting GST without being registered.
- Claiming input credit without a valid invoice.
- Assuming a low turnover means no compliance at all.
- Using an agent who charges a fee for something available free on the official portal.

## Sources and verification

This is general information, not tax advice. Use the GST portal and consult a qualified chartered accountant for your specific situation.`,
    sources: [
      { label: 'GST Portal', url: 'https://www.gst.gov.in/' },
      { label: 'GST — taxpayer resources', url: 'https://www.gst.gov.in/help' },
      { label: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in/' },
      { label: 'Startup India', url: 'https://www.startupindia.gov.in/' },
    ],
  },
  {
    slug: 'udyam-registration-guide',
    title: 'Udyam registration: what it is and how to avoid paying for it',
    excerpt:
      'Udyam is the official MSME registration portal. It is free, online, and does not require an agent. Here is what to prepare and what it does not do.',
    category: 'Registration',
    body: `## What Udyam registration is

Udyam registration is the Government of India's online registration process for micro, small and medium enterprises. It creates an Udyam Registration Number and certificate. The official portal is run by the Ministry of Micro, Small and Medium Enterprises.

## What you need

- Aadhaar for the proprietor, partner, director or authorised signatory
- PAN details of the enterprise or owner as required by the form
- Business activity details and investment/ turnover information
- Bank account and contact details

The form is designed to link with government databases. Keep your details accurate and update them if they change.

## It is free

The official Udyam portal does not charge a registration fee. Be cautious of third-party websites that charge for a "certificate" or ask for unnecessary personal documents. Go directly to **udyamregistration.gov.in**.

## What it can help with

MSME registration is commonly used to access schemes, priority sector lending support, certain tender opportunities and state-level benefits. Eligibility and benefits differ by scheme and change over time. Registration is not a guarantee of a loan, subsidy or approval.

## What it does not replace

Udyam is not a substitute for:

- GST registration where applicable
- Shops and Establishments registration
- FSSAI licensing for food businesses
- Company or LLP incorporation
- Sector-specific licences

## Practical tips

- Use the same legal name and PAN consistently across registrations.
- Keep a digital copy of the certificate and update details when they change.
- Check the official portal for current scheme information rather than relying on WhatsApp forwards.
- If someone offers to "guarantee" a loan because of Udyam, treat that claim with scepticism.

## Sources and verification

Use the official Udyam portal and the Ministry of MSME website. Rules and linked schemes can change; this guide is general information.`,
    sources: [
      { label: 'Udyam Registration', url: 'https://udyamregistration.gov.in/' },
      { label: 'Ministry of MSME', url: 'https://msme.gov.in/' },
      { label: 'Startup India', url: 'https://www.startupindia.gov.in/' },
      { label: 'MyMSME', url: 'https://my.msme.gov.in/' },
    ],
  },
  {
    slug: 'validate-business-idea-before-spending',
    title: 'How to validate a business idea before spending money',
    excerpt:
      'A practical validation sequence using customer conversations, small paid tests and honest evidence — without invented market-size numbers.',
    category: 'Strategy',
    body: `## Validation is evidence, not encouragement

Friends and family will tell you your idea is good. That is not validation. Validation means evidence that a specific group of people will pay for a specific outcome, delivered in a way you can sustain. You do not need a perfect market report. You need a handful of honest signals.

## 1. Write the idea as a sentence

Use this format:

> For **[specific customer]**, who struggles with **[specific problem]**, we provide **[specific outcome]** for **[price range]**, delivered by **[channel]**. Unlike **[alternatives]**, we **[difference]**.

If you cannot fill in each blank, you are not ready to spend money.

## 2. Talk to 10 potential customers

Ask about their current behaviour, not your idea:

- What did you do the last time this problem came up?
- What did it cost you in money, time or stress?
- What alternatives did you try, and why did they fail?
- Who decides the purchase?
- What would make you switch?

Do not pitch. Do not ask "would you buy this?" People say yes to be polite. Ask what they already pay for.

## 3. Study the alternatives honestly

List direct competitors, informal workarounds and doing nothing. Note their prices, weaknesses and reviews. If there are no competitors, ask why. Sometimes the market is genuinely underserved; often it means nobody pays for the solution.

## 4. Run a small paid test

The strongest early signal is money. Depending on the business, you can:

- Pre-sell a small batch or first cohort.
- Offer a paid pilot to three customers.
- Run a small ad test with a clear budget and measure enquiries, not likes.
- Sell at a local market or through a marketplace with a limited inventory.

Set a maximum test budget you can afford to lose. Decide in advance what result would make you continue, change or stop.

## 5. Calculate the unit economics

For one sale or one month, estimate revenue, direct costs, delivery costs, payment fees, returns and your time. If the margin is negative before marketing, the business will not be fixed by more customers. Use the calculators on NO BS to model scenarios, and label every number as an estimate.

## 6. Look for repeated evidence

One customer is an anecdote. Look for a pattern: the same problem, the same willingness to pay and the same objections across multiple conversations. Write down what surprised you. Update the idea.

## 7. Decide: continue, change or stop

Define the evidence you wanted and compare it honestly. It is cheaper to stop a weak idea after two weeks of research than after six months of building.

## What not to do

- Do not invent market-size statistics or cite sources you have not read.
- Do not interpret social media likes as demand.
- Do not spend on branding before you have a paying customer.
- Do not hide behind surveys; talk to people.

## Sources and further reading

There is no official government certificate for idea validation. Use credible customer research and official market data where available, such as the Census of India or RBI statistics. Treat forecasts as assumptions, not facts.`,
    sources: [
      { label: 'Census of India', url: 'https://censusindia.gov.in/' },
      { label: 'RBI Database on Indian Economy', url: 'https://dbie.rbi.org.in/' },
      { label: 'Startup India', url: 'https://www.startupindia.gov.in/' },
      { label: 'Google Trends', url: 'https://trends.google.com/' },
    ],
  },
  {
    slug: 'pricing-services-india',
    title: 'Pricing your services without underpricing your work',
    excerpt:
      'A three-layer pricing method: cover your costs, understand the market range, then price the outcome. Includes a simple formula you can apply today.',
    category: 'Finance',
    body: `## The three layers of a service price

### 1. Your cost floor

Calculate what one month of work must earn to cover:

- Your personal living costs (or the salary you need to take)
- Business expenses: software, internet, transport, rent, insurance
- Taxes and professional fees
- A buffer for slow months and unpaid admin time

Then divide by the billable hours you can realistically sell. A freelancer who works 40 hours a week does not have 40 billable hours; sales, admin and learning take a large share.

**Minimum hourly rate = (monthly costs + buffer) ÷ realistic billable hours**

For project work, multiply your estimated hours by this rate, then add a contingency for revisions and delays.

### 2. The market range

Look at what comparable providers charge for similar scope. Compare deliverables, not just price. A ₹5,000 website and a ₹50,000 website are not the same product. If your price is far below the market, buyers may assume lower quality; if it is far above, you need a clear reason.

### 3. The value layer

When the outcome has a clear financial impact, price can be tied to value rather than hours. For example, a booking system that reduces no-shows has a measurable value. Be conservative: do not claim results you cannot evidence, and offer a fixed scope so the client knows what they are buying.

## A simple project pricing formula

1. Estimate hours for each deliverable.
2. Add 20–30% for revisions and project management.
3. Multiply by your minimum hourly rate.
4. Add direct costs (stock, travel, software, subcontractors).
5. Compare with the market range and adjust with a reason.
6. Add applicable taxes and state them separately.

## Structure payments

- Take an advance before starting, especially for new clients.
- Split large projects into milestones.
- Define revision rounds in the proposal.
- Charge for additional scope through a written change request.
- Include a late-payment clause and a clear cancellation policy.

## Common pricing mistakes

- Quoting before understanding the scope.
- Pricing against the cheapest competitor.
- Offering unlimited revisions.
- Forgetting payment gateway fees and taxes.
- Discounting without removing scope.
- Raising prices only when resentful.

## Test your numbers

Use the NO BS Pricing Calculator to see the effect of costs, operating expenses and target margin. The output is an estimate, not a guarantee of what customers will pay.`,
    sources: [
      { label: 'GST Portal', url: 'https://www.gst.gov.in/' },
      { label: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in/' },
      { label: 'Startup India', url: 'https://www.startupindia.gov.in/' },
      { label: 'Udyam Registration', url: 'https://udyamregistration.gov.in/' },
    ],
  },
  {
    slug: 'small-business-bookkeeping',
    title: 'A simple bookkeeping system for a small Indian business',
    excerpt:
      'Separate accounts, a monthly close checklist, and the records worth keeping. Designed for owners who are not accountants.',
    category: 'Finance',
    body: `## Why bookkeeping matters before tax season

Good records tell you whether the business is actually making money, which customers pay late, and where cash is leaking. They also make tax filing and loan applications far easier. You do not need complex software to start, but you do need consistency.

## 1. Separate business and personal money

Open a current account in the business name as soon as possible. Pay business expenses from that account and transfer your own salary or drawings separately. Mixing transactions makes it almost impossible to know the true profit.

## 2. Record every sale and expense

At minimum, keep:

- Sales invoices with date, customer, description, amount and tax
- Purchase bills and receipts
- Bank and payment gateway statements
- Payroll and contractor payments
- Asset purchases such as equipment
- Loan and EMI records

Photograph paper receipts immediately and store them in dated folders. A spreadsheet is enough for a very small business; move to accounting software when transaction volume grows.

## 3. Do a monthly close

Set aside one hour on the same day each month:

1. Download bank and payment gateway statements.
2. Match every transaction to an invoice or expense.
3. Categorise expenses consistently.
4. Review unpaid invoices and follow up.
5. Reconcile cash on hand.
6. Produce a simple profit and loss view and a cash balance.
7. Set aside estimated tax and GST amounts.

## 4. Understand three numbers

- **Gross margin:** revenue minus direct costs of delivering the product or service.
- **Net profit:** what remains after all operating expenses.
- **Cash available:** money in the bank minus upcoming obligations. A profitable business can still run out of cash if customers pay late.

## 5. Keep records safely

Use a password manager, two-factor authentication and encrypted backups. Do not share financial credentials over WhatsApp. Keep records for the period required by tax and company law; ask your accountant for the current requirement.

## 6. Work with a professional

A bookkeeper can maintain records, but tax positions and statutory filings should be handled or reviewed by a qualified chartered accountant. Be clear about who is responsible for what. Do not let an unqualified person file returns on your behalf without review.

## Red flags

- No separation between personal and business spending.
- Invoices issued without sequential numbers.
- Cash sales not recorded.
- GST collected but not set aside.
- Software subscription with no bank reconciliation.

## Sources and verification

This is general information, not accounting or tax advice. Verify current filing requirements on the Income Tax and GST portals, and consult a qualified professional.`,
    sources: [
      { label: 'Income Tax e-Filing', url: 'https://www.incometax.gov.in/' },
      { label: 'GST Portal', url: 'https://www.gst.gov.in/' },
      { label: 'MCA', url: 'https://www.mca.gov.in/' },
      { label: 'ICAI', url: 'https://www.icai.org/' },
    ],
  },
  {
    slug: 'food-business-licensing-india',
    title: 'Food business licensing in India: FSSAI and local permissions',
    excerpt:
      'The three FSSAI licence categories, what to prepare, and the local permissions food businesses often forget.',
    category: 'Compliance',
    body: `## FSSAI registration and licensing

The Food Safety and Standards Authority of India regulates food businesses. Most food businesses need either a registration or a licence, depending on scale and activity. Applications are made through the FoSCoS portal.

The three broad categories are commonly described as:

- **Basic Registration** for small-scale food businesses below the turnover threshold set by FSSAI.
- **State Licence** for businesses above the basic threshold and within state-level limits.
- **Central Licence** for larger businesses, importers, and certain categories defined by FSSAI.

Thresholds and category rules can change. Check the current FSSAI and FoSCoS guidance before applying.

## What to prepare

- Identity and address proof of the proprietor or entity
- Business address and premises details
- Nature of food business (manufacturing, storage, transport, retail, catering, etc.)
- Product list
- Water test report where required
- Layout plan for manufacturing units
- Food safety management plan for larger categories

Fees depend on the licence category. Use the official portal; do not pay an unverified agent without a written scope.

## Local permissions

Food businesses may also need:

- Shops and Establishments registration
- Municipal trade licence
- Fire safety clearance for larger premises
- Pollution control consent for certain processing units
- Waste disposal arrangements, especially for oil and organic waste

Requirements differ by state and municipality. Check your local municipal corporation website.

## Hygiene basics that matter in practice

- Train staff on handwashing, illness reporting and safe food handling.
- Keep raw and cooked food separate.
- Maintain temperature control for cold storage and hot holding.
- Label allergens and vegetarian/non-vegetarian status correctly.
- Keep pest control and cleaning records.
- Use food-grade packaging and check supplier documentation.

## Home kitchens

Home-based food businesses can be eligible for registration, but local rules on home commercial activity vary. Confirm with your municipality and FSSAI guidance. Do not assume that a home kitchen is exempt.

## Labelling and claims

Pre-packaged food must follow labelling rules, including ingredients, allergens, nutrition information and date marking. Do not make health claims that are not permitted or proven. "Natural" and "healthy" are not free passes.

## Sources and verification

Use FSSAI and FoSCoS for current rules, categories and fees. This guide is general information, not legal advice.`,
    sources: [
      { label: 'FSSAI', url: 'https://fssai.gov.in/' },
      { label: 'FoSCoS', url: 'https://www.foscos.fssai.gov.in/' },
      { label: 'FSSAI — FoSCoS portal', url: 'https://www.foscos.fssai.gov.in/' },
      { label: 'Consumer Affairs', url: 'https://consumeraffairs.nic.in/' },
    ],
  },
  {
    slug: 'online-seller-compliance-india',
    title: 'Compliance basics for online sellers in India',
    excerpt:
      'Disclosures, returns, reviews, GST and product rules that online sellers should understand before scaling.',
    category: 'Compliance',
    body: `## Consumer protection applies online

E-commerce sellers must follow consumer protection law, including the Consumer Protection (E-Commerce) Rules, 2020. The exact obligations depend on whether you are a marketplace or an inventory seller, but the direction is clear: be identifiable, describe products accurately, provide a grievance contact, and do not use unfair trade practices.

## Disclosures to get right

- Legal name of the business and a contact address
- Customer care contact and grievance officer details where required
- Clear return, refund, exchange and shipping policies
- Country of origin and seller details where required by the platform
- Accurate product description, ingredients, dimensions and warnings
- Total price including taxes and mandatory charges

## Reviews and ratings

Do not buy reviews, post fake reviews or suppress negative reviews improperly. Do not pay for ratings without disclosure. Platforms and regulators increasingly act on manipulated reviews.

## Product-specific rules

Some products need certifications, licences or labelling before sale. Examples include certain electronics, food, cosmetics, children's products, medical devices and products with legal metrology requirements. Check the relevant regulator before listing:

- BIS for many regulated products
- FSSAI for food
- CDSCO for medical devices and drugs
- Legal Metrology authorities for packaged commodities

If you are unsure, ask the platform and a compliance professional. Ignorance is not a defence.

## GST and marketplace selling

Marketplace sellers often need GST registration, but the rules depend on the platform and the supply. Verify the current requirement on the GST portal and with the marketplace. Keep purchase invoices so input tax credit can be claimed where eligible.

## Returns and refunds

A clear policy reduces disputes:

- State the return window and condition requirements.
- Explain who pays return shipping.
- Process refunds within the stated time.
- Keep records of damaged or missing items.
- Do not use "no returns" to avoid obligations that apply by law.

## Data and privacy

Collect only the customer data you need. Do not sell customer data. Secure your accounts with two-factor authentication and limit access to order information. If you use a website, publish a privacy policy that explains what you collect and why.

## Advertising claims

Avoid claims such as "best", "guaranteed", "100% safe" unless you can substantiate them. Influencer promotions should be clearly disclosed. The ASCI code is a useful reference for advertising standards.

## Sources and verification

Rules change. Use the official portals below and the specific marketplace seller policies. This is general information, not legal advice.`,
    sources: [
      { label: 'Consumer Affairs', url: 'https://consumeraffairs.nic.in/' },
      { label: 'GST Portal', url: 'https://www.gst.gov.in/' },
      { label: 'BIS', url: 'https://www.bis.gov.in/' },
      { label: 'FSSAI', url: 'https://fssai.gov.in/' },
      { label: 'ASCI', url: 'https://www.ascionline.in/' },
    ],
  },
];
