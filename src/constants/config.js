export const GRADE_OPTIONS = [
  "",
  "部長級",
  "次長級",
  "所属長級",
  "課長級",
  "補佐級III(補佐兼班長)",
  "補佐級II(班長)",
  "補佐級I(主任)",
  "係長級(主査)"
];

export const STORAGE_KEY = 'jinjian_app_data_v28';

export const GRADE_LEVELS = {
  "部長級": 10,
  "次長級": 9,
  "所属長級": 8,
  "課長級": 7,
  "補佐級III(補佐兼班長)": 6,
  "補佐級II(班長)": 5,
  "補佐級I(主任)": 4,
  "係長級(主査)": 3,
  "一般": 1,
  "": 0
};

export const GRADE_TO_PROMO_KEY = {
  "部長級": "promoYearDeptHead",
  "次長級": "promoYearDeputyHead",
  "所属長級": "promoYearDivHead",
  "課長級": "promoYearSecHead",
  "補佐級III(補佐兼班長)": "promoYearAssistant3",
  "補佐級II(班長)": "promoYearAssistant2",
  "補佐級I(主任)": "promoYearAssistant1",
  "係長級(主査)": "promoYearChief"
};
