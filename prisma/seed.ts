import 'dotenv/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../lib/generated/prisma/client';

const adapter = new PrismaLibSql({ url: process.env['DATABASE_URL'] ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const checkpoints = [
    {
      id: 'cp001',
      type: 'gps',
      lat: 35.6595,
      lng: 139.7006,
      title: '渋谷駅前広場',
      description: '渋谷の中心、スクランブル交差点そば',
    },
    {
      id: 'cp002',
      type: 'gps',
      lat: 35.6762,
      lng: 139.6994,
      title: '明治神宮',
      description: '都心にある自然豊かな神社',
    },
    {
      id: 'cp003',
      type: 'marker',
      markerImageUrl: '/api/qr/cp003',
      title: '神社の記念石碑',
      description: 'マーカーをカメラで読み取ってスタンプゲット',
    },
    {
      id: 'cp004',
      type: 'marker',
      markerImageUrl: '/api/qr/cp004',
      title: '商店街の特別看板',
      description: 'マーカーをカメラで読み取ってスタンプゲット',
    },
  ];

  for (const cp of checkpoints) {
    await prisma.checkpoint.upsert({
      where: { id: cp.id },
      update: cp,
      create: cp,
    });
  }

  console.log('✅ Seeded 4 checkpoints');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
