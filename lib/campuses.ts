export interface Campus {
  id: string
  name: string
  university: string
  lat: number
  lng: number
  address: string
  aliases?: string[]
}

export const CHICAGO_CAMPUSES: Campus[] = [
  // DePaul
  {
    id: 'depaul-loop',
    name: 'DePaul (Loop)',
    university: 'DePaul University',
    lat: 41.8858,
    lng: -87.6278,
    address: '1 E Jackson Blvd, Chicago'
  },
  {
    id: 'depaul-lincoln-park',
    name: 'DePaul (Lincoln Park)',
    university: 'DePaul University',
    lat: 41.9253,
    lng: -87.6541,
    address: '2400 N Sheffield Ave, Chicago'
  },
  // UIC
  {
    id: 'uic',
    name: 'UIC',
    university: 'University of Illinois Chicago',
    lat: 41.8708,
    lng: -87.6505,
    address: '601 S Morgan St, Chicago'
  },
  // Loyola
  {
    id: 'loyola',
    name: 'Loyola University',
    university: 'Loyola University Chicago',
    lat: 41.9994,
    lng: -87.6586,
    address: '1032 W Sheridan Rd, Chicago'
  },
  // Northwestern
  {
    id: 'northwestern',
    name: 'Northwestern (Chicago)',
    university: 'Northwestern University',
    lat: 41.8962,
    lng: -87.6189,
    address: '420 E Superior St, Chicago'
  },
  // Columbia College
  {
    id: 'columbia-college',
    name: 'Columbia College Chicago',
    university: 'Columbia College Chicago',
    lat: 41.8726,
    lng: -87.6243,
    address: '600 S Michigan Ave, Chicago'
  },
  // IIT
  {
    id: 'iit',
    name: 'Illinois Tech',
    university: 'Illinois Institute of Technology',
    lat: 41.8354,
    lng: -87.6277,
    address: '3300 S Federal St, Chicago'
  },
  // Roosevelt
  {
    id: 'roosevelt',
    name: 'Roosevelt University',
    university: 'Roosevelt University',
    lat: 41.8769,
    lng: -87.6253,
    address: '430 S Michigan Ave, Chicago'
  },
  // SAIC
  {
    id: 'saic',
    name: 'SAIC',
    university: 'School of the Art Institute of Chicago',
    lat: 41.8796,
    lng: -87.6237,
    address: '36 S Wabash Ave, Chicago'
  },
  // Northeastern Illinois
  {
    id: 'neiu',
    name: 'Northeastern Illinois',
    university: 'Northeastern Illinois University',
    lat: 41.9799,
    lng: -87.7184,
    address: '5500 N St Louis Ave, Chicago'
  },
  // Chicago State
  {
    id: 'chicago-state',
    name: 'Chicago State University',
    university: 'Chicago State University',
    lat: 41.7196,
    lng: -87.6076,
    address: '9501 S King Dr, Chicago'
  },
  // Harold Washington College
  {
    id: 'harold-washington',
    name: 'Harold Washington College',
    university: 'Harold Washington College',
    lat: 41.8861,
    lng: -87.6268,
    address: '30 E Lake St, Chicago'
  },
  // UIC West Campus
  {
    id: 'uic-west',
    name: 'UIC (West Campus)',
    university: 'University of Illinois Chicago',
    lat: 41.8719,
    lng: -87.6733,
    address: '2242 W Harrison St, Chicago'
  },
  // UChicago
  {
    id: 'uchicago',
    name: 'University of Chicago',
    university: 'University of Chicago',
    lat: 41.7886,
    lng: -87.5987,
    address: '5801 S Ellis Ave, Chicago',
    aliases: ['uchicago', 'u of c']
  },
  // City Colleges of Chicago
  {
    id: 'ccc-harold-washington',
    name: 'Harold Washington College',
    university: 'City Colleges of Chicago',
    lat: 41.8861,
    lng: -87.6268,
    address: '30 E Lake St, Chicago'
  },
  {
    id: 'ccc-daley',
    name: 'Richard J. Daley College',
    university: 'City Colleges of Chicago',
    lat: 41.7554,
    lng: -87.7237,
    address: '7500 S Pulaski Rd, Chicago'
  },
  {
    id: 'ccc-kennedy-king',
    name: 'Kennedy-King College',
    university: 'City Colleges of Chicago',
    lat: 41.7785,
    lng: -87.6441,
    address: '6301 S Halsted St, Chicago'
  },
  {
    id: 'ccc-malcolm-x',
    name: 'Malcolm X College',
    university: 'City Colleges of Chicago',
    lat: 41.8785,
    lng: -87.6742,
    address: '1900 W Van Buren St, Chicago'
  },
  {
    id: 'ccc-olive-harvey',
    name: 'Olive-Harvey College',
    university: 'City Colleges of Chicago',
    lat: 41.7093,
    lng: -87.5844,
    address: '10001 S Woodlawn Ave, Chicago'
  },
  {
    id: 'ccc-truman',
    name: 'Truman College',
    university: 'City Colleges of Chicago',
    lat: 41.9646,
    lng: -87.6595,
    address: '1145 W Wilson Ave, Chicago'
  },
  {
    id: 'ccc-wilbur-wright',
    name: 'Wilbur Wright College',
    university: 'City Colleges of Chicago',
    lat: 41.9596,
    lng: -87.7874,
    address: '4300 N Narragansett Ave, Chicago'
  },
  // Northwestern Evanston
  {
    id: 'northwestern-evanston',
    name: 'Northwestern (Evanston)',
    university: 'Northwestern University',
    lat: 42.0565,
    lng: -87.6753,
    address: '633 Clark St, Evanston'
  },
  // North Park University
  {
    id: 'north-park',
    name: 'North Park University',
    university: 'North Park University',
    lat: 41.9814,
    lng: -87.7107,
    address: '3225 W Foster Ave, Chicago'
  },
  // Concordia University Chicago
  {
    id: 'concordia',
    name: 'Concordia University Chicago',
    university: 'Concordia University Chicago',
    lat: 41.8343,
    lng: -87.9370,
    address: '7400 Augusta St, River Forest'
  },
  // Dominican University
  {
    id: 'dominican',
    name: 'Dominican University',
    university: 'Dominican University',
    lat: 41.8355,
    lng: -87.9318,
    address: '7900 W Division St, River Forest'
  },
  // Elmhurst University
  {
    id: 'elmhurst',
    name: 'Elmhurst University',
    university: 'Elmhurst University',
    lat: 41.8994,
    lng: -87.9431,
    address: '190 S Prospect Ave, Elmhurst'
  },
  // Wheaton College
  {
    id: 'wheaton',
    name: 'Wheaton College',
    university: 'Wheaton College',
    lat: 41.8661,
    lng: -88.1017,
    address: '501 College Ave, Wheaton'
  },
  // North Central College
  {
    id: 'north-central',
    name: 'North Central College',
    university: 'North Central College',
    lat: 41.7856,
    lng: -88.1482,
    address: '30 N Brainard St, Naperville'
  },
  // Benedictine University
  {
    id: 'benedictine',
    name: 'Benedictine University',
    university: 'Benedictine University',
    lat: 41.7810,
    lng: -88.1354,
    address: '5700 College Rd, Lisle'
  },
  // Aurora University
  {
    id: 'aurora',
    name: 'Aurora University',
    university: 'Aurora University',
    lat: 41.7606,
    lng: -88.3201,
    address: '347 S Gladstone Ave, Aurora'
  },
  // Governors State University
  {
    id: 'governors-state',
    name: 'Governors State University',
    university: 'Governors State University',
    lat: 41.4440,
    lng: -87.7354,
    address: '1 University Pkwy, University Park'
  },
  // Purdue Northwest Hammond
  {
    id: 'purdue-northwest-hammond',
    name: 'Purdue Northwest (Hammond)',
    university: 'Purdue University Northwest',
    lat: 41.5878,
    lng: -87.4953,
    address: '2200 169th St, Hammond IN'
  },
  // Purdue Northwest Westville
  {
    id: 'purdue-northwest-westville',
    name: 'Purdue Northwest (Westville)',
    university: 'Purdue University Northwest',
    lat: 41.5492,
    lng: -86.9083,
    address: '1401 S US-421, Westville IN'
  },
  // Valparaiso University
  {
    id: 'valparaiso',
    name: 'Valparaiso University',
    university: 'Valparaiso University',
    lat: 41.4964,
    lng: -87.0611,
    address: '1700 Chapel Dr, Valparaiso IN'
  },
  // Indiana University Northwest
  {
    id: 'iu-northwest',
    name: 'IU Northwest',
    university: 'Indiana University Northwest',
    lat: 41.5781,
    lng: -87.4725,
    address: '3400 Broadway, Gary IN'
  },
  // College of Lake County
  {
    id: 'college-lake-county',
    name: 'College of Lake County',
    university: 'College of Lake County',
    lat: 42.2799,
    lng: -87.9578,
    address: '19351 W Washington St, Grayslake'
  },
  // Lake Forest College
  {
    id: 'lake-forest',
    name: 'Lake Forest College',
    university: 'Lake Forest College',
    lat: 42.2225,
    lng: -87.8414,
    address: '555 N Sheridan Rd, Lake Forest'
  },
  // Rosalind Franklin University
  {
    id: 'rosalind-franklin',
    name: 'Rosalind Franklin University',
    university: 'Rosalind Franklin University',
    lat: 42.3018,
    lng: -87.8612,
    address: '3333 Green Bay Rd, North Chicago'
  },
  // Trinity International University
  {
    id: 'trinity-international',
    name: 'Trinity International University',
    university: 'Trinity International University',
    lat: 42.2736,
    lng: -87.8372,
    address: '2065 Half Day Rd, Deerfield'
  },
  // Judson University
  {
    id: 'judson',
    name: 'Judson University',
    university: 'Judson University',
    lat: 42.0450,
    lng: -88.3126,
    address: '1151 N State St, Elgin'
  },
  // Waubonsee Community College
  {
    id: 'waubonsee',
    name: 'Waubonsee Community College',
    university: 'Waubonsee Community College',
    lat: 41.7823,
    lng: -88.3307,
    address: 'Route 47 at Waubonsee Dr, Sugar Grove'
  },
  // College of DuPage
  {
    id: 'college-dupage',
    name: 'College of DuPage',
    university: 'College of DuPage',
    lat: 41.8523,
    lng: -88.0870,
    address: '425 Fawell Blvd, Glen Ellyn'
  },
  // Moraine Valley Community College
  {
    id: 'moraine-valley',
    name: 'Moraine Valley Community College',
    university: 'Moraine Valley Community College',
    lat: 41.7218,
    lng: -87.8469,
    address: '9000 W College Pkwy, Palos Hills'
  },
  // South Suburban College
  {
    id: 'south-suburban',
    name: 'South Suburban College',
    university: 'South Suburban College',
    lat: 41.5760,
    lng: -87.6087,
    address: '15800 S State St, South Holland'
  },
  // Prairie State College
  {
    id: 'prairie-state',
    name: 'Prairie State College',
    university: 'Prairie State College',
    lat: 41.4823,
    lng: -87.6354,
    address: '202 S Halsted St, Chicago Heights'
  },
  // Thornton Community College
  {
    id: 'thornton',
    name: 'Thornton Community College',
    university: 'South Suburban College',
    lat: 41.5651,
    lng: -87.6087,
    address: '15800 S State St, South Holland'
  },
  // Harper College
  {
    id: 'harper',
    name: 'Harper College',
    university: 'Harper College',
    lat: 42.0637,
    lng: -88.0417,
    address: '1200 W Algonquin Rd, Palatine'
  },
  // Elgin Community College
  {
    id: 'elgin-community',
    name: 'Elgin Community College',
    university: 'Elgin Community College',
    lat: 42.0354,
    lng: -88.3243,
    address: '1700 Spartan Dr, Elgin'
  },
  // Oakton Community College
  {
    id: 'oakton',
    name: 'Oakton Community College',
    university: 'Oakton Community College',
    lat: 42.0404,
    lng: -87.8823,
    address: '1600 E Golf Rd, Des Plaines'
  },
  // Triton College
  {
    id: 'triton',
    name: 'Triton College',
    university: 'Triton College',
    lat: 41.9029,
    lng: -87.8726,
    address: '2000 5th Ave, River Grove'
  },
  // Joliet Junior College
  {
    id: 'joliet-junior',
    name: 'Joliet Junior College',
    university: 'Joliet Junior College',
    lat: 41.5217,
    lng: -88.1007,
    address: '1215 Houbolt Rd, Joliet'
  },
  // Lewis University
  {
    id: 'lewis',
    name: 'Lewis University',
    university: 'Lewis University',
    lat: 41.5354,
    lng: -88.0785,
    address: '1 University Pkwy, Romeoville'
  },
  // University of St. Francis
  {
    id: 'st-francis',
    name: 'University of St. Francis',
    university: 'University of St. Francis',
    lat: 41.5251,
    lng: -88.0826,
    address: '500 Wilcox St, Joliet'
  },
  // Northern Illinois University
  {
    id: 'northern-illinois',
    name: 'Northern Illinois University',
    university: 'Northern Illinois University',
    lat: 41.9345,
    lng: -88.7732,
    address: '1425 W Lincoln Hwy, DeKalb'
  },
  // Rush University
  {
    id: 'rush',
    name: 'Rush University',
    university: 'Rush University',
    lat: 41.8742,
    lng: -87.6719,
    address: '600 S Paulina St, Chicago'
  },
  // Loyola Stritch School of Medicine
  {
    id: 'loyola-maywood',
    name: 'Loyola (Maywood)',
    university: 'Loyola University Chicago',
    lat: 41.8738,
    lng: -87.8441,
    address: '2160 S 1st Ave, Maywood'
  },
  // Midwestern University
  {
    id: 'midwestern',
    name: 'Midwestern University',
    university: 'Midwestern University',
    lat: 41.8556,
    lng: -88.0104,
    address: '555 31st St, Downers Grove'
  },
  // American Islamic College
  {
    id: 'american-islamic',
    name: 'American Islamic College',
    university: 'American Islamic College',
    lat: 41.9612,
    lng: -87.6867,
    address: '640 W Irving Park Rd, Chicago'
  },
  // Moody Bible Institute
  {
    id: 'moody',
    name: 'Moody Bible Institute',
    university: 'Moody Bible Institute',
    lat: 41.8967,
    lng: -87.6350,
    address: '820 N LaSalle Blvd, Chicago'
  },
]