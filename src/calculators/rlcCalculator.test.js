// ignore react,
import { calculateRLC } from './rlcCalculator';

import { createConductor } from '../components/conductorHelpers';

const conductorTestAgainst = [
  { condName: "Turkey", R_0_20:0.642, R_60_25: 0.655, R_60_50: 0.750, R_60_75: 0.816, C_60: 0.751, L_60_25: 0.120, L_60_50: 0.139, L_60_75: 0.144, ampacity: 105 },
  { condName: "Swan", R_0_20:0.403, R_60_25: 0.412, R_60_50: 0.479, R_60_75: 0.522, C_60: 0.715, L_60_25: 0.115, L_60_50: 0.131, L_60_75: 0.137, ampacity: 140 },
  { condName: "Swanate", R_0_20:0.399, R_60_25: 0.407, R_60_50: 0.463, R_60_75: 0.516, C_60: 0.710, L_60_25: 0.113, L_60_50: 0.124, L_60_75: 0.130, ampacity: 140 },
  { condName: "Sparrow", R_0_20:0.253, R_60_25: 0.259, R_60_50: 0.308, R_60_75: 0.336, C_60: 0.678, L_60_25: 0.110, L_60_50: 0.123, L_60_75: 0.128, ampacity: 185 },
  { condName: "Sparate", R_0_20:0.251, R_60_25: 0.256, R_60_50: 0.297, R_60_75: 0.330, C_60: 0.674, L_60_25: 0.109, L_60_50: 0.118, L_60_75: 0.121, ampacity: 185 },
  { condName: "Robin", R_0_20:0.201, R_60_25: 0.206, R_60_50: 0.247, R_60_75: 0.270, C_60: 0.660, L_60_25: 0.107, L_60_50: 0.119, L_60_75: 0.122, ampacity: 210 },
  { condName: "Raven", R_0_20:0.159, R_60_25: 0.163, R_60_50: 0.197, R_60_75: 0.216, C_60: 0.642, L_60_25: 0.104, L_60_50: 0.114, L_60_75: 0.116, ampacity: 240 },
  { condName: "Quail", R_0_20:0.126, R_60_25: 0.130, R_60_50: 0.162, R_60_75: 0.176, C_60: 0.624, L_60_25: 0.102, L_60_50: 0.112, L_60_75: 0.113, ampacity: 275 },
  { condName: "Pigeon", R_0_20:0.100, R_60_25: 0.103, R_60_50: 0.121, R_60_75: 0.145, C_60: 0.606, L_60_25: 0.0992, L_60_50: 0.108, L_60_75: 0.109, ampacity: 315 },
  { condName: "Penguin", R_0_20:0.0795, R_60_25: 0.0822, R_60_50: 0.107, R_60_75: 0.116, C_60: 0.597, L_60_25: 0.0964, L_60_50: 0.105, L_60_75: 0.105, ampacity: 365 },
  { condName: "Waxwing", R_0_20:0.0644, R_60_25: 0.0657, R_60_50: 0.0723, R_60_75: 0.0788, C_60: 0.576, L_60_25: 0.0903, L_60_50: 0.0903, L_60_75: 0.0903, ampacity: 445 },
  { condName: "Partridge", R_0_20:0.0637, R_60_25: 0.0652, R_60_50: 0.0714, R_60_75: 0.0778, C_60: 0.565, L_60_25: 0.0881, L_60_50: 0.0881, L_60_75: 0.0881, ampacity: 455 },
  { condName: "Merlin", R_0_20:0.0510, R_60_25: 0.0523, R_60_50: 0.0574, R_60_75: 0.0625, C_60: 0.560, L_60_25: 0.0826, L_60_50: 0.0826, L_60_75: 0.0826, ampacity: 515 },
  { condName: "Linnet", R_0_20:0.0506, R_60_25: 0.0517, R_60_50: 0.0568, R_60_75: 0.0619, C_60: 0.549, L_60_25: 0.0854, L_60_50: 0.0854, L_60_75: 0.0854, ampacity: 530 },
  { condName: "Oriole", R_0_20:0.0502, R_60_25: 0.0513, R_60_50: 0.0563, R_60_75: 0.0614, C_60: 0.544, L_60_25: 0.0843, L_60_50: 0.0843, L_60_75: 0.0843, ampacity: 530 },
  { condName: "Chickadee", R_0_20:0.0432, R_60_25: 0.0443, R_60_50: 0.0487, R_60_75: 0.0528, C_60: 0.544, L_60_25: 0.0856, L_60_50: 0.0856, L_60_75: 0.0856, ampacity: 575 },
  { condName: "Ibis", R_0_20:0.0428, R_60_25: 0.0438, R_60_50: 0.0481, R_60_75: 0.0525, C_60: 0.539, L_60_25: 0.0835, L_60_50: 0.0835, L_60_75: 0.0835, ampacity: 590 },
  { condName: "Pelican", R_0_20:0.0360, R_60_25: 0.0369, R_60_50: 0.0405, R_60_75: 0.0441, C_60: 0.528, L_60_25: 0.0835, L_60_50: 0.0835, L_60_75: 0.0835, ampacity: 640 },
  { condName: "Flicker", R_0_20:0.0358, R_60_25: 0.0367, R_60_50: 0.0403, R_60_75: 0.0439, C_60: 0.524, L_60_25: 0.0818, L_60_50: 0.0818, L_60_75: 0.0818, ampacity: 670 },
  { condName: "Hawk", R_0_20:0.0357, R_60_25: 0.0366, R_60_50: 0.0402, R_60_75: 0.0438, C_60: 0.522, L_60_25: 0.0814, L_60_50: 0.0814, L_60_75: 0.0814, ampacity: 660 },
  { condName: "Hen", R_0_20:0.0354, R_60_25: 0.0362, R_60_50: 0.0398, R_60_75: 0.0434, C_60: 0.517, L_60_25: 0.0803, L_60_50: 0.0803, L_60_75: 0.0803, ampacity: 660 },
  { condName: "Osprey", R_0_20:0.0309, R_60_25: 0.0318, R_60_50: 0.0348, R_60_75: 0.0379, C_60: 0.518, L_60_25: 0.0818, L_60_50: 0.0818, L_60_75: 0.0818, ampacity: 710 },
  { condName: "Parakeet", R_0_20:0.0307, R_60_25: 0.0314, R_60_50: 0.0347, R_60_75: 0.0377, C_60: 0.512, L_60_25: 0.0801, L_60_50: 0.0801, L_60_75: 0.0801, ampacity: 720 },
  { condName: "Dove", R_0_20:0.0305, R_60_25: 0.0314, R_60_50: 0.0345, R_60_75: 0.0375, C_60: 0.510, L_60_25: 0.0795, L_60_50: 0.0795, L_60_75: 0.0795, ampacity: 730 },
  { condName: "Rook", R_0_20:0.0268, R_60_25: 0.0277, R_60_50: 0.0303, R_60_75: 0.0330, C_60: 0.502, L_60_25: 0.0786, L_60_50: 0.0786, L_60_75: 0.0786, ampacity: 780 },
  { condName: "Grosbeak", R_0_20:0.0267, R_60_25: 0.0275, R_60_50: 0.0301, R_60_75: 0.0328, C_60: 0.499, L_60_25: 0.0780, L_60_50: 0.0780, L_60_75: 0.0780, ampacity: 790 },
  { condName: "Drake", R_0_20:0.0214, R_60_25: 0.0222, R_60_50: 0.0242, R_60_75: 0.0263, C_60: 0.482, L_60_25: 0.0756, L_60_50: 0.0756, L_60_75: 0.0756, ampacity: 910 },
  { condName: "Tern", R_0_20:0.0216, R_60_25: 0.0225, R_60_50: 0.0246, R_60_75: 0.0267, C_60: 0.488, L_60_25: 0.0769, L_60_50: 0.0769, L_60_75: 0.0769, ampacity: 890 },
  { condName: "Rail", R_0_20:0.0180, R_60_25: 0.0188, R_60_50: 0.0206, R_60_75: 0.0223, C_60: 0.474, L_60_25: 0.0748, L_60_50: 0.0748, L_60_75: 0.0748, ampacity: 970 },
  { condName: "Cardinal", R_0_20:0.0179, R_60_25: 0.0186, R_60_50: 0.0205, R_60_75: 0.0222, C_60: 0.470, L_60_25: 0.0737, L_60_50: 0.0737, L_60_75: 0.0737, ampacity: 990 },
  { condName: "Curlew", R_0_20:0.0165, R_60_25: 0.0172, R_60_50: 0.0189, R_60_75: 0.0205, C_60: 0.464, L_60_25: 0.0729, L_60_50: 0.0729, L_60_75: 0.0729, ampacity: 1040 },
  { condName: "Bluejay", R_0_20:0.0155, R_60_25: 0.0163, R_60_50: 0.0178, R_60_75: 0.0193, C_60: 0.461, L_60_25: 0.0731, L_60_50: 0.0731, L_60_75: 0.0731, ampacity: 1070 },
  { condName: "Bittern", R_0_20:0.0135, R_60_25: 0.0144, R_60_50: 0.0157, R_60_75: 0.0170, C_60: 0.451, L_60_25: 0.0716, L_60_50: 0.0716, L_60_75: 0.0716, ampacity: 1160 },
  { condName: "Lapwing", R_0_20:0.0108, R_60_25: 0.0117, R_60_50: 0.0128, R_60_75: 0.0138, C_60: 0.434, L_60_25: 0.0689, L_60_50: 0.0689, L_60_75: 0.0689, ampacity: 1340 },
  { condName: "Falcon", R_0_20:0.0108, R_60_25: 0.0116, R_60_50: 0.0129, R_60_75: 0.0140, C_60: 0.430, L_60_25: 0.0678, L_60_50: 0.0678, L_60_75: 0.0678, ampacity: 1360 },
  { condName: "Bluebird", R_0_20:0.00801, R_60_25: 0.00903, R_60_50: 0.00977, R_60_75: 0.0105, C_60: 0.409, L_60_25: 0.0652, L_60_50: 0.0652, L_60_75: 0.0652, ampacity: 1610 },
];

const conductorData = [
  {
    "name": "6-6/1 ACSR",
    "name_alt": "Turkey",
    "strand_count": "6",
    "strand_dia": "1.6789",
    "outer_dia": "5.0292",
    "core_strand_count": "1",
    "core_strand_dia": "1.6789"
  },
  {
    "name": "4-6/1 ACSR",
    "name_alt": "Swan",
    "strand_count": "6",
    "strand_dia": "2.1184",
    "outer_dia": "6.3500",
    "core_strand_count": "1",
    "core_strand_dia": "2.1184"
  },
  {
    "name": "4-7/1 ACSR",
    "name_alt": "Swanate",
    "strand_count": "6",
    "strand_dia": "1.9609",
    "outer_dia": "6.5278",
    "core_strand_count": "1",
    "core_strand_dia": "2.6162"
  },
  {
    "name": "2-6/1 ACSR",
    "name_alt": "Sparrow",
    "strand_count": "6",
    "strand_dia": "2.6721",
    "outer_dia": "8.0264",
    "core_strand_count": "1",
    "core_strand_dia": "2.6721"
  },
  {
    "name": "2-7/1 ACSR",
    "name_alt": "Sparate",
    "strand_count": "6",
    "strand_dia": "2.4740",
    "outer_dia": "8.2550",
    "core_strand_count": "1",
    "core_strand_dia": "3.2969"
  },
  {
    "name": "1-6/1 ACSR",
    "name_alt": "Robin",
    "strand_count": "6",
    "strand_dia": "2.9997",
    "outer_dia": "8.9916",
    "core_strand_count": "1",
    "core_strand_dia": "2.9997"
  },
  {
    "name": "1/0-6/1 ACSR",
    "name_alt": "Raven",
    "strand_count": "6",
    "strand_dia": "3.3706",
    "outer_dia": "10.1092",
    "core_strand_count": "1",
    "core_strand_dia": "3.3706"
  },
  {
    "name": "2/0-6/1 ACSR",
    "name_alt": "Quail",
    "strand_count": "6",
    "strand_dia": "3.7821",
    "outer_dia": "11.3538",
    "core_strand_count": "1",
    "core_strand_dia": "3.7821"
  },
  {
    "name": "3/0-6/1 ACSR",
    "name_alt": "Pigeon",
    "strand_count": "6",
    "strand_dia": "4.2469",
    "outer_dia": "12.7508",
    "core_strand_count": "1",
    "core_strand_dia": "4.2469"
  },
  {
    "name": "4/0-6/1 ACSR",
    "name_alt": "Penguin",
    "strand_count": "6",
    "strand_dia": "4.7701",
    "outer_dia": "14.3002",
    "core_strand_count": "1",
    "core_strand_dia": "4.7701"
  },
  {
    "name": "266.8-18/1 ACSR",
    "name_alt": "Waxwing",
    "strand_count": "18",
    "strand_dia": "3.0912",
    "outer_dia": "15.4686",
    "core_strand_count": "1",
    "core_strand_dia": "3.0912"
  },
  {
    "name": "266.8-26/7 ACSR",
    "name_alt": "Partridge",
    "strand_count": "26",
    "strand_dia": "2.5730",
    "outer_dia": "16.3068",
    "core_strand_count": "7",
    "core_strand_dia": "2.0015"
  },
  // {
  //   "name": "300-26/7 ACSR",
  //   "name_alt": "Ostrich",
  //   "strand_count": "26",
  //   "strand_dia": "2.7280",
  //   "outer_dia": "17.2720",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.1209"
  // },
  {
    "name": "336.4-18/1 ACSR",
    "name_alt": "Merlin",
    "strand_count": "18",
    "strand_dia": "3.4722",
    "outer_dia": "17.3736",
    "core_strand_count": "1",
    "core_strand_dia": "3.4722"
  },
  {
    "name": "336.4-26/7 ACSR",
    "name_alt": "Linnet",
    "strand_count": "26",
    "strand_dia": "2.8880",
    "outer_dia": "18.2880",
    "core_strand_count": "7",
    "core_strand_dia": "2.2479"
  },
  {
    "name": "336.4-30/7 ACSR",
    "name_alt": "Oriole",
    "strand_count": "30",
    "strand_dia": "2.6899",
    "outer_dia": "18.8214",
    "core_strand_count": "7",
    "core_strand_dia": "2.6899"
  },
  {
    "name": "397.5-18/1 ACSR",
    "name_alt": "Chickadee",
    "strand_count": "18",
    "strand_dia": "3.7744",
    "outer_dia": "18.8722",
    "core_strand_count": "1",
    "core_strand_dia": "3.7744"
  },
  // {
  //   "name": "397.5-24/7 ACSR",
  //   "name_alt": "Brant",
  //   "strand_count": "24",
  //   "strand_dia": "3.2690",
  //   "outer_dia": "19.6088",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.1793"
  // },
  {
    "name": "397.5-26/7 ACSR",
    "name_alt": "Ibis",
    "strand_count": "26",
    "strand_dia": "3.1394",
    "outer_dia": "19.8882",
    "core_strand_count": "7",
    "core_strand_dia": "2.4435"
  },
  // {
  //   "name": "397.5-30/7 ACSR",
  //   "name_alt": "Lark",
  //   "strand_count": "30",
  //   "strand_dia": "2.9235",
  //   "outer_dia": "20.4724",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.9235"
  // },
  {
    "name": "477-18/1 ACSR",
    "name_alt": "Pelican",
    "strand_count": "18",
    "strand_dia": "4.1351",
    "outer_dia": "20.6756",
    "core_strand_count": "1",
    "core_strand_dia": "4.1351"
  },
  {
    "name": "477-24/7 ACSR",
    "name_alt": "Flicker",
    "strand_count": "24",
    "strand_dia": "3.5814",
    "outer_dia": "21.4884",
    "core_strand_count": "7",
    "core_strand_dia": "2.3876"
  },
  {
    "name": "477-26/7 ACSR",
    "name_alt": "Hawk",
    "strand_count": "26",
    "strand_dia": "3.4392",
    "outer_dia": "21.7932",
    "core_strand_count": "7",
    "core_strand_dia": "2.6746"
  },
  {
    "name": "477-30/7 ACSR",
    "name_alt": "Hen",
    "strand_count": "30",
    "strand_dia": "3.2029",
    "outer_dia": "22.4282",
    "core_strand_count": "7",
    "core_strand_dia": "3.2029"
  },
  {
    "name": "556.5-18/1 ACSR",
    "name_alt": "Osprey",
    "strand_count": "18",
    "strand_dia": "4.4653",
    "outer_dia": "22.3266",
    "core_strand_count": "1",
    "core_strand_dia": "4.4653"
  },
  {
    "name": "556.5-24/7 ACSR",
    "name_alt": "Parakeet",
    "strand_count": "24",
    "strand_dia": "3.8684",
    "outer_dia": "23.2156",
    "core_strand_count": "7",
    "core_strand_dia": "2.5781"
  },
  {
    "name": "556.5-26/7 ACSR",
    "name_alt": "Dove",
    "strand_count": "26",
    "strand_dia": "3.7160",
    "outer_dia": "23.5458",
    "core_strand_count": "7",
    "core_strand_dia": "2.8905"
  },
  // {
  //   "name": "556.5-30/7 ACSR",
  //   "name_alt": "Eagle",
  //   "strand_count": "30",
  //   "strand_dia": "3.4595",
  //   "outer_dia": "24.2062",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.4595"
  // },
  // {
  //   "name": "605-24/7 ACSR",
  //   "name_alt": "Peacock",
  //   "strand_count": "24",
  //   "strand_dia": "4.0335",
  //   "outer_dia": "24.2062",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.6899"
  // },
  // {
  //   "name": "605-26/7 ACSR",
  //   "name_alt": "Squab",
  //   "strand_count": "26",
  //   "strand_dia": "3.8735",
  //   "outer_dia": "24.5364",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.0124"
  // },
  // {
  //   "name": "605-30/7 ACSR",
  //   "name_alt": "Wood Duck",
  //   "strand_count": "30",
  //   "strand_dia": "3.6068",
  //   "outer_dia": "25.2476",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.6068"
  // },
  // {
  //   "name": "605-30/19 ACSR",
  //   "name_alt": "Teal",
  //   "strand_count": "30",
  //   "strand_dia": "3.6068",
  //   "outer_dia": "25.2476",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.1641"
  // },
  // {
  //   "name": "636-18/1 ACSR",
  //   "name_alt": "Kingbird",
  //   "strand_count": "18",
  //   "strand_dia": "4.7752",
  //   "outer_dia": "23.8760",
  //   "core_strand_count": "1",
  //   "core_strand_dia": "4.7752"
  // },
  // {
  //   "name": "636-36/1 ACSR",
  //   "name_alt": "Swift",
  //   "strand_count": "36",
  //   "strand_dia": "3.3757",
  //   "outer_dia": "23.6220",
  //   "core_strand_count": "1",
  //   "core_strand_dia": "3.3757"
  // },
  {
    "name": "636-24/7 ACSR",
    "name_alt": "Rook",
    "strand_count": "24",
    "strand_dia": "4.1351",
    "outer_dia": "24.8158",
    "core_strand_count": "7",
    "core_strand_dia": "2.7559"
  },
  {
    "name": "636-26/7 ACSR",
    "name_alt": "Grosbeak",
    "strand_count": "26",
    "strand_dia": "3.9726",
    "outer_dia": "25.1714",
    "core_strand_count": "7",
    "core_strand_dia": "3.0886"
  },
  // {
  //   "name": "636-30/7 ACSR",
  //   "name_alt": "Scoter",
  //   "strand_count": "30",
  //   "strand_dia": "3.6982",
  //   "outer_dia": "25.8826",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.6982"
  // },
  // {
  //   "name": "636-30/19 ACSR",
  //   "name_alt": "Egret",
  //   "strand_count": "30",
  //   "strand_dia": "3.6982",
  //   "outer_dia": "25.8826",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.2200"
  // },
  // {
  //   "name": "666.6-24/7 ACSR",
  //   "name_alt": "Flamingo",
  //   "strand_count": "24",
  //   "strand_dia": "4.2342",
  //   "outer_dia": "25.4000",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.8219"
  // },
  // {
  //   "name": "666.6-26/7 ACSR",
  //   "name_alt": "Gannet",
  //   "strand_count": "26",
  //   "strand_dia": "4.0665",
  //   "outer_dia": "25.7556",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.1623"
  // },
  // {
  //   "name": "715.5-24/7 ACSR",
  //   "name_alt": "Stilt",
  //   "strand_count": "24",
  //   "strand_dia": "4.3866",
  //   "outer_dia": "26.3144",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.9235"
  // },
  // // {
  //   "name": "715.5-26/7 ACSR",
  //   "name_alt": "Starling",
  //   "strand_count": "26",
  //   "strand_dia": "4.2139",
  //   "outer_dia": "26.6954",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.2766"
  // },
  // {
  //   "name": "715.5-30/19 ACSR",
  //   "name_alt": "Redwing",
  //   "strand_count": "30",
  //   "strand_dia": "3.9218",
  //   "outer_dia": "27.4574",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.3546"
  // },
  // {
  //   "name": "795-36/1 ACSR",
  //   "name_alt": "Coot",
  //   "strand_count": "36",
  //   "strand_dia": "3.7744",
  //   "outer_dia": "26.4160",
  //   "core_strand_count": "1",
  //   "core_strand_dia": "3.7744"
  // },
  {
    "name": "795-26/7 ACSR",
    "name_alt": "Drake",
    "strand_count": "26",
    "strand_dia": "4.4425",
    "outer_dia": "28.1178",
    "core_strand_count": "7",
    "core_strand_dia": "3.4544"
  },
  {
    "name": "795-45/7 ACSR",
    "name_alt": "Tern",
    "strand_count": "45",
    "strand_dia": "3.3757",
    "outer_dia": "27.0002",
    "core_strand_count": "7",
    "core_strand_dia": "2.2504"
  },
  // {
  //   "name": "795-54/7 ACSR",
  //   "name_alt": "Condor",
  //   "strand_count": "54",
  //   "strand_dia": "3.0810",
  //   "outer_dia": "27.7368",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.0810"
  // },
  // {
  //   "name": "795-30/19 ACSR",
  //   "name_alt": "Mallard",
  //   "strand_count": "30",
  //   "strand_dia": "4.1351",
  //   "outer_dia": "28.9560",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.4816"
  // },
  // {
  //   "name": "900-45/7 ACSR",
  //   "name_alt": "Ruddy",
  //   "strand_count": "45",
  //   "strand_dia": "3.5916",
  //   "outer_dia": "28.7274",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.3952"
  // },
  // {
  //   "name": "900-54/7 ACSR",
  //   "name_alt": "Canary",
  //   "strand_count": "54",
  //   "strand_dia": "3.2791",
  //   "outer_dia": "29.5148",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.2791"
  // },
  {
    "name": "954-45/7 ACSR",
    "name_alt": "Rail",
    "strand_count": "45",
    "strand_dia": "3.6982",
    "outer_dia": "29.5910",
    "core_strand_count": "7",
    "core_strand_dia": "2.4663"
  },
  {
    "name": "954-54/7 ACSR",
    "name_alt": "Cardinal",
    "strand_count": "54",
    "strand_dia": "3.3757",
    "outer_dia": "30.3784",
    "core_strand_count": "7",
    "core_strand_dia": "3.3757"
  },
  // {
  //   "name": "1033.5-45/7 ACSR",
  //   "name_alt": "Ortolan",
  //   "strand_count": "45",
  //   "strand_dia": "3.8481",
  //   "outer_dia": "30.7848",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.5654"
  // },
  {
    "name": "1033.5-54/7 ACSR",
    "name_alt": "Curlew",
    "strand_count": "54",
    "strand_dia": "3.5128",
    "outer_dia": "31.6230",
    "core_strand_count": "7",
    "core_strand_dia": "3.5128"
  },
  {
    "name": "1113-45/7 ACSR",
    "name_alt": "Bluejay",
    "strand_count": "45",
    "strand_dia": "3.9954",
    "outer_dia": "31.9532",
    "core_strand_count": "7",
    "core_strand_dia": "2.6619"
  },
  // {
  //   "name": "1113-54/19 ACSR",
  //   "name_alt": "Finch",
  //   "strand_count": "54",
  //   "strand_dia": "3.6474",
  //   "outer_dia": "32.8168",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.1869"
  // },
  // {
  //   "name": "1192.5-45/7 ACSR",
  //   "name_alt": "Bunting",
  //   "strand_count": "45",
  //   "strand_dia": "4.1351",
  //   "outer_dia": "33.0708",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.7559"
  // },
  // {
  //   "name": "1192.5-54/19 ACSR",
  //   "name_alt": "Grackle",
  //   "strand_count": "54",
  //   "strand_dia": "3.7744",
  //   "outer_dia": "33.9598",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.2657"
  // },
  {
    "name": "1272-45/7 ACSR",
    "name_alt": "Bittern",
    "strand_count": "45",
    "strand_dia": "4.2697",
    "outer_dia": "34.1630",
    "core_strand_count": "7",
    "core_strand_dia": "2.8473"
  },
  // {
  //   "name": "1272-54/19 ACSR",
  //   "name_alt": "Pheasant",
  //   "strand_count": "54",
  //   "strand_dia": "3.8989",
  //   "outer_dia": "35.0774",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.3393"
  // },
  // {
  //   "name": "1351.5-45/7 ACSR",
  //   "name_alt": "Dipper",
  //   "strand_count": "45",
  //   "strand_dia": "4.4018",
  //   "outer_dia": "35.2044",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.9337"
  // },
  // {
  //   "name": "1351.5-54/19 ACSR",
  //   "name_alt": "Martin",
  //   "strand_count": "54",
  //   "strand_dia": "4.0183",
  //   "outer_dia": "36.1696",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.4105"
  // },
  // {
  //   "name": "1431-45/7 ACSR",
  //   "name_alt": "Bobolink",
  //   "strand_count": "45",
  //   "strand_dia": "4.5288",
  //   "outer_dia": "36.2458",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "3.0201"
  // },
  {
    "name": "1590-45/7 ACSR",
    "name_alt": "Lapwing",
    "strand_count": "45",
    "strand_dia": "4.7752",
    "outer_dia": "38.2016",
    "core_strand_count": "7",
    "core_strand_dia": "3.1826"
  },
  {
    "name": "1590-54/19 ACSR",
    "name_alt": "Falcon",
    "strand_count": "54",
    "strand_dia": "4.3586",
    "outer_dia": "39.2176",
    "core_strand_count": "19",
    "core_strand_dia": "2.6162"
  },
  // {
  //   "name": "1780-84/19 ACSR",
  //   "name_alt": "Chukar",
  //   "strand_count": "84",
  //   "strand_dia": "3.6982",
  //   "outer_dia": "40.6908",
  //   "core_strand_count": "19",
  //   "core_strand_dia": "2.2200"
  // },
  {
    "name": "2156-84/19 ACSR",
    "name_alt": "Bluebird",
    "strand_count": "84",
    "strand_dia": "4.0691",
    "outer_dia": "44.7548",
    "core_strand_count": "19",
    "core_strand_dia": "2.4435"
  },
  // {
  //   "name": "2167-72/7 ACSR",
  //   "name_alt": "Kiwi",
  //   "strand_count": "72",
  //   "strand_dia": "4.4069",
  //   "outer_dia": "44.0690",
  //   "core_strand_count": "7",
  //   "core_strand_dia": "2.9388"
  // }
]

const materialData = [
  {
    "type": "Copper",
    "temp_reference": 20,
    "resistivity": 0.0000000168,
    "temp_coef_of_resistivity": 0.00393,
    "permeability_relative": 0.999994,
    "permittivity_relative": 1.0,
    "conductivity": 58.0 
  },
  {
    "type": "Aluminum",
    "temp_reference": 20,
    "resistivity": 0.0000000282,
    "temp_coef_of_resistivity": 0.0039,
    "permeability_relative": 1.000022,
    "permittivity_relative": 1.0,
    "conductivity": 35.0
  },
  {
    "type": "Steel(1020)",
    "temp_reference": 20,
    "resistivity": 0.16,
    "temp_coef_of_resistivity": 0.0006,
    "permeability_relative": 1.00001,
    "permittivity_relative": 1.0,
    "conductivity": 6.38
  }
]

describe("ACSR Conductor Tests", () => {


  function handleGetConductor(name, material, coreMaterial) {
    const conductor = conductorData.find(c => c.name === name);
    if (!conductor) {
      throw new Error(`Conductor ${name} not found`);
    }
    const materialCond = materialData.find(m => m.type === material);
    const coreMaterialCond = materialData.find(m => m.type === coreMaterial);

    const arrangement = createConductor(conductor, materialCond, coreMaterialCond)
    const testAgainst = conductorTestAgainst.find(c => c.condName === conductor.name_alt);

    if (!testAgainst) {
      throw new Error(`Test data for conductor ${conductor.name_alt} not found`);
    }

    return {arrangement, testAgainst};
  }

  describe("2ACSR Conductor Tests", () => {


    it("calculates each conductor", () => {
      const MmToFt = 0.3048;
      const mmToMile= 0.000621371;
      const gmd = 304.8 //mm 1ft = 304.8
      const frequency = 60; // Hz

      const percDiffs = []

      conductorData.forEach(conductor => {
        const {arrangement, testAgainst} = handleGetConductor(conductor.name, "Aluminum", "Steel(1020)");

        const thisObj = {
          name: conductor.name,
        }

        for (const temp of [25, 50, 75]) {
          const rlc = calculateRLC(frequency, temp, gmd, [arrangement]);
          
          const maxR = Math.max(...rlc.rpk);
          const calcR = maxR * MmToFt;
          const calcL = rlc.totalXlpk * MmToFt;
          const calcC = rlc.totalXcpk * MmToFt / 100000000000; // convert to megaohm

          const r_diff = Math.abs(calcR - testAgainst[`R_60_${temp}`]) / testAgainst[`R_60_${temp}`] * 100;
          const l_diff = Math.abs(calcL - testAgainst[`L_60_${temp}`]) / testAgainst[`L_60_${temp}`] * 100;

          if (temp === 25) {
            const C_diff = Math.abs(calcC - testAgainst.C_60) / testAgainst.C_60 * 100;
            thisObj[`C_60`] = C_diff.toFixed(2);
          }

          thisObj[`R_60_${temp}`] = r_diff.toFixed(2);
          thisObj[`L_60_${temp}`] = l_diff.toFixed(2);
        }
        percDiffs.push(thisObj);
      });

      // console.table(percDiffs);
    });

    // it("calculates 2-6/1 ACSR at 1', 25C, 60hz", () => {
    //   const {arrangement, testAgainst} = handleGetConductor("2-6/1 ACSR", "Aluminum", "Steel(1020)");

    //   const frequency = 60; // Hz
    //   const temperature = 25; // Celsius
    //   const gmd = 304.8 //mm 1ft = 304.8mm
      
    //   const MmToFt = 0.3048;
    //   const mmToMile= 0.000621371;

    //   const rlc = calculateRLC(frequency, temperature, gmd, [arrangement]);

    //   const maxR = Math.max(...rlc.rpk);

    //   const calcR = maxR*MmToFt;
    //   const calcL = rlc.totalXlpk*MmToFt;
    //   const calcC = rlc.totalXcpk*MmToFt/100000000000;

    //   try {
    //     expect(calcR).toBeCloseTo(testAgainst.R_60_25, 2);
    //     expect(calcL).toBeCloseTo(testAgainst.L_60_25, 2);
    //     expect(calcC).toBeCloseTo(testAgainst.C_60, 2);
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.error(`\nComparison failed for 2-6/1 ACSR at 1', 25C, 60hz: \n
    //       Resistance: calc=${calcR}, expected=${testAgainst.R_60_25} \n
    //       Inductive Reactance: calc=${calcL}, expected=${testAgainst.L_60_25} \n
    //       Capacitive Reactance: calc=${calcC}, expected=${testAgainst.C_60} \n
    //     `);
    //     throw e;
    //   }
    // });

    // it("calculates 2-6/1 ACSR at 1', 50C, 60hz", () => {
    //   const {arrangement, testAgainst} = handleGetConductor("2-6/1 ACSR", "Aluminum", "Steel(1020)");

    //   const frequency = 60; // Hz
    //   const temperature = 50; // Celsius
    //   const gmd = 304.8 //mm 1ft = 304.8mm
      
    //   const MmToFt = 0.3048;
    //   const mmToMile= 0.000621371;

    //   const rlc = calculateRLC(frequency, temperature, gmd, [arrangement]);

    //   const maxR = Math.max(...rlc.rpk);

    //   const calcR = maxR*MmToFt;
    //   const calcL = rlc.totalXlpk*MmToFt;
    //   const calcC = rlc.totalXcpk*MmToFt/100000000000;

    //   try {
    //     expect(calcR).toBeCloseTo(testAgainst.R_60_50, 2);
    //     expect(calcL).toBeCloseTo(testAgainst.L_60_50, 2);
    //     expect(calcC).toBeCloseTo(testAgainst.C_60,2); // convert to/from megaohm
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.error(`\nComparison failed for 2-6/1 ACSR at 1', 50C, 60hz: \n
    //       Resistance: calc=${calcR}, expected=${testAgainst.R_60_50} \n
    //       Inductive Reactance: calc=${calcL}, expected=${testAgainst.L_60_50} \n
    //       Capacitive Reactance: calc=${calcC}, expected=${testAgainst.C_60} \n
    //     `);
    //     throw e;
    //   }
    // });

    // it("calculates 2-6/1 ACSR at 1', 75C, 60hz", () => {
    //   const {arrangement, testAgainst} = handleGetConductor("2-6/1 ACSR", "Aluminum", "Steel(1020)");

    //   const frequency = 60; // Hz
    //   const temperature = 75; // Celsius
    //   const gmd = 304.8 //mm 1ft = 304.8mm
      
    //   const MmToFt = 0.3048;
    //   const mmToMile= 0.000621371;

    //   const rlc = calculateRLC(frequency, temperature, gmd, [arrangement]);

    //   const maxR = Math.max(...rlc.rpk);

    //   const calcR = maxR*MmToFt;
    //   const calcL = rlc.totalXlpk*MmToFt;
    //   const calcC = rlc.totalXcpk*MmToFt/100000000000;

    //   try {
    //     expect(calcR).toBeCloseTo(testAgainst.R_60_75, 2);
    //     expect(calcL).toBeCloseTo(testAgainst.L_60_75, 2);
    //     expect(calcC).toBeCloseTo(testAgainst.C_60, 2); // convert to/from megaohm
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.error(`\nComparison failed for 2-6/1 ACSR at 1', 75C, 60hz: \n
    //       Resistance: calc=${calcR}, expected=${testAgainst.R_60_75} \n
    //       Inductive Reactance: calc=${calcL}, expected=${testAgainst.L_60_75} \n
    //       Capacitive Reactance: calc=${calcC}, expected=${testAgainst.C_60} \n
    //     `);
    //     throw e;
    //   }
    // });

    // it("calculates 2-7/1 ACSR at 1', 25C, 60hz", () => { 
    //   const {arrangement, testAgainst} = handleGetConductor("2-7/1 ACSR", "Aluminum", "Steel(1020)");

    //   const frequency = 60; // Hz
    //   const temperature = 25; // Celsius
    //   const gmd = 304.8 //mm 1ft = 304.8mm
      
    //   const MmToFt = 0.3048;
    //   const mmToMile= 0.000621371;

    //   const rlc = calculateRLC(frequency, temperature, gmd, [arrangement]);

    //   const maxR = Math.max(...rlc.rpk);

    //   const calcR = maxR*MmToFt;
    //   const calcL = rlc.totalXlpk*MmToFt;
    //   const calcC = rlc.totalXcpk*MmToFt/100000000000;

    //   try {
    //     expect(calcR).toBeCloseTo(testAgainst.R_60_25, 2);
    //     expect(calcL).toBeCloseTo(testAgainst.L_60_25, 2);
    //     expect(calcC).toBeCloseTo(testAgainst.C_60, 2); // convert to/from megaohm
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.error(`\nComparison failed for 2-7/1 ACSR at 1', 25C, 60hz: \n
    //       Resistance: calc=${calcR}, expected=${testAgainst.R_60_25} \n
    //       Inductive Reactance: calc=${calcL}, expected=${testAgainst.L_60_25} \n
    //       Capacitive Reactance: calc=${calcC}, expected=${testAgainst.C_60} \n
    //     `);
    //     throw e;
    //   }
    // });

    // it("calculates 2-7/1 ACSR at 1', 50C, 60hz", () => {
    //   const {arrangement, testAgainst} = handleGetConductor("2-7/1 ACSR", "Aluminum", "Steel(1020)");

    //   const frequency = 60; // Hz
    //   const temperature = 50; // Celsius
    //   const gmd = 304.8 //mm 1ft = 304.8mm
      
    //   const MmToFt = 0.3048;
    //   const mmToMile= 0.000621371;

    //   const rlc = calculateRLC(frequency, temperature, gmd, [arrangement]);

    //   const maxR = Math.max(...rlc.rpk);

    //   const calcR = maxR*MmToFt;
    //   const calcL = rlc.totalXlpk*MmToFt;
    //   const calcC = rlc.totalXcpk*MmToFt/100000000000;

    //   try {
    //     expect(calcR).toBeCloseTo(testAgainst.R_60_50, 2);
    //     expect(calcL).toBeCloseTo(testAgainst.L_60_50, 2);
    //     expect(calcC).toBeCloseTo(testAgainst.C_60, 2);
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.error(`\nComparison failed for 2-7/1 ACSR at 1', 50C, 60hz: \n
    //       Resistance: calc=${calcR}, expected=${testAgainst.R_60_50} \n
    //       Inductive Reactance: calc=${calcL}, expected=${testAgainst.L_60_50} \n
    //       Capacitive Reactance: calc=${calcC}, expected=${testAgainst.C_60} \n
    //     `);
    //     throw e;
    //   }
    // });

    // it("calculates 2-7/1 ACSR at 1', 75C, 60hz", () => {
    //   const {arrangement, testAgainst} = handleGetConductor("2-7/1 ACSR", "Aluminum", "Steel(1020)");

    //   const frequency = 60; // Hz
    //   const temperature = 75; // Celsius
    //   const gmd = 304.8 //mm 1ft = 304.8mm
      
    //   const MmToFt = 0.3048;
    //   const mmToMile= 0.000621371;

    //   const rlc = calculateRLC(frequency, temperature, gmd, [arrangement]);

    //   const maxR = Math.max(...rlc.rpk);

    //   const calcR = maxR*MmToFt;
    //   const calcL = rlc.totalXlpk*MmToFt;
    //   const calcC = rlc.totalXcpk*MmToFt/100000000000;

    //   try {
    //     expect(calcR).toBeCloseTo(testAgainst.R_60_75, 2);
    //     expect(calcL).toBeCloseTo(testAgainst.L_60_75, 2);
    //     expect(calcC).toBeCloseTo(testAgainst.C_60, 2);
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.error(`\nComparison failed for 2-7/1 ACSR at 1', 75C, 60hz: \n
    //       Resistance: calc=${calcR}, expected=${testAgainst.R_60_75} \n
    //       Inductive Reactance: calc=${calcL}, expected=${testAgainst.L_60_75} \n
    //       Capacitive Reactance: calc=${calcC}, expected=${testAgainst.C_60} \n
    //     `);
    //     throw e;
    //   }
    // });
  });
});
