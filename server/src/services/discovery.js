const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'is', 'are', 'be', 'can', 'i',
  'my', 'we', 'our', 'you', 'your', 'it', 'this', 'that', 'how', 'what', 'should', 'would', 'do', 'does',
  'business', 'start', 'starting', 'idea', 'ideas', 'india', 'indian', 'small', 'new', 'best', 'good',
]);

export function tokenize(text = '') {
  return [...new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  )];
}

export function scoreText(tokens, text, weight = 1) {
  const haystack = String(text || '').toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += weight;
  }
  return score;
}

export function findRelevantIdeas(ideas, query, limit = 3) {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return ideas
    .map((idea) => {
      let score = 0;
      score += scoreText(tokens, idea.title, 6);
      score += scoreText(tokens, idea.summary, 2);
      score += scoreText(tokens, idea.targetCustomers, 2);
      score += scoreText(tokens, idea.description, 1);
      score += scoreText(tokens, idea.category?.name, 2);
      return { idea, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.idea);
}

export const domains = [
  {
    key: 'food',
    label: 'food and beverage',
    keywords: ['food', 'restaurant', 'cafe', 'bakery', 'cake', 'tiffin', 'catering', 'kitchen', 'snack', 'juice', 'coffee', 'sweets', 'cloud'],
    categories: ['food-beverage'],
    audience: 'local households, students, offices and event buyers within a realistic delivery or walk-in radius',
    problem: 'Customers want food that is convenient, consistent, safe and fairly priced, often for a specific occasion or daily routine.',
    requirements: ['FSSAI registration or licence through FoSCoS, as applicable', 'A hygienic kitchen or partner kitchen with safe storage', 'Supplier and packaging setup', 'Costing per portion including wastage and delivery', 'A small menu you can execute consistently'],
    revenue: ['Direct orders and repeat customers', 'Delivery platform orders', 'Monthly subscriptions or meal plans', 'Bulk and event orders'],
    risks: ['Food safety failures', 'Thin margins after packaging and commissions', 'Ingredient price swings', 'Seasonal or daily demand fluctuations'],
    skills: ['Food preparation and consistency', 'Hygiene and safety', 'Cost control', 'Customer service'],
    improvements: ['Start with a narrow menu and test it on 20 paying customers', 'Publish allergen and storage information', 'Calculate true cost per order before discounting', 'Build a direct WhatsApp reorder channel'],
  },
  {
    key: 'fashion',
    label: 'fashion and apparel',
    keywords: ['fashion', 'clothing', 'clothes', 'tshirt', 't-shirt', 'apparel', 'tailor', 'boutique', 'designer', 'jewellery', 'jewelry', 'accessories'],
    categories: ['retail', 'creative', 'ecommerce'],
    audience: 'shoppers looking for a particular style, fit, occasion or price point, often discovered through social media or local reputation',
    problem: 'Buyers struggle to find the right fit, style or quality at a trustworthy price, and returns are costly when expectations do not match.',
    requirements: ['Product sourcing or production capacity', 'Accurate sizing and quality checks', 'Photography that represents the product honestly', 'Clear return and exchange policy', 'Inventory or made-to-order workflow'],
    revenue: ['Direct product sales', 'Custom or made-to-order pieces', 'Bulk and occasion orders', 'Accessory add-ons'],
    risks: ['Unsold inventory', 'High return rates', 'Copying or IP disputes', 'Photography and ad costs'],
    skills: ['Product curation', 'Basic design or styling', 'Photography and content', 'Customer service'],
    improvements: ['Validate demand with a small capsule collection', 'Use real product photos rather than supplier images', 'Track return reasons for every order', 'Price for returns and packaging, not just product cost'],
  },
  {
    key: 'education',
    label: 'education and learning',
    keywords: ['education', 'tutor', 'tuition', 'teaching', 'teach', 'course', 'coaching', 'exam', 'student', 'school', 'college', 'training', 'skill'],
    categories: ['education'],
    audience: 'learners or parents with a specific outcome, timeline and budget, usually influenced by referrals and visible teaching quality',
    problem: 'Learners need structured guidance and accountability, and generic free content often does not fit their level or schedule.',
    requirements: ['Demonstrable subject expertise', 'A clear curriculum and assessment method', 'A reliable online or physical classroom setup', 'Fee, attendance and refund policies', 'A way to collect feedback and track progress'],
    revenue: ['One-to-one or small-group fees', 'Cohort programmes', 'Recorded courses or materials', 'Workshops and corporate training'],
    risks: ['Irregular attendance and fee collection', 'Reputation damage from poor outcomes', 'Content becoming outdated', 'Overpromising results'],
    skills: ['Subject knowledge', 'Lesson planning', 'Communication', 'Learner assessment'],
    improvements: ['Run a paid pilot batch before building a full curriculum', 'Limit batch size so learners get attention', 'Measure progress with a short pre/post assessment', 'Never promise marks, ranks or jobs'],
  },
  {
    key: 'software',
    label: 'software and digital products',
    keywords: ['app', 'software', 'saas', 'website', 'web', 'platform', 'tool', 'dashboard', 'automation', 'developer', 'coding', 'tech'],
    categories: ['digital-services', 'digital-products'],
    audience: 'a specific group of users or businesses with a repeated workflow problem and a willingness to pay for a simpler solution',
    problem: 'Users are losing time or money to a manual, fragmented or outdated workflow that existing tools do not handle well.',
    requirements: ['A validated problem and paying pilot users', 'Working software with a narrow first scope', 'Authentication, backups and error monitoring', 'Clear terms, privacy policy and support process', 'A plan for hosting costs and maintenance'],
    revenue: ['Subscriptions', 'Setup or migration fees', 'Usage-based add-ons', 'Custom development for a niche'],
    risks: ['Building something nobody pays for', 'Security or data-loss incidents', 'Support costs growing faster than revenue', 'Dependence on third-party APIs'],
    skills: ['Software development', 'Product design', 'User research', 'Support and documentation'],
    improvements: ['Sell a paid pilot before building the full product', 'Ship one complete workflow, not a broad feature list', 'Instrument onboarding and churn from the first user', 'Write down what you will not support'],
  },
  {
    key: 'marketing',
    label: 'marketing and content',
    keywords: ['marketing', 'content', 'social', 'instagram', 'youtube', 'seo', 'ads', 'advertising', 'copy', 'writing', 'newsletter', 'influencer', 'affiliate'],
    categories: ['marketing', 'content-media', 'design'],
    audience: 'businesses or audiences that need consistent, credible communication and measurable attention, not generic posting',
    problem: 'Businesses struggle to turn attention into enquiries, or audiences struggle to find trustworthy, specific information.',
    requirements: ['A clear niche and content promise', 'A repeatable publishing workflow', 'Analytics and reporting', 'Licensed assets and disclosure practices', 'A defined service scope or monetisation path'],
    revenue: ['Monthly retainers', 'Project fees', 'Sponsorships or affiliate commissions', 'Paid products or workshops'],
    risks: ['Platform algorithm changes', 'Unlimited revisions and scope creep', 'Price pressure from cheap content', 'Unsubstantiated claims and disclosure failures'],
    skills: ['Writing or content production', 'Distribution and analytics', 'Client management', 'Basic design'],
    improvements: ['Pick one channel and one audience for 90 days', 'Report enquiries and revenue, not only impressions', 'Create a paid offer before chasing follower counts', 'Disclose all paid relationships clearly'],
  },
  {
    key: 'fitness',
    label: 'health and fitness',
    keywords: ['fitness', 'gym', 'trainer', 'yoga', 'health', 'wellness', 'nutrition', 'sports', 'workout'],
    categories: ['health-wellness'],
    audience: 'people with a specific health or fitness goal who need structure, accountability and safe guidance',
    problem: 'People struggle to stay consistent or train safely without personalised structure and feedback.',
    requirements: ['Recognised certification and first aid knowledge', 'Client health screening and consent', 'Safe equipment and premises', 'Progress tracking and realistic programme design', 'Clear boundaries on medical advice'],
    revenue: ['Personal training packages', 'Small-group sessions', 'Online coaching', 'Corporate wellness programmes'],
    risks: ['Client injury and liability', 'Income instability from cancellations', 'Burnout from hourly work', 'Advice beyond qualifications'],
    skills: ['Exercise programming', 'Coaching and motivation', 'Safety and screening', 'Basic nutrition guidance'],
    improvements: ['Niche down to one goal or population', 'Use a written screening and consent form', 'Track attendance and renewal, not just signups', 'Refer medical questions to qualified professionals'],
  },
  {
    key: 'home-services',
    label: 'home and local services',
    keywords: ['cleaning', 'laundry', 'repair', 'plumber', 'electrician', 'interior', 'salon', 'beauty', 'car', 'wash', 'service', 'grooming', 'pet'],
    categories: ['local-services', 'home-services', 'beauty', 'auto-services', 'pet-services'],
    audience: 'local households, offices and property managers who value convenience, reliability and trust over the lowest price',
    problem: 'Customers struggle to find reliable local providers, transparent pricing and someone who shows up on time.',
    requirements: ['Reliable staff or a trained solo operator', 'Clear pricing and service scope', 'Booking and follow-up process', 'Safety and hygiene procedures', 'Local permissions or registrations where applicable'],
    revenue: ['Per-job fees', 'Monthly or annual maintenance plans', 'Bulk contracts with apartments and offices', 'Product or parts add-ons'],
    risks: ['Inconsistent quality from staff', 'Damage or service disputes', 'Seasonality', 'High dependence on local reputation'],
    skills: ['Technical service skill', 'Scheduling and dispatch', 'Customer communication', 'Quality control'],
    improvements: ['Start in one neighbourhood to reduce travel time', 'Use a written checklist for every job', 'Photograph before-and-after with permission', 'Build recurring plans instead of one-off jobs'],
  },
  {
    key: 'ecommerce',
    label: 'e-commerce and retail',
    keywords: ['ecommerce', 'e-commerce', 'online store', 'shop', 'store', 'reselling', 'dropshipping', 'product', 'marketplace', 'amazon', 'flipkart', 'kirana', 'grocery'],
    categories: ['ecommerce', 'retail'],
    audience: 'online or local shoppers with a specific product need, often comparing price, reviews, delivery speed and return terms',
    problem: 'Shoppers need trustworthy product information and reliable delivery, while sellers struggle with thin margins and returns.',
    requirements: ['Supplier and product quality checks', 'Accurate listings and photography', 'Inventory or fulfilment plan', 'GST and marketplace compliance', 'Returns and customer support process'],
    revenue: ['Product margin', 'Bundles and repeat purchases', 'Marketplace or direct sales', 'Delivery or subscription fees where appropriate'],
    risks: ['Dead inventory', 'Platform fee changes', 'Return losses', 'Product compliance and counterfeit risk'],
    skills: ['Sourcing', 'Margin calculation', 'Listing optimisation', 'Customer service'],
    improvements: ['Test a small SKU set before bulk buying', 'Calculate landed cost including returns', 'Read platform policies before investing', 'Do not compete only on discount'],
  },
  {
    key: 'creative',
    label: 'creative services',
    keywords: ['photography', 'photographer', 'design', 'graphic', 'video', 'editing', 'artist', 'illustration', 'podcast', 'music'],
    categories: ['creative', 'design', 'content-media'],
    audience: 'businesses, event hosts and publishers who need reliable creative output with a clear style and delivery timeline',
    problem: 'Clients need creative work that fits a specific brand or occasion, but struggle with inconsistent quality and unclear pricing.',
    requirements: ['A portfolio that shows relevant work', 'Reliable equipment and backups', 'Clear packages, revisions and delivery terms', 'Licensed software and assets', 'A backup plan for equipment failure'],
    revenue: ['Project packages', 'Day rates or retainers', 'Licensing and prints', 'Editing or post-production services'],
    risks: ['Equipment failure', 'Scope creep and revisions', 'Seasonal demand', 'Payment delays'],
    skills: ['Creative craft', 'Client direction', 'File management', 'Pricing and contracts'],
    improvements: ['Shoot or produce three portfolio pieces in one niche', 'Use a written brief and revision limit', 'Back up files in two locations before formatting cards', 'Price for preparation and editing time'],
  },
  {
    key: 'general',
    label: 'small business',
    keywords: [],
    categories: [],
    audience: 'a narrowly defined group of customers you can reach and serve repeatedly',
    problem: 'A specific customer group has a repeated problem that is costly, frustrating or time-consuming to solve.',
    requirements: ['Evidence that customers will pay', 'A clear offer and price', 'A repeatable delivery process', 'Basic compliance for your activity', 'A way to track enquiries and cash'],
    revenue: ['Direct sales of a product or service', 'Recurring plans or subscriptions', 'Add-on services', 'Bulk or B2B contracts'],
    risks: ['Demand may be lower than expected', 'Costs may be higher than estimated', 'Competitors may respond', 'Owner dependence and limited time'],
    skills: ['Customer research', 'Sales and communication', 'Basic costing', 'Consistent delivery'],
    improvements: ['Talk to 10 potential customers before spending', 'Run a small paid test with a fixed budget', 'Calculate unit economics honestly', 'Write down what evidence would make you stop'],
  },
];

export function inferDomain(text) {
  const haystack = String(text || '').toLowerCase();
  let best = domains[domains.length - 1];
  let bestScore = 0;
  for (const domain of domains) {
    let score = 0;
    for (const keyword of domain.keywords) {
      if (haystack.includes(keyword)) score += keyword.includes(' ') ? 2 : 1;
    }
    if (score > bestScore) {
      best = domain;
      bestScore = score;
    }
  }
  return best;
}
