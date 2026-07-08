import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Trip } from '../trips/trip.entity';
import { TripPoi } from '../trips/trip-poi.entity';
import { Poi } from '../pois/poi.entity';

const poisData = [
  {
    id: 'poi-1',
    name: '故宫博物院',
    type: 'scenic',
    city: '北京',
    address: '北京市东城区景山前街4号',
    description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
    latitude: 39.9163,
    longitude: 116.3972,
    rating: 4.8,
    duration: '3-4小时',
    price: 60,
    image: 'https://picsum.photos/seed/tuji101/800/600',
    tags: '历史,文化,5A景区',
  },
  {
    id: 'poi-2',
    name: '八达岭长城',
    type: 'scenic',
    city: '北京',
    address: '北京市延庆区八达岭镇',
    description: '万里长城的代表段落之一，是明长城中保存最完整的一段。',
    latitude: 40.3652,
    longitude: 116.6044,
    rating: 4.7,
    duration: '4-5小时',
    price: 45,
    image: 'https://picsum.photos/seed/tuji103/800/600',
    tags: '历史,自然,5A景区',
  },
  {
    id: 'poi-3',
    name: '北京烤鸭店',
    type: 'food',
    city: '北京',
    address: '北京市东城区前门大街32号',
    description: '正宗北京烤鸭，皮脆肉嫩，香气四溢。',
    latitude: 39.9042,
    longitude: 116.4074,
    rating: 4.6,
    duration: '1-2小时',
    price: 200,
    image: 'https://picsum.photos/seed/tuji104/800/600',
    tags: '北京菜,烤鸭,老字号',
  },
  {
    id: 'poi-4',
    name: '天坛公园',
    type: 'scenic',
    city: '北京',
    address: '北京市东城区天坛路甲1号',
    description: '明清两代帝王祭天、祈谷的场所，建筑宏伟壮观。',
    latitude: 39.9432,
    longitude: 116.4107,
    rating: 4.7,
    duration: '2-3小时',
    price: 34,
    image: 'https://picsum.photos/seed/tuji105/800/600',
    tags: '历史,文化,公园',
  },
  {
    id: 'poi-5',
    name: '王府井步行街',
    type: 'shopping',
    city: '北京',
    address: '北京市东城区王府井大街',
    description: '北京最繁华的商业街之一，集购物、美食、娱乐于一体。',
    latitude: 39.9173,
    longitude: 116.4095,
    rating: 4.5,
    duration: '2-3小时',
    price: 0,
    image: 'https://picsum.photos/seed/tuji106/800/600',
    tags: '购物,美食,商业街',
  },
  {
    id: 'poi-6',
    name: '颐和园',
    type: 'scenic',
    city: '北京',
    address: '北京市海淀区新建宫门路19号',
    description: '中国现存最大的皇家园林，集江南园林精华于一身。',
    latitude: 39.9999,
    longitude: 116.2708,
    rating: 4.8,
    duration: '3-4小时',
    price: 30,
    image: 'https://picsum.photos/seed/tuji107/800/600',
    tags: '历史,园林,5A景区',
  },
  {
    id: 'poi-7',
    name: '北京王府半岛酒店',
    type: 'hotel',
    city: '北京',
    address: '北京市东城区王府井金宝街8号',
    description: '五星级酒店，位于王府井商业区，交通便利，服务一流。',
    latitude: 39.9175,
    longitude: 116.413,
    rating: 4.9,
    duration: '全天',
    price: 1500,
    image: 'https://picsum.photos/seed/tuji108/800/600',
    tags: '五星,豪华,商务',
  },
  {
    id: 'poi-8',
    name: '圆明园',
    type: 'scenic',
    city: '北京',
    address: '北京市海淀区清华西路28号',
    description: '清代大型皇家园林，有"万园之园"之称。',
    latitude: 40.0105,
    longitude: 116.2988,
    rating: 4.6,
    duration: '2-3小时',
    price: 25,
    image: 'https://picsum.photos/seed/tuji111/800/600',
    tags: '历史,遗址,公园',
  },
];

const tripsData = [
  {
    id: 'trip-1',
    name: '北京文化之旅',
    destination: '北京',
    days: 3,
    nights: 2,
    people: 2,
    startDate: '2026-07-15',
    status: 'planning',
    coverImage: 'https://picsum.photos/seed/tuji109/800/600',
    budget: 3000,
    spent: 500,
  },
];

const tripPoisData = [
  { tripId: 'trip-1', name: '故宫博物院', type: 'scenic', duration: '3-4小时', price: 60, image: 'https://picsum.photos/seed/tuji101/800/600', latitude: 39.9163, longitude: 116.3972, day: 1, order: 1, originalPoiId: 'poi-1' },
  { tripId: 'trip-1', name: '北京烤鸭店', type: 'food', duration: '1-2小时', price: 200, image: 'https://picsum.photos/seed/tuji104/800/600', latitude: 39.9042, longitude: 116.4074, day: 1, order: 2, originalPoiId: 'poi-3' },
  { tripId: 'trip-1', name: '天坛公园', type: 'scenic', duration: '2-3小时', price: 34, image: 'https://picsum.photos/seed/tuji105/800/600', latitude: 39.9432, longitude: 116.4107, day: 1, order: 3, originalPoiId: 'poi-4' },
  { tripId: 'trip-1', name: '八达岭长城', type: 'scenic', duration: '4-5小时', price: 45, image: 'https://picsum.photos/seed/tuji103/800/600', latitude: 40.3652, longitude: 116.6044, day: 2, order: 1, originalPoiId: 'poi-2' },
  { tripId: 'trip-1', name: '王府井步行街', type: 'shopping', duration: '2-3小时', price: 0, image: 'https://picsum.photos/seed/tuji106/800/600', latitude: 39.9173, longitude: 116.4095, day: 2, order: 2, originalPoiId: 'poi-5' },
  { tripId: 'trip-1', name: '颐和园', type: 'scenic', duration: '3-4小时', price: 30, image: 'https://picsum.photos/seed/tuji107/800/600', latitude: 39.9999, longitude: 116.2708, day: 3, order: 1, originalPoiId: 'poi-6' },
  { tripId: 'trip-1', name: '圆明园', type: 'scenic', duration: '2-3小时', price: 25, image: 'https://picsum.photos/seed/tuji111/800/600', latitude: 40.0105, longitude: 116.2988, day: 3, order: 2, originalPoiId: 'poi-8' },
];

export async function seedDatabase(app: INestApplication) {
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const tripRepo = app.get<Repository<Trip>>(getRepositoryToken(Trip));
  const tripPoiRepo = app.get<Repository<TripPoi>>(getRepositoryToken(TripPoi));
  const poiRepo = app.get<Repository<Poi>>(getRepositoryToken(Poi));

  const userCount = await userRepo.count();
  if (userCount > 0) {
    console.log('📦 数据库已存在数据，跳过种子初始化');
    return;
  }

  console.log('🌱 正在初始化种子数据...');

  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await userRepo.save({
    phone: '13800138000',
    name: '测试用户',
    password: hashedPassword,
    avatar: 'https://picsum.photos/seed/user1/200/200',
    email: 'test@tuji.com',
    isVerified: true,
  });

  for (const poi of poisData) {
    await poiRepo.save(poi as any);
  }

  for (const trip of tripsData) {
    await tripRepo.save({ ...trip, userId: user.id } as any);
  }

  for (const poi of tripPoisData) {
    await tripPoiRepo.save(poi as any);
  }

  console.log('✅ 种子数据初始化完成');
  console.log('   📱 测试账号: 13800138000');
  console.log('   🔑 测试密码: 123456');
}
