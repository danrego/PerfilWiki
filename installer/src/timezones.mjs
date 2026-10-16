import I18n from '../../src/I18n.js';
/*
 * The complete catalog uses the browser's Intl timeZone enumeration. Its fallback
 * is the unabridged Intl.supportedValuesOf('timeZone') result from Node 24.19.0,
 * ICU 78.3, tzdata 2026b, generated on 2026-10-15. It is checked against the
 * running browser, since its timezone database can be older. It is not a list
 * of every historical IANA alias. Valid configured and browser aliases are
 * added separately without changing the user's chosen identifier.
 */
export const FALLBACK_TIME_ZONES = Object.freeze([
  "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers",
  "Africa/Asmera", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul",
  "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura",
  "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry",
  "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala",
  "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare",
  "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum",
  "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville",
  "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka",
  "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane",
  "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena",
  "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo",
  "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek",
  "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua",
  "America/Araguaina", "America/Argentina/La_Rioja", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta",
  "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia",
  "America/Aruba", "America/Asuncion", "America/Bahia", "America/Bahia_Banderas",
  "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon",
  "America/Boa_Vista", "America/Bogota", "America/Boise", "America/Buenos_Aires",
  "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun", "America/Caracas",
  "America/Catamarca", "America/Cayenne", "America/Cayman", "America/Chicago",
  "America/Chihuahua", "America/Ciudad_Juarez", "America/Coral_Harbour", "America/Cordoba",
  "America/Costa_Rica", "America/Coyhaique", "America/Creston", "America/Cuiaba",
  "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek",
  "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton",
  "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza",
  "America/Glace_Bay", "America/Godthab", "America/Goose_Bay", "America/Grand_Turk",
  "America/Grenada", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil",
  "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo",
  "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City",
  "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Indianapolis",
  "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Jujuy",
  "America/Juneau", "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz",
  "America/Lima", "America/Los_Angeles", "America/Louisville", "America/Lower_Princes",
  "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot",
  "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Mendoza",
  "America/Menominee", "America/Merida", "America/Metlakatla", "America/Mexico_City",
  "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo",
  "America/Montserrat", "America/Nassau", "America/New_York", "America/Nome",
  "America/Noronha", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem",
  "America/Ojinaga", "America/Panama", "America/Paramaribo", "America/Phoenix",
  "America/Port-au-Prince", "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico",
  "America/Punta_Arenas", "America/Rankin_Inlet", "America/Recife", "America/Regina",
  "America/Resolute", "America/Rio_Branco", "America/Santarem", "America/Santiago",
  "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka",
  "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia",
  "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa",
  "America/Thule", "America/Tijuana", "America/Toronto", "America/Tortola",
  "America/Vancouver", "America/Whitehorse", "America/Winnipeg", "America/Yakutat",
  "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie",
  "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera",
  "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok", "Arctic/Longyearbyen",
  "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr",
  "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Atyrau",
  "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok",
  "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei",
  "Asia/Calcutta", "Asia/Chita", "Asia/Colombo", "Asia/Damascus",
  "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe",
  "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Hong_Kong",
  "Asia/Hovd", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura",
  "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi",
  "Asia/Katmandu", "Asia/Khandyga", "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur",
  "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan",
  "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia",
  "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral",
  "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar",
  "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Rangoon", "Asia/Riyadh",
  "Asia/Saigon", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul",
  "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei",
  "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu",
  "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi",
  "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk",
  "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda",
  "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faeroe", "Atlantic/Madeira",
  "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena", "Atlantic/Stanley",
  "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Darwin",
  "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord_Howe",
  "Australia/Melbourne", "Australia/Perth", "Australia/Sydney", "Europe/Amsterdam",
  "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade",
  "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest",
  "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen",
  "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Helsinki",
  "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey", "Europe/Kaliningrad",
  "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon", "Europe/Ljubljana",
  "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta",
  "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco", "Europe/Moscow",
  "Europe/Oslo", "Europe/Paris", "Europe/Podgorica", "Europe/Prague",
  "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San_Marino",
  "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje",
  "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane",
  "Europe/Ulyanovsk", "Europe/Vaduz", "Europe/Vatican", "Europe/Vienna",
  "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb",
  "Europe/Zurich", "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas",
  "Indian/Cocos", "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe",
  "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion",
  "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham",
  "Pacific/Easter", "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo",
  "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier",
  "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Kiritimati",
  "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas",
  "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk",
  "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn",
  "Pacific/Ponape", "Pacific/Port_Moresby", "Pacific/Rarotonga", "Pacific/Saipan",
  "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu", "Pacific/Truk",
  "Pacific/Wake", "Pacific/Wallis"
]);

export const TIME_ZONE_REGIONS = Object.freeze({
  UTC: 'UTC',
  Africa: 'África',
  America: 'Américas',
  Antarctica: 'Antártida',
  Arctic: 'Ártico',
  Asia: 'Ásia',
  Atlantic: 'Atlântico',
  Australia: 'Austrália',
  Europe: 'Europa',
  Indian: 'Oceano Índico',
  Pacific: 'Pacífico',
  Other: 'Outros',
});

const CITY_NAMES = Object.freeze({
  'Africa/Sao_Tome': 'São Tomé',
  'America/Asuncion': 'Assunção',
  'America/Belem': 'Belém',
  'America/Bogota': 'Bogotá',
  'America/Cancun': 'Cancún',
  'America/Cordoba': 'Córdoba',
  'America/Cuiaba': 'Cuiabá',
  'America/Eirunepe': 'Eirunepé',
  'America/Havana': 'Havana',
  'America/Maceio': 'Maceió',
  'America/Mazatlan': 'Mazatlán',
  'America/Merida': 'Mérida',
  'America/Mexico_City': 'Cidade do México',
  'America/New_York': 'Nova York',
  'America/Santarem': 'Santarém',
  'America/Sao_Paulo': 'São Paulo',
  'Asia/Beirut': 'Beirute',
  'Asia/Jerusalem': 'Jerusalém',
  'Asia/Katmandu': 'Catmandu',
  'Asia/Kathmandu': 'Catmandu',
  'Asia/Nicosia': 'Nicósia',
  'Asia/Shanghai': 'Xangai',
  'Asia/Singapore': 'Singapura',
  'Asia/Tehran': 'Teerã',
  'Asia/Tokyo': 'Tóquio',
  'Atlantic/Azores': 'Açores',
  'Atlantic/Cape_Verde': 'Cabo Verde',
  'Atlantic/Reykjavik': 'Reiquiavique',
  'Europe/Athens': 'Atenas',
  'Europe/Berlin': 'Berlim',
  'Europe/Brussels': 'Bruxelas',
  'Europe/Bucharest': 'Bucareste',
  'Europe/Copenhagen': 'Copenhague',
  'Europe/Lisbon': 'Lisboa',
  'Europe/London': 'Londres',
  'Europe/Moscow': 'Moscou',
  'Europe/Prague': 'Praga',
  'Europe/Rome': 'Roma',
  'Europe/Stockholm': 'Estocolmo',
  'Europe/Vienna': 'Viena',
  'Europe/Warsaw': 'Varsóvia',
  'Europe/Zurich': 'Zurique',
});

// Preserve the familiar city shortcuts offered by earlier installer versions.
const SEARCH_ALIASES = Object.freeze({
  'America/Sao_Paulo': 'Brasília Brasilia',
  'America/New_York': 'Washington DC Nova Iorque',
});

/** Worldwide choices shown in the installer, without enumerating every IANA zone. */
export const COMMON_TIME_ZONES = Object.freeze([
  'UTC',
  'America/Sao_Paulo', 'America/Manaus', 'America/Campo_Grande',
  'America/Rio_Branco', 'America/Noronha',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Phoenix', 'America/Toronto', 'America/Mexico_City',
  'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires',
  'Europe/Lisbon', 'Europe/London', 'Europe/Paris', 'Europe/Madrid', 'Europe/Berlin',
  'Europe/Rome', 'Europe/Zurich', 'Europe/Stockholm', 'Europe/Athens', 'Europe/Istanbul', 'Europe/Moscow',
  'Atlantic/Azores',
  'Africa/Luanda', 'Africa/Maputo', 'Africa/Bissau', 'Africa/Sao_Tome', 'Atlantic/Cape_Verde',
  'Africa/Cairo', 'Africa/Casablanca', 'Africa/Nairobi', 'Africa/Johannesburg',
  'Asia/Tokyo', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Macau',
  'Asia/Singapore', 'Asia/Dili', 'Asia/Seoul', 'Asia/Bangkok', 'Asia/Dubai', 'Asia/Jakarta',
  'Australia/Sydney', 'Australia/Perth', 'Australia/Adelaide',
  'Pacific/Auckland', 'Pacific/Honolulu',
]);

const COMMON_CITY_NAMES = Object.freeze({
  'America/Sao_Paulo': 'Brasília / São Paulo',
  'America/Campo_Grande': 'Campo Grande',
  'America/Rio_Branco': 'Rio Branco',
  'America/Noronha': 'Fernando de Noronha',
  'America/New_York': 'Washington / Nova York',
  'America/Chicago': 'Chicago, EUA',
  'America/Denver': 'Denver, EUA',
  'America/Los_Angeles': 'Los Angeles, EUA',
  'America/Anchorage': 'Alasca / Anchorage, EUA',
  'America/Phoenix': 'Arizona / Phoenix, EUA',
  'America/Toronto': 'Toronto, Canadá',
  'America/Mexico_City': 'Cidade do México, México',
  'America/Bogota': 'Bogotá, Colômbia',
  'America/Lima': 'Lima, Peru',
  'America/Santiago': 'Santiago, Chile',
  'America/Argentina/Buenos_Aires': 'Buenos Aires, Argentina',
  'Europe/Lisbon': 'Lisboa, Portugal',
  'Europe/London': 'Londres, Reino Unido',
  'Europe/Paris': 'Paris, França',
  'Europe/Madrid': 'Madri, Espanha',
  'Europe/Berlin': 'Berlim, Alemanha',
  'Europe/Rome': 'Roma, Itália',
  'Europe/Zurich': 'Zurique, Suíça',
  'Europe/Stockholm': 'Estocolmo, Suécia',
  'Europe/Athens': 'Atenas, Grécia',
  'Europe/Istanbul': 'Istambul, Turquia',
  'Europe/Moscow': 'Moscou, Rússia',
  'Africa/Luanda': 'Luanda, Angola',
  'Africa/Maputo': 'Maputo, Moçambique',
  'Africa/Bissau': 'Bissau, Guiné-Bissau',
  'Africa/Sao_Tome': 'São Tomé, São Tomé e Príncipe',
  'Africa/Cairo': 'Cairo, Egito',
  'Africa/Casablanca': 'Casablanca, Marrocos',
  'Africa/Nairobi': 'Nairóbi, Quênia',
  'Africa/Johannesburg': 'Joanesburgo, África do Sul',
  'Asia/Tokyo': 'Tóquio, Japão',
  'Asia/Kolkata': 'Nova Délhi / Calcutá, Índia',
  'Asia/Shanghai': 'Pequim / Xangai, China',
  'Asia/Hong_Kong': 'Hong Kong, China',
  'Asia/Macau': 'Macau, China',
  'Asia/Singapore': 'Singapura',
  'Asia/Dili': 'Díli, Timor-Leste',
  'Asia/Seoul': 'Seul, Coreia do Sul',
  'Asia/Bangkok': 'Bangcoc, Tailândia',
  'Asia/Dubai': 'Dubai, Emirados Árabes Unidos',
  'Asia/Jakarta': 'Jacarta, Indonésia',
  'Australia/Sydney': 'Sydney, Austrália',
  'Australia/Perth': 'Perth, Austrália',
  'Australia/Adelaide': 'Adelaide, Austrália',
  'Pacific/Auckland': 'Auckland, Nova Zelândia',
  'Pacific/Honolulu': 'Havaí / Honolulu, EUA',
});

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

function sortTimeZoneOptions(options, language='pt-BR') {
  const localizedCollator=language==='pt-BR'?collator:new Intl.Collator(I18n.normalizeLanguage(language),{sensitivity:'base',numeric:true});
  return options.sort((a, b) => {
    if (a.region === 'UTC' || b.region === 'UTC') return a.region === b.region ? 0 : a.region === 'UTC' ? -1 : 1;
    return localizedCollator.compare(a.regionLabel, b.regionLabel) || localizedCollator.compare(a.city, b.city) || a.value.localeCompare(b.value);
  });
}

function validDate(date) {
  const result = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(result.getTime())) throw new TypeError('Data inválida para o fuso horário.');
  return result;
}

export function isSupportedTimeZone(timeZone, intl = Intl) {
  if (typeof timeZone !== 'string' || !timeZone || timeZone !== timeZone.trim()) return false;
  try {
    new intl.DateTimeFormat('en-US', { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

/** Offset at this instant, including seasonal clock changes and partial hours. */
export function timeZoneOffsetMinutes(timeZone, { date = new Date(), intl = Intl } = {}) {
  const instant = validDate(date);
  if (!isSupportedTimeZone(timeZone, intl)) throw new TypeError('Fuso horário não reconhecido.');
  try {
    const offset = new intl.DateTimeFormat('en-US', {
      timeZone, timeZoneName: 'longOffset',
    }).formatToParts(instant).find((part) => part.type === 'timeZoneName')?.value;
    if (offset === 'GMT' || offset === 'UTC') return 0;
    const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/u.exec(offset?.replace(/−/gu, '-'));
    if (match) return (match[1] === '-' ? -1 : 1) *
      (Number(match[2]) * 60 + Number(match[3] || 0) + Number(match[4] || 0) / 60);
  } catch {
    // Older Intl implementations can lack longOffset while supporting IANA zones.
  }
  const parts = new intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(instant);
  const value = Object.fromEntries(parts.filter((part) => part.type !== 'literal')
    .map((part) => [part.type, Number(part.value)]));
  const wallClock = Date.UTC(value.year, value.month - 1, value.day, value.hour % 24, value.minute, value.second);
  return (wallClock - Math.floor(instant.getTime() / 1000) * 1000) / 60000;
}

export function formatUtcOffset(minutes) {
  if (!Number.isFinite(minutes)) throw new TypeError('Deslocamento UTC inválido.');
  if (minutes === 0) return 'UTC+00:00';
  const seconds = Math.round(Math.abs(minutes) * 60);
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const remainder = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  const optionalSeconds = seconds % 60 ? ':' + String(seconds % 60).padStart(2, '0') : '';
  return 'UTC' + (minutes < 0 ? '-' : '+') + hours + ':' + remainder + optionalSeconds;
}

function optionFor(timeZone, date, intl) {
  const prefix = timeZone.split('/')[0];
  const region = timeZone === 'UTC' ? 'UTC' : Object.hasOwn(TIME_ZONE_REGIONS, prefix) ? prefix : 'Other';
  const city = timeZone === 'UTC' ? 'Tempo Universal Coordenado' :
    CITY_NAMES[timeZone] || timeZone.split('/').at(-1).replace(/_/gu, ' ');
  const offsetMinutes = timeZoneOffsetMinutes(timeZone, { date, intl });
  const offset = formatUtcOffset(offsetMinutes);
  return {
    value: timeZone,
    city,
    region,
    regionLabel: TIME_ZONE_REGIONS[region],
    offsetMinutes,
    offset,
    label: city + ' · ' + offset + ' · ' + timeZone,
  };
}

export function timeZoneLabel(timeZone, { date = new Date(), intl = Intl } = {}) {
  return optionFor(timeZone, validDate(date), intl).label;
}

/** All enumerated zones supported here, UTC, and valid chosen/browser aliases. */
export function listTimeZones({ selectedTimeZone, browserTimeZone, date = new Date(), intl = Intl } = {}) {
  const instant = validDate(date);
  let zones;
  try {
    zones = intl.supportedValuesOf('timeZone');
    if (!Array.isArray(zones) || !zones.length) zones = FALLBACK_TIME_ZONES;
  } catch {
    zones = FALLBACK_TIME_ZONES;
  }
  if (browserTimeZone === undefined) {
    try { browserTimeZone = new intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* No inferred zone. */ }
  }
  const identifiers = new Set(['UTC', ...zones, selectedTimeZone, browserTimeZone]);
  return sortTimeZoneOptions([...identifiers].filter((zone) => isSupportedTimeZone(zone, intl))
    .map((zone) => optionFor(zone, instant, intl)));
}

/** Usual choices plus the exact valid selected zone, or the detected browser zone. */
export function listCommonTimeZones({ selectedTimeZone, browserTimeZone, date = new Date(), intl = Intl, language='pt-BR' } = {}) {
  language=I18n.normalizeLanguage(language);
  const instant = validDate(date);
  if (!isSupportedTimeZone(selectedTimeZone, intl)) {
    if (browserTimeZone === undefined) {
      try { browserTimeZone = new intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* No inferred zone. */ }
    }
    selectedTimeZone = browserTimeZone;
  }
  const common = new Set(COMMON_TIME_ZONES);
  const identifiers = new Set([...COMMON_TIME_ZONES, selectedTimeZone]);
  return sortTimeZoneOptions([...identifiers].filter((zone) => isSupportedTimeZone(zone, intl))
    .map((zone) => {
      const option = optionFor(zone, instant, intl);
      if (common.has(zone)) {
        option.city = I18n.t(language,COMMON_CITY_NAMES[zone] || option.city);
        option.label = option.city + ' · ' + option.offset;
      }
      option.regionLabel=I18n.t(language,option.regionLabel);
      return option;
    }),language);
}

function searchText(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase('pt-BR')
    .replace(/[_/]/gu, ' ').replace(/gmt/gu, 'utc').trim();
}

/** Accent-insensitive search across city, region, exact IANA name and UTC offset. */
export function filterTimeZones(options, query = '') {
  const tokens = searchText(query).split(/\s+/u).filter(Boolean);
  if (!tokens.length) return options.slice();
  return options.filter((option) => {
    const searchable = searchText(option.label + ' ' + option.regionLabel + ' ' + option.value + ' ' + (SEARCH_ALIASES[option.value] || ''));
    return tokens.every((token) => searchable.includes(token));
  });
}

/** Native select optgroups. Filtering keeps the same geographic order. */
export function groupTimeZones(options, query = '') {
  const groups = new Map();
  for (const option of filterTimeZones(options, query)) {
    if (!groups.has(option.region)) groups.set(option.region, {
      id: option.region, label: option.regionLabel, options: [],
    });
    groups.get(option.region).options.push(option);
  }
  return [...groups.values()];
}
