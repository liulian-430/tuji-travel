export interface POI {
  id: string;
  name: string;
  city: string;
  address: string;
  type: 'scenic' | 'food' | 'hotel' | 'shopping';
  rating: number;
  price: number;
  openTime: string;
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  days: number;
  nights: number;
  people: number;
  startDate: string;
  status: 'planning' | 'ongoing' | 'completed';
  coverImage: string;
  createdAt: string;
}

export interface DaySchedule {
  id: string;
  tripId: string;
  dayIndex: number;
  date: string;
  items: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  poiId: string;
  poi: POI;
  startTime: string;
  endTime: string;
  type: 'scenic' | 'food' | 'hotel' | 'transport' | 'shopping';
}

export interface Budget {
  id: string;
  tripId: string;
  totalBudget: number;
  transportation: number;
  accommodation: number;
  food: number;
  ticket: number;
  shopping: number;
  other: number;
}

export interface Expense {
  id: string;
  tripId: string;
  category: 'transportation' | 'accommodation' | 'food' | 'ticket' | 'shopping' | 'other';
  amount: number;
  date: string;
  note: string;
}

export const mockPOIs: POI[] = [
  {
    id: '1',
    name: '故宫博物院',
    city: '北京',
    address: '北京市东城区景山前街4号',
    type: 'scenic',
    rating: 4.8,
    price: 60,
    openTime: '08:30-17:00',
    description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
    images: [
      'https://picsum.photos/seed/tuji101/800/600',
      'https://picsum.photos/seed/tuji102/800/600',
    ],
    latitude: 39.9163,
    longitude: 116.3972,
  },
  {
    id: '2',
    name: '八达岭长城',
    city: '北京',
    address: '北京市延庆区八达岭镇',
    type: 'scenic',
    rating: 4.7,
    price: 45,
    openTime: '07:00-18:00',
    description: '万里长城的代表段落之一，是明长城中保存最完整的一段。',
    images: [
      'https://picsum.photos/seed/tuji103/800/600',
    ],
    latitude: 40.3652,
    longitude: 116.6044,
  },
  {
    id: '3',
    name: '北京烤鸭店',
    city: '北京',
    address: '北京市东城区前门大街32号',
    type: 'food',
    rating: 4.6,
    price: 200,
    openTime: '10:00-22:00',
    description: '正宗北京烤鸭，皮脆肉嫩，香气四溢。',
    images: [
      'https://picsum.photos/seed/tuji104/800/600',
    ],
    latitude: 39.9042,
    longitude: 116.4074,
  },
  {
    id: '4',
    name: '天坛公园',
    city: '北京',
    address: '北京市东城区天坛路甲1号',
    type: 'scenic',
    rating: 4.7,
    price: 34,
    openTime: '06:00-21:00',
    description: '明清两代帝王祭天、祈谷的场所，建筑宏伟壮观。',
    images: [
      'https://picsum.photos/seed/tuji105/800/600',
    ],
    latitude: 39.9432,
    longitude: 116.4107,
  },
  {
    id: '5',
    name: '王府井步行街',
    city: '北京',
    address: '北京市东城区王府井大街',
    type: 'shopping',
    rating: 4.5,
    price: 0,
    openTime: '全天开放',
    description: '北京最繁华的商业街之一，集购物、美食、娱乐于一体。',
    images: [
      'https://picsum.photos/seed/tuji106/800/600',
    ],
    latitude: 39.9173,
    longitude: 116.4095,
  },
  {
    id: '6',
    name: '颐和园',
    city: '北京',
    address: '北京市海淀区新建宫门路19号',
    type: 'scenic',
    rating: 4.8,
    price: 30,
    openTime: '06:00-20:00',
    description: '中国现存最大的皇家园林，集江南园林精华于一身。',
    images: [
      'https://picsum.photos/seed/tuji107/800/600',
    ],
    latitude: 39.9999,
    longitude: 116.2708,
  },
  {
    id: '7',
    name: '北京王府半岛酒店',
    city: '北京',
    address: '北京市东城区王府井金宝街8号',
    type: 'hotel',
    rating: 4.9,
    price: 1500,
    openTime: '全天',
    description: '五星级酒店，位于王府井商业区，交通便利，服务一流。',
    images: [
      'https://picsum.photos/seed/tuji108/800/600',
    ],
    latitude: 39.9175,
    longitude: 116.4130,
  },
];

export const mockTrips: Trip[] = [
  {
    id: '1',
    name: '北京文化之旅',
    destination: '北京',
    days: 4,
    nights: 3,
    people: 2,
    startDate: '2026-07-15',
    status: 'planning',
    coverImage: 'https://picsum.photos/seed/tuji109/800/600',
    createdAt: '2026-06-20',
  },
  {
    id: '2',
    name: '上海周末游',
    destination: '上海',
    days: 3,
    nights: 2,
    people: 1,
    startDate: '2026-08-01',
    status: 'planning',
    coverImage: 'https://picsum.photos/seed/tuji110/800/600',
    createdAt: '2026-06-25',
  },
];

export const mockDaySchedules: DaySchedule[] = [
  {
    id: '1',
    tripId: '1',
    dayIndex: 1,
    date: '2026-07-15',
    items: [
      {
        id: '1-1',
        poiId: '1',
        poi: mockPOIs[0],
        startTime: '09:00',
        endTime: '12:00',
        type: 'scenic',
      },
      {
        id: '1-2',
        poiId: '3',
        poi: mockPOIs[2],
        startTime: '12:30',
        endTime: '14:00',
        type: 'food',
      },
      {
        id: '1-3',
        poiId: '4',
        poi: mockPOIs[3],
        startTime: '15:00',
        endTime: '18:00',
        type: 'scenic',
      },
    ],
  },
  {
    id: '2',
    tripId: '1',
    dayIndex: 2,
    date: '2026-07-16',
    items: [
      {
        id: '2-1',
        poiId: '2',
        poi: mockPOIs[1],
        startTime: '08:00',
        endTime: '14:00',
        type: 'scenic',
      },
      {
        id: '2-2',
        poiId: '5',
        poi: mockPOIs[4],
        startTime: '16:00',
        endTime: '19:00',
        type: 'shopping',
      },
    ],
  },
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    tripId: '1',
    totalBudget: 5000,
    transportation: 1000,
    accommodation: 1500,
    food: 1000,
    ticket: 500,
    shopping: 500,
    other: 500,
  },
];

export const mockExpenses: Expense[] = [
  { id: '1', tripId: '1', category: 'transportation', amount: 450, date: '2026-07-15', note: '机票' },
  { id: '2', tripId: '1', category: 'accommodation', amount: 600, date: '2026-07-15', note: '酒店押金' },
  { id: '3', tripId: '1', category: 'food', amount: 200, date: '2026-07-15', note: '午餐' },
  { id: '4', tripId: '1', category: 'ticket', amount: 120, date: '2026-07-15', note: '故宫门票' },
];

export const hotCities = [
  { id: '1', name: '北京', image: 'https://picsum.photos/seed/tuji111/400/300' },
  { id: '2', name: '上海', image: 'https://picsum.photos/seed/tuji112/400/300' },
  { id: '3', name: '成都', image: 'https://picsum.photos/seed/tuji113/400/300' },
  { id: '4', name: '杭州', image: 'https://picsum.photos/seed/tuji114/400/300' },
  { id: '5', name: '西安', image: 'https://picsum.photos/seed/tuji115/400/300' },
];

export const travelPreferences = [
  { id: '1', name: '自然风光', icon: 'Mountain', color: 'text-green-500' },
  { id: '2', name: '历史文化', icon: 'Building', color: 'text-amber-500' },
  { id: '3', name: '美食探店', icon: 'Utensils', color: 'text-red-500' },
  { id: '4', name: '城市漫步', icon: 'MapPin', color: 'text-blue-500' },
  { id: '5', name: '亲子乐园', icon: 'Baby', color: 'text-pink-500' },
  { id: '6', name: '购物娱乐', icon: 'ShoppingBag', color: 'text-purple-500' },
];
