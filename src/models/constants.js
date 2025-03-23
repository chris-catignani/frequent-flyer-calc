export const QANTAS_GRP_AIRLINES = {
  qf: 'Qantas',
  jq: 'Jetstar Airlines',
  '3k': 'Jetstar Asia',
  gk: 'Jetstar Japan',
};

export const PARTNER_ONEWORLD_AIRLINES = {
  as: 'Alaska Airlines',
  aa: 'American Airlines',
  ba: 'British Airways',
  cx: 'Cathay Pacific',
  fj: 'Fiji Airways',
  ay: 'Finnair',
  ib: 'Iberia',
  i2: 'Iberia Express',
  jl: 'Japan Airlines',
  nu: 'Japan Transocean Air',
  mh: 'Malaysia Airlines',
  qr: 'Qatar Airways',
  at: 'Royal Air Maroc',
  rj: 'Royal Jordanian',
  ul: 'SriLankan Airlines',
};

export const PARTNER_NON_ONEWORLD_AIRLINES = {
  af: 'Air France',
  mu: 'China Eastern',
  ly: 'EL AL',
  ek: 'Emirates',
  kl: 'KLM',
  la: 'LATAM',
  jj: 'LATAM Brasil',
  '4c': 'LATAM Colombia',
  xl: 'LATAM Ecuador',
  lu: 'LATAM Express',
  lp: 'LATAM Peru',
  ws: 'WestJet',
};

export const AIRLINES = {
  ...QANTAS_GRP_AIRLINES,
  ...PARTNER_ONEWORLD_AIRLINES,
  ...PARTNER_NON_ONEWORLD_AIRLINES,
};

export const JETSTAR_AIRLINES = new Set(['jq', '3k', 'gk']);

export const JAL_AIRLINES = new Set(['jl', 'nu']);

export const WEBSITE_EARN_CATEGORIES = {
  as: 'GOQX	KLMNSV	BHY	-	CDIJ~	AF',
  aa: 'NOQ 	GKLMSV	HY	PW 	CDIJR	AF ',
  ba: 'GKLMNOQSV	-	BEHTWY	-	CDIRJ	AF',
  cx: 'ML	BHK	YE	RW	CDIJP	AF',
  fj: ['-	-	HLQY	-	-	-', 'GNTV	KLMOQSW	BHY	-	CDIJZ	-'],
  ay: 'AZ	GLMNOQSV	BHKY	EPTW	CDIJR	-',
  ib: 'AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-',
  jl: 'GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF',
  mh: ['BHKLMVY	-	ACDFIJZ~	-	-	-', 'KLMV	BH	IYZ	-	CDJ	AF'],
  qr: 'KLMV	BH 	Y	-	CDIJP*R	AF',
  at: 'NOQRSTW	HKLMV	BY	-	CDIJ	-',
  rj: 'VSNQOPW	KML	BYH	IZ*	CDJ	-',
  ul: ['EGKLMNOQRSW	BHP	Y	-	CDIJ	-', 'GLNOQRSV	EKMW	BHPY	-	CDIJ	-'],

  qf: ['EGLMNOQSV	-	BHKY	T	R	W	-	DI	CJ	-', 'ENOQ	GKLMSV	BHY	T	R	W	I	D	CJ	AF'],

  af: [
    'EGLNRTVX*	FHKQPU	ABDJMSWY	-	-	-',
    'EGLNRTVX*	AFHKQPSUW	BMY	-	CDIJO*Z	-',
    'EGLNRTVX*	HKQU	BMY	ASW	CDIJO*Z	FP',
  ],
  mu: ['TVZH	EKLNRS	BMPW*Y	-	CDIJQ	FU^', 'TVZ	EKLNRS	BMPW*Y	-	CDIJQ	FU^'],
  ly: '-	GHKLMNOSUV	Y	BPQW	CDIJZ 	AF ',
  ek: 'LQTV	BKMRUX	EP^WY	-	CH#IJO	AF',
  kl: ['EGLNRTVX*	FHKQPU	ABDJMSWY	-	-	-', 'EGLNRTVX*	AFHKQPSUW	BMY	-	CDIJO*Z	-', 'EGLNRTVX*	HKQU	BMY	-	CDIJO*Z	-'],
  la: 'AGNOQ	LMSVX	BHKY	PW	CDIJZ	-',
  ws: 'KTX	SNQ	HMBY	ROW	-	-',
};

export const EARN_CATEGORY_URLS = {
  as: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#alaska-airlines',
  aa: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#american-airlines',
  ba: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#british-airways',
  cx: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#cathay-pacific',
  fj: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#fiji-airways',
  ay: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#finnair',
  ib: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#iberia',
  i2: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#iberia',
  jl: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#japan-airlines',
  nu: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#japan-airlines',
  mh: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#malaysia-airlines',
  qr: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#qatar-airways',
  at: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#royal-air-maroc',
  rj: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#royal-jordanian',
  ul: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#srilankan-airlines',

  qf: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#qantas',
  jq: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#jetstar',
  '3k': 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#jetstar',
  gk: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#jetstar',

  af: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#air-france',
  mu: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#china-eastern',
  ly: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#el-al',
  ek: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#emirates',
  kl: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#klm',
  la: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam',
  jj: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam',
  lu: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam',
  lp: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam',
  xl: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam',
  '4c': 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam',
  ws: 'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#westjet',
};

export const QANTAS_DOMESTIC_FARE_CLASSES = {
  RedeDeal: 'discountEconomy',
  Flex: 'flexibleEconomy',
  DiscountPremiumEconomy: 'discountPremiumEconomy',
  PremiumEconomySaver: 'premiumEconomy',
  PremiumEconomyFlex: 'flexiblePremiumEconomy',
  BusinessSale: 'business',
  BusinessSaver: 'business',
  Business: 'flexibleBusiness',
};

export const QANTAS_INTL_FARE_CLASSES = {
  EconomySale: 'discountEconomy',
  EconomySaver: 'economy',
  EconomyFlex: 'flexibleEconomy',
  PremiumEconomySale: 'discountPremiumEconomy',
  PremiumEconomySaver: 'premiumEconomy',
  PremiumEconomyFlex: 'flexiblePremiumEconomy',
  BusinessSale: 'discountBusiness',
  BusinessSaver: 'business',
  BusinessFlex: 'flexibleBusiness',
  FirstSale: 'first',
  FirstSaver: 'first',
  FirstFlex: 'first',
};

export const QANTAS_FARE_CLASS_DISPLAY = {
  RedeDeal: 'Red e-Deal',
  Flex: 'Flex',
  DiscountPremiumEconomy: 'Discount Premium Economy',
  PremiumEconomySaver: 'Premium Economy Saver',
  PremiumEconomyFlex: 'Premium Economy Flex',
  BusinessSale: 'Business Sale',
  BusinessSaver: 'Business Saver',
  Business: 'Business',
  EconomySale: 'Economy Sale',
  EconomySaver: 'Economy Saver',
  EconomyFlex: 'Economy Flex',
  PremiumEconomySale: 'Discount Premium Economy',
  BusinessFlex: 'Business Flex',
  FirstSale: 'First Sale',
  FirstSaver: 'First Saver',
  FirstFlex: 'First Flex',
};

export const JETSTAR_NEW_ZEALAND_FARE_CLASSES = {
  EconomyStarterFare: 'discountEconomy',
  EconomyStarterFlexBiz: 'discountEconomy',
  Flex: 'economy',
  FlexPlus: 'economy',
  StarterPlus: 'economy',
  StarterMax: 'flexibleEconomy',
};

export const JETSTAR_FARE_CLASSES = {
  Flex: 'economy',
  FlexPlus: 'economy',
  StarterMax: 'flexibleEconomy',
  BusinessMax: 'business',
};

export const JETSTAR_FARE_CLASS_DISPLAY = {
  EconomyStarterFare: 'Economy Starter Fare',
  EconomyStarterFlexBiz: 'Economy Starter FlexBiz Fare',
  Flex: 'Flex',
  FlexPlus: 'Flex Plus',
  StarterPlus: 'Starter Plus',
  StarterMax: 'Starter Max',
  BusinessMax: 'Business Max',
};

export const JAL_DOMESTIC_FARE_CLASSES = {
  DiscountEconomy: 'economy',
  DiscountEconomyplusPremiumSurcharge: 'economy',
  Economy: 'flexibleEconomy',
  DiscountEconomyplusFirstSurcharge: 'flexibleEconomy',
  EconomyplusPremiumSurcharge: 'premiumEconomy',
  EconomyplusFirstSurcharge: 'first',
};

export const JAL_DOMESTIC_FARE_CLASS_DISPLAY = {
  DiscountEconomy: 'Discount Economy',
  DiscountEconomyplusPremiumSurcharge: 'Discount Economy plus Premium Surcharge',
  Economy: 'Economy',
  DiscountEconomyplusFirstSurcharge: 'Discount Economy plus First Surcharge',
  EconomyplusPremiumSurcharge: 'Economy plus Premium Surcharge',
  EconomyplusFirstSurcharge: 'Economy plus First Surcharge',
};

export const EARN_CATEGORY_DISPLAY = {
  discountEconomy: 'Discount Economy',
  economy: 'Economy',
  flexibleEconomy: 'Flexible Economy',
  discountPremiumEconomy: 'Discount Premium Economy',
  premiumEconomy: 'Premium Economy',
  flexiblePremiumEconomy: 'Flexible Premium Economy',
  discountBusiness: 'Discount Business',
  business: 'Business',
  flexibleBusiness: 'Flexible Business',
  first: 'First',
};

export const REGION_DISPLAY = {
  southeastAsia: 'Southeast Asia',
  northeastAsia: 'Northeast Asia',
  southeastEurope: 'Southeast Europe',
  northernEurope: 'Northern Europe',
  westernEurope: 'Western Europe',
  northernAfrica: 'Northern Africa',
  usaEastCoast: 'East Coast USA/Canada',
  usaWestCoast: 'West Coast USA/Canada',
  usaNycBos: 'New York and Boston USA',
  middleEast: 'Middle East',
  southeastAustralia: 'Southeast Australia',
  hawaii: 'Hawaii USA',
  europe: 'Europe',
};
