
export const AIRLINES = {
  as: "Alaska Airlines",
  aa: "American Airlines",
  ba: "British Airways",
  cx: "Cathay Pacific",
  ay: "Finnair",
  ib: "Iberia",
  i2: "Iberia Express",
  jl: "Japan Airlines",
  nu: "Japan Transocean Air",
  jq: "Jetstar Airlines",
  "3k": "Jetstar Asia",
  gk: "Jetstar Japan",
  mh: "Malaysia Airlines",
  qf: "Qantas",
  qr: "Qatar Airways",
  at: "Royal Air Maroc",
  rj: "Royal Jordanian",
  ul: "Malaysian Airlines"
}

export const QANTAS_GRP_AIRLINES = new Set([
  'qf', 'jq', '3k', 'gk'
])

export const JETSTAR_AIRLINES = new Set([
  'jq', '3k', 'gk'
])

export const WEBSITE_EARN_CATEGORIES = {
  as: "GOQX	KLMNSV	BHY	-	CDIJ~	AF",
  aa: "NOQ 	GKLMSV	HY	PW 	CDIJR	AF ",
  ba: "GKLMNOQSV	-	BEHTWY	-	CDIRJ	AF",
  cx: "ML	BHK	YE	RW	CDIJP	AF",
  ay: "AZ	GLMNOQSV	BHKY	EPTW	CDIJR	-",
  ib: "AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-",
  i2: "AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-",
  jl: "GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF",
  nu: "GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF",
  mh: ["BHKLMVY	-	ACDFIJZ~	-	-	-", "KLMV	BH	IYZ	-	CDJ	AF"],
  qr: "KLMV	BH 	Y	-	CDIJP*R	AF",
  at: "NOQRSTW	HKLMV	BY	-	CDIJ	-",
  rj: "VSNQOPW	KML	BYH	IZ*	CDJ	-",
  ul: ["EGKLMNOQRSW	BHP	Y	-	CDIJ	-", "GLNOQRSV	EKMW	BHPY	-	CDIJ	-"],

  qf: ["EGLMNOQSV	-	BHKY	T	R	W	-	DI	CJ	-", "ENOQ	GKLMSV	BHY	T	R	W	I	D	CJ	AF"],
};

export const QANTAS_DOMESTIC_FARE_CLASSES = {
  RedeDeal: "discountEconomy",
  Flex: "flexibleEconomy",
  DiscountPremiumEconomy: "discountPremiumEconomy",
  PremiumEconomySaver: "premiumEconomy",
  PremiumEconomyFlex: "flexiblePremiumEconomy",
  BusinessSale: "business",
  BusinessSaver: "business",
  Business: "flexibleBusiness",
};

export const QANTAS_INTL_FARE_CLASSES = {
  EconomySale: "discountEconomy",
  EconomySaver: "economy",
  EconomyFlex: "flexibleEconomy",
  PremiumEconomySale: "discountPremiumEconomy",
  PremiumEconomySaver: "premiumEconomy",
  PremiumEconomyFlex: "flexiblePremiumEconomy",
  BusinessSale: "discountBusiness",
  BusinessSaver: "business",
  BusinessFlex: "flexibleBusiness",
  FirstSale: "first",
  FirstSaver: "first",
  FirstFlex: "first",
};

export const QANTAS_FARE_CLASS_DISPLAY = {
  RedeDeal: "Red e-Deal",
  Flex: "Flex",
  DiscountPremiumEconomy: "Discount Premium Economy",
  PremiumEconomySaver: "Premium Economy Saver",
  PremiumEconomyFlex: "Premium Economy Flex",
  BusinessSale: "Business Sale",
  BusinessSaver: "Business Saver",
  Business: "Business",
  EconomySale: "Economy Sale",
  EconomySaver: "Economy Saver",
  EconomyFlex: "Economy Flex",
  PremiumEconomySale: "Discount Premium Economy",
  BusinessFlex: "Business Flex",
  FirstSale: "First Sale",
  FirstSaver: "First Saver",
  FirstFlex: "First Flex",
};

export const JETSTAR_NEW_ZEALAND_FARE_CLASSES = {
  EconomyStarterFare: "discountEconomy",
  EconomyStarterFlexBiz: "discountEconomy",
  Flex: "economy",
  FlexPlus: "economy",
  StarterPlus: "economy",
  StarterMax: "flexibleEconomy",
};

export const JETSTAR_FARE_CLASSES = {
  Flex: "economy",
  FlexPlus: "economy",
  StarterMax: "flexibleEconomy",
  BusinessMax: "business",
};

export const JETSTAR_FARE_CLASS_DISPLAY = {
  EconomyStarterFare: "Economy Starter Fare",
  EconomyStarterFlexBiz: "Economy Starter FlexBiz Fare",
  Flex: "Flex",
  FlexPlus: "Flex Plus",
  StarterPlus: "Starter Plus",
  StarterMax: "Starter Max",
  BusinessMax: "Business Max",
};

export const EARN_CATEGORY_DISPLAY = {
  discountEconomy: "Discount Economy",
  economy: "Economy",
  flexibleEconomy: "Flexible Economy",
  discountPremiumEconomy: "Discount Premium Economy",
  premiumEconomy: "Premium Economy",
  flexiblePremiumEconomy: "Flexible Premium Economy",
  discountBusiness: "Discount Business",
  business: "Business",
  flexibleBusiness: "Flexible Business",
  first: "First",
};

export const REGION_DISPLAY = {
  southeastAsia: "Southeast Asia",
  northeastAsia: "Northeast Asia",
  southeastEurope: "Southeast Europe",
  northernEurope: "Northern Europe",
  westernEurope: "Western Europe",
  northernAfrica: "Northern Africa",
  usaEastCoast: "East Coast USA/Canada	",
  usaWestCoast: "West Coast USA/Canada",
  usaNycBos: "New York and Boston USA",
  middleEast: "Middle East",
  southeastAustralia: "Southeast Australia",
  hawaii: "Hawaii USA",
  europe: "Europe",
};
